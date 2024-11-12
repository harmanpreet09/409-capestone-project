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

function filterButton() {
  const breed = document.getElementById('filterBreed').value;
  const size = document.getElementById('filterSize').value;
  const age = document.getElementById('filterAge').value;
  const location_id = document.getElementById('filterLocation').value;
  const sortBy = document.getElementById('sortBy').value;
  const sortOrder = document.getElementById('sortOrder').value;

  const filters = { breed, size, age, location_id, sortBy, sortOrder };

  const petListings = document.getElementById('petListings');
  petListings.textContent = 'Loading pets...';

  fetch('http://localhost:4000/api/filterPets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),
  })
    .then(response => response.json())
    .then(pets => {
      // Clear previous listings
      petListings.textContent = '';

      if (pets.length === 0) {
        const noPetsMsg = document.createElement('p');
        noPetsMsg.textContent = 'No pets found matching your filters.';
        petListings.appendChild(noPetsMsg);
        return;
      }

      pets.forEach(pet => {
        const colDiv = document.createElement('div');
        colDiv.classList.add('col-md-4', 'mb-4');

        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');

        const petImg = document.createElement('img');
        petImg.src = pet.image;
        petImg.alt = pet.name;
        petImg.classList.add('card-img-top');
        petImg.onerror = function() { this.src = '/images/default-pet-image.jpg'; };

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const petTitle = document.createElement('h5');
        petTitle.classList.add('card-title');
        petTitle.textContent = pet.name;

        const petInfo = document.createElement('p');
        petInfo.classList.add('card-text');
        petInfo.textContent = `${pet.breed}, ${pet.age}`;

        const petSize = document.createElement('p');
        petSize.textContent = `Size: ${pet.size}`;

        const moreInfoButton = document.createElement('button');
        moreInfoButton.classList.add('btn', 'btn-primary', 'mt-2');
        moreInfoButton.textContent = 'MORE INFORMATION';
        moreInfoButton.onclick = function() {
          showPetModal(pet.name, pet.breed, pet.age, pet.size, pet.image);
        };

        // Append elements to create the card structure
        cardBody.appendChild(petTitle);
        cardBody.appendChild(petInfo);
        cardBody.appendChild(petSize);
        cardBody.appendChild(moreInfoButton);
        cardDiv.appendChild(petImg);
        cardDiv.appendChild(cardBody);
        colDiv.appendChild(cardDiv);
        petListings.appendChild(colDiv);
      });
    })
    .catch(error => {
      console.error('Error fetching pets:', error);
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Failed to fetch pets. Please try again later.';
      petListings.appendChild(errorMsg);
    });
}

// Function to show pet details in a modal
function showPetModal(name, breed, age, size, image) {
  document.getElementById('petModalLabel').textContent = name;

  const petModalBody = document.getElementById('petModalBody');
  petModalBody.textContent = ''; // Clear previous content

  const petImg = document.createElement('img');
  petImg.src = image;
  petImg.alt = name;
  petImg.classList.add('img-fluid', 'mb-3');
  petImg.onerror = function() { this.src = '/images/default-pet-image.jpg'; };

  const breedPara = document.createElement('p');
  breedPara.textContent = `Breed: ${breed}`;

  const agePara = document.createElement('p');
  agePara.textContent = `Age: ${age}`;

  const sizePara = document.createElement('p');
  sizePara.textContent = `Size: ${size}`;

  petModalBody.appendChild(petImg);
  petModalBody.appendChild(breedPara);
  petModalBody.appendChild(agePara);
  petModalBody.appendChild(sizePara);

  // Set the adoption link in the modal
  document.getElementById('adoptionLink').href = `/how-to.html?petName=${encodeURIComponent(name)}`;

  // Show the modal
  const petModal = new bootstrap.Modal(document.getElementById('petModal'));
  petModal.show();
}
