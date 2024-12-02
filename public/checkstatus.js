document.getElementById('adoptionForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = {
    pet_name: document.getElementById('petName').value,
    user_name: document.getElementById('userName').value,
    contact_email: document.getElementById('contactEmail').value,
    message: document.getElementById('message').value,
  };

  fetch('/api/session')
    .then((response) => response.json())
    .then((data) => {
      const formResponse = document.getElementById('formResponse');
      formResponse.textContent = '';

      if (data.loggedIn) {
        fetch('/api/adoption', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
          .then((response) => response.json())
          .then((data) => {
            const alertDiv = document.createElement('div');
            alertDiv.classList.add('alert');

            if (data.success) {
              alertDiv.classList.add('alert-success');
              alertDiv.textContent = data.message;
              localStorage.removeItem('adoptionFormData');
            } else {
              alertDiv.classList.add('alert-danger');
              alertDiv.textContent = data.error;
            }

            formResponse.appendChild(alertDiv);
          })
          .catch((error) => {
            const alertDiv = document.createElement('div');
            alertDiv.classList.add('alert', 'alert-danger');
            alertDiv.textContent = 'Error submitting form';
            formResponse.appendChild(alertDiv);
          });
      } else {
        fetch('/api/saveFormData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
          .then(() => {
            alert('Please log in to submit an adoption request.');
            window.location.href = '/login.html';
          })
          .catch((error) => console.error('Error saving form data:', error));
      }
    })
    .catch((error) => {
      console.error('Error checking login status:', error);
      const formResponse = document.getElementById('formResponse');
      const alertDiv = document.createElement('div');
      alertDiv.classList.add('alert', 'alert-danger');
      alertDiv.textContent = 'Error checking login status';
      formResponse.appendChild(alertDiv);
    });
});

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/getFormData')
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.formData) {
        const { pet_name, user_name, contact_email, message } = data.formData;
        document.getElementById('petName').value = pet_name || '';
        document.getElementById('userName').value = user_name || '';
        document.getElementById('contactEmail').value = contact_email || '';
        document.getElementById('message').value = message || '';
      }
    })
    .catch((error) => console.error('Error fetching form data:', error));
});
