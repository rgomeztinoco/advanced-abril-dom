const apiUrl = 'https://pokeapi.co/api/v2/';
const mainform = document.querySelector<HTMLFormElement>('#poke-form');
const container = document.querySelector<HTMLDivElement>('.container');
const searchInput = document.querySelector<HTMLInputElement>('#search');
const searchForm = document.querySelector<HTMLFormElement>('#poke-search-form');

if (!mainform || !container || !searchInput || !searchForm) {
  throw new Error('Required elements not found in the DOM');
}

const localStorageType = localStorage.getItem('type');
const localStoragePokemons: ApiShortPokemonResponse[] = JSON.parse(
  localStorage.getItem('pokemons') ?? '[]'
);

type ApiShortPokemonResponse = {
  name: string;
  url: string;
};

type ApiAllResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiShortPokemonResponse[];
};

type ApiTypesResponse = {
  id: number;
  name: string;
  pokemon: {
    slot: number;
    pokemon: ApiShortPokemonResponse;
  }[];
  moves: {
    name: string;
    url: string;
  }[];
};

type ApiPokemonResponse = {
  abilities: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }[];
  base_experience: number;
  cries: {
    latest: string;
    legacy: null;
  };
  forms: {
    name: string;
    url: string;
  }[];
  weight: number;
  height: number;
  id: number;
  name: string;
  species: {
    name: string;
    url: string;
  };
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  sprites: {
    back_default: string;
    front_default: string;
  };
};

let pokemonList: ApiShortPokemonResponse[] = [];

export {};

if (localStorageType && localStoragePokemons) {
  pokemonList = localStoragePokemons;
  mainform.type.value = localStorageType;
  const pokemons = await Promise.all(
    localStoragePokemons.map(async (pokemon) => await createCard(pokemon))
  );

  container.append(...pokemons.map((p) => p.element));
}

function getPokemonsFromResponse(response: ApiAllResponse | ApiTypesResponse) {
  if ('results' in response) {
    return response.results;
  } else if ('pokemon' in response) {
    return response.pokemon.map((p) => p.pokemon);
  } else {
    throw new Error('Unknown API response structure');
  }
}

mainform.addEventListener('submit', async (event) => {
  event.preventDefault();

  const type = mainform.type.value;

  const url =
    type === 'all' ? `${apiUrl}pokemon?limit=100` : `${apiUrl}type/${type}`;

  const response = await fetch(url);
  const data: ApiAllResponse | ApiTypesResponse = await response.json();
  pokemonList = getPokemonsFromResponse(data);
  const pokemons = await Promise.all(
    pokemonList.map(async (pokemon) => await createCard(pokemon))
  );

  localStorage.setItem('type', type);
  localStorage.setItem('pokemons', JSON.stringify(pokemonList));

  container.innerHTML = ''; // Clear previous results
  container.append(...pokemons.map((p) => p.element));
});

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  console.log('submit event triggered');

  const searchValue = searchInput.value.toLowerCase();
  const filteredPokemons = pokemonList.filter((pokemon) => {
    return pokemon.name.toLowerCase().includes(searchValue);
  });

  container.innerHTML = ''; // Clear previous results
  const pokemons = await Promise.all(
    filteredPokemons.map((pokemon) => createCard(pokemon))
  );
  container.append(...pokemons.map((p) => p.element));
});

// debounce pattern
let timeoutID: number;
searchInput.addEventListener('input', async (_event) => {
  console.log('input event triggered');
  clearTimeout(timeoutID);

  timeoutID = setTimeout(() => {
    searchForm.dispatchEvent(new Event('submit'));
  }, 500);
});

async function createCard(pokemon: ApiShortPokemonResponse) {
  const card = document.createElement('article');
  card.classList.add('card');
  card.innerHTML = `
    <h3>${pokemon.name}</h3>
  `;
  const localStorageExtended: string[] = JSON.parse(
    localStorage.getItem('extendedCards') ?? '[]'
  );
  let extended = localStorageExtended.includes(pokemon.name);
  let types;
  let abilities;

  const response = await fetch(`${apiUrl}pokemon/${pokemon.name}`);
  const data: ApiPokemonResponse = await response.json();

  types = data.types.map((type) => type.type.name).join(', ');
  abilities = data.abilities.map((ability) => ability.ability.name).join(', ');

  card.addEventListener('click', () => {
    toggleCard();
  });

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('delete-button');
  deleteButton.addEventListener('click', () => {
    card.remove();

    const pokemons: ApiShortPokemonResponse[] = JSON.parse(
      localStorage.getItem('pokemons') ?? '[]'
    );
    const updatedPokemons = pokemons.filter((p) => p.name !== pokemon.name);
    localStorage.setItem('pokemons', JSON.stringify(updatedPokemons));
  });

  const extentionElement = document.createElement('div');
  extentionElement.innerHTML = `
    <img src="${data.sprites.front_default}" alt="${data.name}">
    <p>Types: ${types}</p>
    <p>Abilities: ${abilities}</p>
    `;

  if (extended) {
    card.append(extentionElement);
  }

  function toggleCard() {
    let extendedCards: string[] = JSON.parse(
      localStorage.getItem('extendedCards') ?? '[]'
    );

    if (extended) {
      extendedCards = extendedCards.filter((name) => name !== pokemon.name);
      extentionElement.remove();
    } else {
      extendedCards.push(pokemon.name);
      card.append(extentionElement);
    }
    extended = !extended;

    localStorage.setItem('extendedCards', JSON.stringify(extendedCards));

    card.append(deleteButton);
  }

  card.append(deleteButton);

  return {
    element: card,
    name: pokemon.name,
    url: pokemon.url,
  };
}
