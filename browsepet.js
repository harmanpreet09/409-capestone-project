// Dummy data for filtering functionality
const pets = [
    { name: "Fluffy", breed: "Golden Retriever", size: "Medium", age: "Adult", image: "pet1.jpg" },
    { name: "Max", breed: "Beagle", size: "Small", age: "Puppy/Kitten", image: "pet2.jpg" },
    { name: "Luna", breed: "Persian Cat", size: "Small", age: "Adult", image: "pet3.jpg" },
  ];
  
  document.getElementById("filterBtn").addEventListener("click", function () {
    const breed = document.getElementById("filterBreed").value;
    const size = document.getElementById("filterSize").value;
    const age = document.getElementById("filterAge").value;
  
    const filteredPets = pets.filter((pet) => {
      return (
        (breed === "" || pet.breed === breed) &&
        (size === "" || pet.size === size) &&
        (age === "" || pet.age === age)
      );
    });
  
    displayPets(filteredPets);
  });
  
  function displayPets(filteredPets) {
    const petListings = document.getElementById("petListings");
    petListings.innerHTML = ""; // Clear current listings
  
    filteredPets.forEach((pet) => {
      const petCard = `
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="${pet.image}" class="card-img-top" alt="${pet.name}">
            <div class="card-body">
              <h5 class="card-title">${pet.name}</h5>
              <p class="card-text">${pet.breed}, ${pet.age} years old</p>
              <p>Size: ${pet.size}</p>
              <button class="btn btn-outline-primary save-btn">Save to Wishlist</button>
            </div>
          </div>
        </div>`;
      petListings.innerHTML += petCard;
    });
  }
  
  // Saving to wishlist (for now, just alerting)
  document.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("save-btn")) {
      alert("Pet saved to wishlist!");
    }
  });
  