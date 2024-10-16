document.getElementById('filterBtn').addEventListener('click', function() {
  const breed = document.getElementById('filterBreed').value;
  const size = document.getElementById('filterSize').value;
  const age = document.getElementById('filterAge').value;

  // Send the filter data to the server
  fetch('/api/filterPets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ breed, size, age }),
  })
  .then(response => response.json())
  .then(data => {
    // Clear the existing pet listings
    const petListings = document.getElementById('petListings');
    petListings.innerHTML = '';

    // Populate the pet listings with filtered data
    data.forEach(pet => {
      const petCard = `
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="${pet.image_url}" class="card-img-top" alt="${pet.name}">
            <div class="card-body">
              <h5 class="card-title">${pet.name}</h5>
              <p class="card-text">${pet.breed}, ${pet.age} years old</p>
              <p>Size: ${pet.size}</p>
              <button class="btn btn-outline-primary save-btn">Save to Wishlist</button>
            </div>
          </div>
        </div>
      `;
      petListings.innerHTML += petCard;
    });
  })
  .catch(error => {
    console.error('Error fetching filtered pets:', error);
  });
});
