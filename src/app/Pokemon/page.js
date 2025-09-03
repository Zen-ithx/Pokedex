// src/app/pokemon/page.js
import Image from "next/image";
import Link from "next/link";
// Use a RELATIVE import unless you’ve configured '@' alias (see section 2)
import { listPokemon, idFromUrl, spriteUrl } from "../lib/pokeapi";

export const revalidate = 86400; // revalidate list daily

export default async function PokemonIndexPage() {
  const { results } = await listPokemon({ limit: 1000 });

  const entries = results.map((p) => {
    const id = idFromUrl(p.url);
    return { id, name: p.name, sprite: spriteUrl(id) };
  });

  return (
    <div className="px-4 py-4 space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold tracking-widest">Pokédex</h1>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {entries.map((pk) => (
          <li key={pk.id}>
            <Link
              href={`/pokemon/${pk.id}`}
              className="list-item block rounded-md border border-neutral-800 bg-neutral-900/70 p-3 no-underline text-white visited:text-white hover:text-white hover:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              <div className="text-xs opacity-60 mb-1">#{String(pk.id).padStart(3, "0")}</div>
              <div className="relative aspect-square mb-2">
                <Image
                  src={pk.sprite}
                  alt={pk.name}
                  fill
                  sizes="(max-width:768px) 50vw, (max-width:1200px) 25vw, 15vw"
                  className="object-contain"
                  priority={Number(pk.id) <= 9}
                />
              </div>
              <div className="font-medium capitalize">{pk.name}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
