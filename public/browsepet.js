const API_BASE_URL = window.location.origin.includes('localhost')
  ? 'http://localhost:4000'
  : 'https://four09-capestone-project-u9y7.onrender.com';

// Update API calls
document.addEventListener('DOMContentLoaded', () => {
  // Fetch locations
  fetch(`${API_BASE_URL}/api/locations`)
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

  filterButton(); // Load pets on page load
});

function filterButton() {
  const filters = {
    breed: document.getElementById('filterBreed')?.value || '',
    size: document.getElementById('filterSize')?.value || '',
    age: document.getElementById('filterAge')?.value || '',
    location_id: document.getElementById('filterLocation')?.value || '',
    type: document.getElementById('filterType')?.value || '',
    sortBy: document.getElementById('sortBy')?.value || 'name',
    sortOrder: document.getElementById('sortOrder')?.value || 'ASC',
  };

  fetch(`${API_BASE_URL}/api/filterPets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(pets => {
      const petListings = document.getElementById('petListings');
      petListings.textContent = '';
      if (!Array.isArray(pets)) throw new Error('Expected an array');
  
      if (pets.length === 0) {
        petListings.textContent = 'No pets found matching your filters.';
        return;
      }
  
      pets.forEach(pet => {
        const petCard = `
          <div class="col-md-4 mb-4">
            <div class="card">
              <img src="${pet.image}" alt="${pet.name}" class="card-img-top" onerror="this.src='/images/default-pet-image.jpg'">
              <div class="card-body">
                <h5 class="card-title">${pet.name}</h5>
                <p class="card-text">${pet.breed}, ${pet.age}</p>
                <p>Size: ${pet.size}</p>
                <button class="btn btn-primary mt-2" onclick="showPetModal('${pet.name}', '${pet.breed}', '${pet.age}', '${pet.size}', '${pet.image}')">More Information</button>
              </div>
            </div>
          </div>`;
        petListings.innerHTML += petCard;
      });
    })
    .catch(error => {
      console.error('Error fetching pets:', error);
      document.getElementById('petListings').textContent = 'Failed to fetch pets. Please try again later.';
    });
  }  