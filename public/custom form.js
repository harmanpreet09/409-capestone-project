document.getElementById('adoptionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Check if the user is logged in
  fetch('/api/session')
    .then(response => response.json())
    .then(data => {
      const formResponse = document.getElementById('formResponse');
      formResponse.textContent = ''; // Clear any previous messages

      if (data.loggedIn) {
        // User is logged in, proceed with form submission
        const formData = {
          pet_name: document.getElementById('petName').value,
          user_name: document.getElementById('userName').value,
          contact_email: document.getElementById('contactEmail').value,
          message: document.getElementById('message').value
        };

        fetch('/api/adoption', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
          const alertDiv = document.createElement('div');
          alertDiv.classList.add('alert');

          if (data.success) {
            alertDiv.classList.add('alert-success');
            alertDiv.textContent = data.message;
          } else {
            alertDiv.classList.add('alert-danger');
            alertDiv.textContent = data.error;
          }

          formResponse.appendChild(alertDiv);
        })
        .catch(error => {
          const alertDiv = document.createElement('div');
          alertDiv.classList.add('alert', 'alert-danger');
          alertDiv.textContent = 'Error submitting form';

          formResponse.appendChild(alertDiv);
        });
      } else {
        // User is not logged in, show error message
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', 'alert-danger');
        alertDiv.textContent = 'Please log in to submit an adoption request.';
        formResponse.appendChild(alertDiv);
      }
    })
    .catch(error => {
      console.error('Error checking login status:', error);
      const formResponse = document.getElementById('formResponse');
      const alertDiv = document.createElement('div');
      alertDiv.classList.add('alert', 'alert-danger');
      alertDiv.textContent = 'Error checking login status';
      formResponse.appendChild(alertDiv);
    });
});
