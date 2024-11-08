document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission behavior
  
    // Collect form data
    const formData = {
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value
    };
  
    // Validate password and confirm password match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    // Send form data to the backend
    fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => {

      return response.json();
    })
    .then(data => {
      if (data.message) {
        alert(data.message); // Show success message or backend message
        // Redirect to homepage on successful signup
        window.location.href = '/'; // Adjust this to your homepage route
      } else if (data.error) {
        alert(data.error); // Show error message from backend
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    });
});
