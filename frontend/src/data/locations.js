// frontend/src/data/locations.js

export const states = [
  { value: 'GO', label: 'Goiás' }
  // ✅ No futuro, é só adicionar mais estados aqui
  // { value: 'SP', label: 'São Paulo' },
  // { value: 'RJ', label: 'Rio de Janeiro' },
];

export const citiesByState = {
  GO: [
    { value: 'Goiânia', label: 'Goiânia' },
    { value: 'Aparecida de Goiânia', label: 'Aparecida de Goiânia' },
    { value: 'Senador Canedo', label: 'Senador Canedo' },
    { value: 'Anápolis', label: 'Anápolis' },
    { value: 'Trindade', label: 'Trindade' },
    { value: 'Inhumas', label: 'Inhumas' },
    { value: 'Goianira', label: 'Goianira' }
  ]
  // ✅ No futuro, é só adicionar cidades de outros estados:
  // SP: [
  //   { value: 'São Paulo', label: 'São Paulo' },
  //   { value: 'Campinas', label: 'Campinas' },
  // ],
};

// Função auxiliar para pegar cidades de um estado
export const getCitiesByState = (stateCode) => {
  return citiesByState[stateCode] || [];
};