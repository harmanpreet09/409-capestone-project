document.addEventListener('DOMContentLoaded', () => {
    // Check if there's an email stored in sessionStorage
    const storedEmail = sessionStorage.getItem('email');
    if (storedEmail) {
      // Automatically fetch status if email is already stored
      fetchStatus(storedEmail);
    }
  });
  
  document.getElementById('checkStatusForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const email = document.getElementById('checkEmail').value;
    if (email) {
      // Store email in sessionStorage
      sessionStorage.setItem('email', email);
  
      // Fetch status using the entered email
      fetchStatus(email);
    } else {
      alert("Please enter your email.");
    }
  });
  
  function fetchStatus(email) {
    const statusResponse = document.getElementById('statusResponse');
    statusResponse.textContent = ''; // Clear previous messages
  
    fetch('/api/checkStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }), // Pass the email in the request body
    })
    .then(response => response.json())
    .then(data => {
      statusResponse.textContent = ''; // Clear previous messages
  
      if (data.success) {
        if (data.applications.length === 0) {
          statusResponse.textContent = 'No applications found.';
        } else {
          // Display each application with a styled alert box
          data.applications.forEach(app => {
            const statusDiv = document.createElement('div');
            statusDiv.classList.add('alert', 'alert-info', 'mt-2');
            statusDiv.textContent = `Pet: ${app.pet_name} - Status: ${app.status}`;
            statusResponse.appendChild(statusDiv);
          });
        }
      } else {
        // Display error message if there's an issue with the response
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('alert', 'alert-danger', 'mt-2');
        errorDiv.textContent = data.error || 'An unexpected error occurred.';
        statusResponse.appendChild(errorDiv);
      }
    })
    .catch(error => {
      // Handle fetch errors
      statusResponse.textContent = '';
      const errorDiv = document.createElement('div');
      errorDiv.classList.add('alert', 'alert-danger', 'mt-2');
      errorDiv.textContent = 'Error checking status. Please try again later.';
      statusResponse.appendChild(errorDiv);
      console.error('Error:', error);
    });
  }
  