document.getElementById('adoptionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = {
    pet_name: document.getElementById('petName').value, // Change to pet_name
    user_name: document.getElementById('userName').value, // Change to user_name
    contact_email: document.getElementById('contactEmail').value, // Change to contact_email
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
    const formResponse = document.getElementById('formResponse');
    formResponse.textContent = ''; // Clear any previous messages

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
    const formResponse = document.getElementById('formResponse');
    formResponse.textContent = ''; // Clear any previous messages

    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', 'alert-danger');
    alertDiv.textContent = 'Error submitting form';

    formResponse.appendChild(alertDiv);
  });
});