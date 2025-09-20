import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 86400; // revalidate detail page once per day

// function to get pokemon by id (handles true 404 vs other errors)
async function getPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
    next: { revalidate },
  });
  if (res.status === 404) return null; // only for actual "not found"
  if (!res.ok) throw new Error(`PokeAPI ${res.status}`); // bubble other errors
  return res.json();
}

// small helpers
function pad3(n) {
  const s = String(n);
  return s.length >= 3 ? s : "0".repeat(3 - s.length) + s;
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// colors for pokemon typing
const TYPE_COLORS = {
  normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C",
  grass: "#7AC74C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
  ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
  rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
  steel: "#B7B7CE", fairy: "#D685AD",
};

// change page bg depending on primary/secondary types
function pageBackgroundFor(types) {
  if (!types?.length) return undefined;
  const a = TYPE_COLORS[types[0]] || "#777";
  if (types.length === 1) return a; // mono-type → solid color
  const b = TYPE_COLORS[types[1]] || a; // dual-type → simple gradient
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}

// get the details for the page head (title)
// note: in Next 15, params is async → await it before use
export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Pokédex #${pad3(id)}` };
}

// main detail page
export default async function PokemonDetailPage({ params }) {
  const { id } = await params; // ✅ await once at the top

  // fetch + basic error handling
  let data;
  try {
    data = await getPokemon(id);
  } catch (e) {
    // network/5xx/etc → show a friendly message instead of crashing
    return (
      <div style={{ padding: 24, color: "crimson" }}>
        Couldn’t load Pokémon #{id}. {String(e.message)}
      </div>
    );
  }
  if (!data) return notFound(); // true 404 → go to Next.js not-found UI

  // unpack the bits we care about
  const name = data.name;
  const types = data.types.map((t) => t.type.name);
  const heightM = (data.height / 10).toFixed(1);
  const weightKg = (data.weight / 10).toFixed(1);
  const abilities = data.abilities.map((a) => a.ability.name);
  const stats = data.stats;
  const pageBg = pageBackgroundFor(types);

  // prefer official artwork; fall back to default sprite
  const art =
    data.sprites?.other?.["official-artwork"]?.front_default ||
    data.sprites?.front_default ||
    "";

  return (
    // wire the computed background directly on the detail root
    <div className="detail-main main" style={{ background: pageBg }}>
      {/* top bar: back + name + id */}
      <header className="header">
        <div className="header-wrapper">
          <div className="header-wrap">
            {/* note: link path matches your uppercase folder "Pokemon" */}
            <Link href="/Pokemon" className="back-btn-wrap" aria-label="Back">
              <span className="body1-fonts">←</span>
            </Link>
            <h1 className="body1-fonts">{cap(name)}</h1>
          </div>
          <div className="pokemon-id-wrap">
            <p className="body3-fonts">#{pad3(id)}</p>
          </div>
        </div>
      </header>

      {/* hero artwork */}
      <div className="detail-img-wrapper">
        <Image
          src={art}
          alt={name}
          width={200}
          height={200}
          className="object-contain pixelated"
          priority
        />
      </div>

      {/* white card with type chips, about, and stats */}
      <div className="detail-card-detail-wrapper container">
        {/* type pills */}
        <div className="power-wrapper">
          {types.map((t) => (
            <p key={t} style={{ backgroundColor: TYPE_COLORS[t] || "#777" }}>
              {t}
            </p>
          ))}
        </div>

        {/* about section (weight / height / abilities) */}
        <p className="about-text" style={{ marginTop: 12 }}>About</p>
        <div className="pokemon-detail-wrapper">
          <div className="pokemon-detail">
            <p className="body2-fonts">{weightKg} kg</p>
          </div>
          <div className="pokemon-detail">
            <p className="body2-fonts">{heightM} m</p>
          </div>
          <div className="pokemon-detail move">
            <p className="body2-fonts">
              {abilities.slice(0, 3).map(cap).join(", ")}
            </p>
          </div>
        </div>

        {/* base stats (simple progress bars) */}
        <p className="about-text" style={{ marginTop: 16 }}>Base Stats</p>
        {stats.map((s) => (
          <div key={s.stat.name} className="stats-wrap">
            <p className="caption-fonts stats">{s.stat.name}</p>
            <p className="caption-fonts">{s.base_stat}</p>
            <progress className="progress-bar" value={s.base_stat} max={255} />
          </div>
        ))}
      </div>
    </div>
  );
}
