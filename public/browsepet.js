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
  // Capture the values of all filters
  const breed = document.getElementById('filterBreed')?.value || '';
  const size = document.getElementById('filterSize')?.value || '';
  const age = document.getElementById('filterAge')?.value || '';
  const location_id = document.getElementById('filterLocation')?.value || '';
  const type = document.getElementById('filterType')?.value || '';
  const sortBy = document.getElementById('sortBy')?.value || 'name';
  const sortOrder = document.getElementById('sortOrder')?.value || 'ASC';

  // Prepare the filters object
  const filters = { breed, size, age, location_id, type, sortBy, sortOrder };

  // Display a loading message
  const petListings = document.getElementById('petListings');
  petListings.textContent = 'Loading pets...';

  // Send the filters to the backend
  fetch('http://localhost:4000/api/filterPets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),
  })
    .then(response => response.json())
    .then(pets => {
      console.log('Pets response:', pets);
      petListings.textContent = '';
  
      if (!Array.isArray(pets)) {
        throw new Error('Expected an array but got a different data type');
      }
  
      if (pets.length === 0) {
        const noPetsMsg = document.createElement('p');
        noPetsMsg.textContent = 'No pets found matching your filters.';
        petListings.appendChild(noPetsMsg);
        return;
      }

      // Display each pet card
      pets.forEach(pet => {
        const colDiv = document.createElement('div');
        colDiv.classList.add('col-md-4', 'mb-4');

        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');

        const petImg = document.createElement('img');
        petImg.src = pet.image;
        petImg.alt = pet.name;
        petImg.classList.add('card-img-top');
        petImg.loading = 'lazy';
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

function showPetModal(name, breed, age, size, image) {
  // Set the modal title
  const modalTitle = document.getElementById('petModalLabel');
  modalTitle.textContent = name;

  // Clear any existing content in the modal body
  const modalBody = document.getElementById('petModalBody');
  while (modalBody.firstChild) {
    modalBody.removeChild(modalBody.firstChild);
  }

  // Create and append the image element
  const petImage = document.createElement('img');
  petImage.src = image;
  petImage.alt = name;
  petImage.style.width = '100%';
  petImage.style.marginBottom = '15px';
  modalBody.appendChild(petImage);

  const breedInfo = document.createElement('p');
  breedInfo.textContent = `Breed: ${breed}`;
  modalBody.appendChild(breedInfo);

  const ageInfo = document.createElement('p');
  ageInfo.textContent = `Age: ${age}`;
  modalBody.appendChild(ageInfo);

  const sizeInfo = document.createElement('p');
  sizeInfo.textContent = `Size: ${size}`;
  modalBody.appendChild(sizeInfo);

  // Initialize and show the modal using Bootstrap's modal API
  const petModal = new bootstrap.Modal(document.getElementById('petModal'));
  petModal.show();
}
