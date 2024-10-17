document.getElementById('filterBtn').addEventListener('click', function() {
  const breed = document.getElementById('filterBreed').value;
  const size = document.getElementById('filterSize').value;
  const age = document.getElementById('filterAge').value;
  const sortBy = document.getElementById('sortBy').value;  // Get sorting field
  const sortOrder = document.getElementById('sortOrder').value;  // Get sorting order

  // Prepare filters object, including sorting fields
  const filters = { breed, size, age, sortBy, sortOrder };

  console.log('Sending filters and sorting:', filters);  // Log filters and sorting options

  const petListings = document.getElementById('petListings');
  petListings.innerHTML = '<p>Loading pets...</p>';  // Show loading message

  fetch('http://localhost:4000/api/filterPets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),  // Send filter and sorting data to backend
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(pets => {
    console.log('Received pets:', pets);  // Log received pets
    petListings.innerHTML = '';  // Clear existing listings

    if (pets.length === 0) {
      // No pets found, show a message to the user
      petListings.innerHTML = '<p>No pets found matching your filters.</p>';
      return;
    }

    // Display the sorted and filtered pets
    pets.forEach(pet => {
      const petCard = `
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="${pet.image}" class="card-img-top" alt="${pet.name}" onerror="this.src='/images/default-pet-image.jpg'">
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
  .catch(error => {
    console.error('Error fetching pets:', error);
    petListings.innerHTML = '<p>Failed to fetch pets. Please try again later.</p>';
  });
});
