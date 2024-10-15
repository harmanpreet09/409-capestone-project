document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:3000/api/pets')  // Fetch data from the API
      .then(response => response.json())
      .then(pets => {
        const petListings = document.getElementById('petListings');
        petListings.innerHTML = '';
  
        // Iterate over the pets and generate HTML for each pet
        pets.forEach(pet => {
          const petCard = `
            <div class="col-md-4 mb-4">
              <div class="card">
                <img src="${pet.image}" class="card-img-top" alt="${pet.name}">
                <div class="card-body">
                  <h5 class="card-title">${pet.name}</h5>
                  <p class="card-text">${pet.breed}, ${pet.age} old</p>
                  <p>Size: ${pet.size}</p>
                  <button class="btn btn-outline-primary save-btn">Save to Wishlist</button>
                </div>
              </div>
            </div>
          `;
          petListings.innerHTML += petCard;
        });
      })
      .catch(error => console.error('Error fetching pets:', error));
  });
  