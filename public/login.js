document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from submitting the traditional way
  
    const formData = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };
  
    // Send a POST request to the backend
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        // Handle login failure
        alert(data.error);  // Show error message
      } else {
        // Handle login success
        alert('Login successful!');
        // Redirect to the dashboard or home page after login
        window.location.href = 'index.html';
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });
  