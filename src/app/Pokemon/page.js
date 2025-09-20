// src/app/Pokemon/page.js
import Image from "next/image";
import Link from "next/link";
import { listPokemon, idFromUrl, spriteUrl } from "../lib/pokeapi";

// fetch the primary type (types[0]) for a Pokémon id; cached for a day
async function getPrimaryType(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.types?.[0]?.type?.name ?? null; // e.g. "fire"
}

// batch with a small concurrency limit, so we don't hammer PokeAPI
async function getPrimaryTypes(ids, concurrency = 32) {
  const out = new Map();
  let i = 0;
  while (i < ids.length) {
    const slice = ids.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      slice.map(async (id) => ({ id, type: await getPrimaryType(id) }))
    );
    results.forEach((r, idx) => {
      const id = slice[idx];
      out.set(id, r.status === "fulfilled" ? r.value.type : null);
    });
    i += concurrency;
  }
  return out; // Map<number, "fire" | "water" | null>
}

// cache this page for a day; ISR will refresh after 24h
export const revalidate = 86400;

export default async function PokemonIndexPage() {
  // fetch a large chunk of Pokémon from PokeAPI (name + url)
  const { results } = await listPokemon({ limit: 1000 });

  // normalize into a render-friendly shape: id, name, and sprite URL
  const entries = results.map((p) => {
    const id = idFromUrl(p.url);
    return { id, name: p.name, sprite: spriteUrl(id) };
  });

  // fetch primary types for the first 151 (keeps initial build snappy)
  const idsToColor = entries.slice(0, 151).map((e) => e.id);
  const typeMap = await getPrimaryTypes(idsToColor, 32);

  return (
    <div className="pokemon-list container">
      <ul className="list-wrapper list-none p-0 m-0">
        {entries.map((pk) => {
          // add a per-type class so CSS can set --tile-color (used by :hover)
          const type = typeMap.get(pk.id); // "fire" | "water" | null
          const typeClass = type ? `type-${type}` : "";

          return (
            <li key={pk.id} className={`list-item ${typeClass}`}>
              <Link href={`/Pokemon/${pk.id}`} className="block no-underline">
                {/* dex number (top-right) */}
                <div className="number-wrap body3-fonts">
                  #{String(pk.id).padStart(3, "0")}
                </div>

                {/* sprite: let the container control size; image fills it */}
                <div className="img-wrap">
                  <Image
                    src={pk.sprite}
                    alt={pk.name}
                    fill
                    sizes="(max-width: 640px) 22vw, (max-width: 1024px) 16vw, 12vw"
                    className="object-contain pixelated"
                    priority={Number(pk.id) <= 9}
                  />
                </div>

                {/* name pill (bottom) */}
                <div className="name-wrap">
                  <p className="body2-fonts">{pk.name}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
