document.getElementById('filterBtn').addEventListener('click', function() {
  const breed = document.getElementById('filterBreed').value;  // Selected breed
  const size = document.getElementById('filterSize').value;    // Selected size
  const age = document.getElementById('filterAge').value;      // Selected age
  const sortBy = document.getElementById('sortBy').value;      // Selected sort option
  const sortOrder = document.getElementById('sortOrder').value; // Selected order (ASC/DESC)

  // Prepare filters object to send to the backend
  const filters = { breed, size, age, sortBy, sortOrder };

  // Update the pet listings
  const petListings = document.getElementById('petListings');
  petListings.innerHTML = '<p>Loading pets...</p>';  // Show loading message while fetching

  // Fetch the pets based on the selected filters and sorting options
  fetch('http://localhost:4000/api/filterPets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),
  })
    .then(response => response.json())
    .then(pets => {
      petListings.innerHTML = '';  // Clear the loading message

      if (pets.length === 0) {
        // If no pets match the filters, display a message
        petListings.innerHTML = '<p>No pets found matching your filters.</p>';
        return;
      }

      // For each pet, generate the HTML structure and display it
      pets.forEach(pet => {
        const petCard = `
          <div class="col-md-4 mb-4">
            <div class="card">
              <img src="${pet.image}" class="card-img-top" alt="${pet.name}" onerror="this.src='/images/default-pet-image.jpg'">
              <div class="card-body">
                <h5 class="card-title">${pet.name}</h5>
                <p class="card-text">${pet.breed}, ${pet.age}</p>
                <p>Size: ${pet.size}</p>
              </div>
            </div>
          </div>
        `;
        petListings.innerHTML += petCard;  // Append each pet card to the listings section
      });
    })
    .catch(error => {
      console.error('Error fetching pets:', error);
      petListings.innerHTML = '<p>Failed to fetch pets. Please try again later.</p>';
    });
});
