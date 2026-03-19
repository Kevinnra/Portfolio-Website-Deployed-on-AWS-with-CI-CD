// Contact Form Handler
// const API_ENDPOINT = 'https://iaw3hfgw1g.execute-api.ap-northeast-1.amazonaws.com/prod/contact';
const API_ENDPOINT = 'https://x51urh1uwd.execute-api.ap-northeast-1.amazonaws.com/prod/contact';


document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const formMessage = document.getElementById('form-message');
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      message: document.getElementById('message').value.trim(),
      honeypot: document.getElementById('honeypot').value // Honeypot field
    };
    
    // Validate
    if (!formData.name || !formData.email || !formData.message) {
      showMessage('Please fill in all fields', 'error');
      return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    formMessage.style.display = 'none';
    
    try {
      // Send to API
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Success
        showMessage(data.message || 'Message sent successfully!', 'success');
        form.reset();
      } else {
        // Error from API
        showMessage(data.error || 'Failed to send message. Please try again.', 'error');
      }
      
    } catch (error) {
      console.error('Error:', error);
      showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  });
  
  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      formMessage.style.display = 'none';
    }, 5000);
  }
});