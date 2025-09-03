const BASE = "https://pokeapi.co/api/v2";

export async function listPokemon({ limit = 1000, offset = 0 } = {}) {
  const res = await fetch(`${BASE}/pokemon?limit=${limit}&offset=${offset}`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("PokeAPI list failed");
  return res.json(); // { results: [{ name, url }], ... }
}

export function idFromUrl(url) {
  // same idea as your split("/")[6], just safer:
  return String(url).split("/").filter(Boolean).pop();
}

// Classic 96px sprite (matches the repo path you linked)
export function spriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

// (Optional) Higher-res official artwork:
// export function artworkUrl(id) {
//   return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
// }
