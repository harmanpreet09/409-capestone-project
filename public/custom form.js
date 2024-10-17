
document.getElementById('adoptionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = {
    petName: document.getElementById('petName').value,
    userName: document.getElementById('userName').value,
    contactEmail: document.getElementById('contactEmail').value,
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
    if (data.success) {
      document.getElementById('formResponse').innerHTML = `<div class="alert alert-success">${data.message}</div>`;
    } else {
      document.getElementById('formResponse').innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
    }
  })
  .catch(error => {
    document.getElementById('formResponse').innerHTML = `<div class="alert alert-danger">Error submitting form</div>`;
  });
});
