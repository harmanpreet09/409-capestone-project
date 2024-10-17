document.getElementById('filterBtn').addEventListener('click', function() {
  const breed = document.getElementById('filterBreed').value;
  const size = document.getElementById('filterSize').value;
  const age = document.getElementById('filterAge').value;

  const filters = {};
  if (breed) filters.breed = breed;
  if (size) filters.size = size;
  if (age) filters.age = age;

  console.log('Sending filters:', filters); // Log filters

  fetch('http://localhost:4000/api/filterPets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters), // Send filter data to backend
  })
  .then(response => response.json())
  .then(pets => {
    console.log('Received pets:', pets); // Log received pets
    const petListings = document.getElementById('petListings');
    petListings.innerHTML = ''; // Clear existing listings

    pets.forEach(pet => {
      const petCard = `
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="${pet.image}" class="card-img-top" alt="${pet.name}">
            <div class="card-body">
              <h5 class="card-title">${pet.name}</h5>
              <p class="card-text">${pet.breed}, ${pet.age} years old</p>
              <p>Size: ${pet.size}</p>
             
            </div>
          </div>
        </div>
      `;
      petListings.innerHTML += petCard;
    });
  })
  .catch(error => console.error('Error fetching pets:', error));
});
