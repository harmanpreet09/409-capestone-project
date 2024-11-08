document.getElementById('filterBtn').addEventListener('click', function() {
  filterButton();
  });

  document.addEventListener('DOMContentLoaded', () => {
    // Fetch locations from the backend and populate the location dropdown
    fetch('http://localhost:4000/api/locations')
      .then(response => response.json())
      .then(locations => {
        const locationSelect = document.getElementById('filterLocation');
        locations.forEach(location => {
          const option = document.createElement('option');
          option.value = location.id;
          option.textContent = location.name;
          locationSelect.appendChild(option);
        });
      })
      .catch(error => console.error('Error fetching locations:', error));
  
    // Run initial filter to load pets without filters applied
    filterButton();
  });
  
  document.getElementById('filterBtn').addEventListener('click', function() {
    filterButton();
  });
  
  function filterButton() {
    const breed = document.getElementById('filterBreed').value;
    const size = document.getElementById('filterSize').value;
    const age = document.getElementById('filterAge').value;
    const location_id = document.getElementById('filterLocation').value;
    const sortBy = document.getElementById('sortBy').value;
    const sortOrder = document.getElementById('sortOrder').value;
  
    const filters = { breed, size, age, location_id, sortBy, sortOrder };
  
    const petListings = document.getElementById('petListings');
    petListings.innerHTML = '<p>Loading pets...</p>';
  
    fetch('http://localhost:4000/api/filterPets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    })
      .then(response => response.json())
      .then(pets => {
        petListings.innerHTML = '';
  
        if (pets.length === 0) {
          petListings.innerHTML = '<p>No pets found matching your filters.</p>';
          return;
        }
  
        pets.forEach(pet => {
          const petCard = `
            <div class="col-md-4 mb-4">
              <div class="card">
                <img src="${pet.image}" class="card-img-top" alt="${pet.name}" onerror="this.src='/images/default-pet-image.jpg'">
                <div class="card-body">
                  <h5 class="card-title">${pet.name}</h5>
                  <p class="card-text">${pet.breed}, ${pet.age}</p>
                  <p>Size: ${pet.size}</p>
                  <p>Location: ${pet.location || 'Not specified'}</p>
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
  }
  
  


document.addEventListener('DOMContentLoaded', filterButton, false);
