const apiUrl = 'https://pokeapi.co/api/v2/';
const mainform = document.querySelector('#poke-form');
const container = document.querySelector('.container');
const searchInput = document.querySelector('#search');
const searchForm = document.querySelector('#poke-search-form');

const localStorageType = localStorage.getItem('type');
const localStoragePokemons = JSON.parse(localStorage.getItem('pokemons'));

let pokemonList = [];

if (localStorageType && localStoragePokemons) {
  pokemonList = localStoragePokemons;
  mainform.type.value = localStorageType;
  const pokemons = await Promise.all(
    localStoragePokemons.map(async (pokemon) => await createCard(pokemon))
  );

  container.append(...pokemons.map((p) => p.element));
}

mainform.addEventListener('submit', async (event) => {
  event.preventDefault();

  const type = mainform.type.value;

  const url =
    type === 'all' ? `${apiUrl}pokemon?limit=100` : `${apiUrl}type/${type}`;

  const response = await fetch(url);
  const data = await response.json();
  pokemonList =
    type === 'all' ? data.results : data.pokemon.map((p) => p.pokemon);
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
  const pokemons = filteredPokemons.map((pokemon) => createCard(pokemon));
  container.append(...pokemons.map((p) => p.element));
});

// debounce pattern
let timeoutID;
searchInput.addEventListener('input', async (_event) => {
  console.log('input event triggered');
  clearTimeout(timeoutID);

  timeoutID = setTimeout(() => {
    searchForm.dispatchEvent(new Event('submit'));
  }, 500);
});

async function createCard(pokemon) {
  const card = document.createElement('article');
  card.classList.add('card');
  card.innerHTML = `
    <h3>${pokemon.name}</h3>
  `;
  const localStorageExtended =
    JSON.parse(localStorage.getItem('extendedCards')) || [];
  let extended = localStorageExtended.includes(pokemon.name);
  let types;
  let abilities;

  const response = await fetch(`${apiUrl}pokemon/${pokemon.name}`);
  const data = await response.json();
  types = data.types.map((type) => type.type.name).join(', ');
  abilities = data.abilities.map((ability) => ability.ability.name).join(', ');

  card.addEventListener('click', (event) => {
    toggleCard();
  });

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('delete-button');
  deleteButton.addEventListener('click', (event) => {
    card.remove();

    const pokemons = JSON.parse(localStorage.getItem('pokemons'));
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
    let extendedCards = JSON.parse(localStorage.getItem('extendedCards')) || [];

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
