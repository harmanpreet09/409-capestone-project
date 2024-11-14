document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const formData = {
      userName: document.getElementById('userName').value,
      userEmail: document.getElementById('userEmail').value,
      userMessage: document.getElementById('userMessage').value,
    };
  
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      const formResponse = document.createElement('div');
      formResponse.classList.add('alert', 'mt-3');
  
      if (data.success) {
        formResponse.classList.add('alert-success');
        formResponse.textContent = data.message;
        document.getElementById('contactForm').reset();
      } else {
        formResponse.classList.add('alert-danger');
        formResponse.textContent = data.message || 'Error submitting the form';
      }
  
      const formContainer = document.querySelector('.contact-form-wrapper');
      formContainer.appendChild(formResponse);
    })
    .catch(error => {
      const formResponse = document.createElement('div');
      formResponse.classList.add('alert', 'alert-danger', 'mt-3');
      formResponse.textContent = 'Error submitting the form';
  
      const formContainer = document.querySelector('.contact-form-wrapper');
      formContainer.appendChild(formResponse);
    });
  });
  