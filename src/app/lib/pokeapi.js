//get Pokeapi info

const BASE = "https://pokeapi.co/api/v2";


//function for importing Pokemon and making a list
export async function listPokemon({ limit = 1000, offset = 0 } = {}) {
  const res = await fetch(`${BASE}/pokemon?limit=${limit}&offset=${offset}`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("PokeAPI list failed");
  return res.json(); 
}

//get the Id number from the pokeapi url
export function idFromUrl(url) {

  return String(url).split("/").filter(Boolean).pop();
}

// Classic 96px sprite 
export function spriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}


// return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
