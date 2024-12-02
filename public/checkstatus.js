document.getElementById('checkStatusForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('checkEmail').value;
  if (!email) {
    alert('Please enter your email.');
    return;
  }

  const statusResponse = document.getElementById('statusResponse');
  statusResponse.innerHTML = '<p>Loading...</p>'; // Show a loading message

  fetch('/api/checkStatus', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch status.');
      }
      return response.json();
    })
    .then((data) => {
      statusResponse.innerHTML = ''; // Clear previous messages

      if (data.success) {
        if (data.applications.length === 0) {
          // No applications found
          statusResponse.innerHTML = '<p>No applications found for this email.</p>';
        } else {
          // Display application statuses
          data.applications.forEach((application) => {
            const statusDiv = document.createElement('div');
            statusDiv.classList.add('alert', 'alert-info');
            statusDiv.innerHTML = `
              <strong>Pet Name:</strong> ${application.pet_name}<br>
              <strong>Status:</strong> ${application.status}<br>
              <strong>Submitted On:</strong> ${new Date(application.created_at).toLocaleDateString()}
            `;
            statusResponse.appendChild(statusDiv);
          });
        }
      } else {
        statusResponse.innerHTML = '<p>An error occurred. Please try again later.</p>';
      }
    })
    .catch((error) => {
      console.error(error);
      statusResponse.innerHTML = '<p>Error fetching status. Please try again later.</p>';
    });
});
