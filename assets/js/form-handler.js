// Form Handler for Tvaraa Organics
// Sends all forms (contact, quote, newsletter) to Google Apps Script

// 1) PASTE YOUR WEB APP URL HERE:
const FORM_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzZPcaTkazOImXrFXg3iCFZ8Ru1Mk-J22by6I8fw2bI0JXzUMQejvJwHoPHT-tMnbkP/exec';

// Reusable notification (Bootstrap alert style)
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.form-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `form-notification alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// CONTACT FORM
function handleContactForm() {
    const contactForms = document.querySelectorAll('.contact-form');

    contactForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            try {
                const formData = new FormData(form);
                const data = {};

                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }

                // Checkbox for newsletter
                const newsletterCheckbox = form.querySelector('#newsletter');
                data.newsletter = newsletterCheckbox ? newsletterCheckbox.checked : false;

                const payload = Object.assign({ type: 'contact' }, data);

                await fetch(FORM_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // avoid CORS issues from GitHub Pages
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8'
                    },
                    body: JSON.stringify(payload)
                });

                // With no-cors we can't read response; assume success if no error thrown
                showNotification('Thank you! Your message has been sent successfully. We will get back to you soon.', 'success');
                form.reset();
            } catch (error) {
                console.error('Contact form error:', error);
                showNotification('Sorry, there was an error sending your message. Please try again later.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    });
}

// QUOTE FORM
function handleQuoteForm() {
    const quoteForm = document.getElementById('quoteForm');

    if (quoteForm) {
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = quoteForm.querySelector('.submit-form');
            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            try {
                const formData = new FormData(quoteForm);
                const data = {};

                for (let [key, value] of formData.entries()) {
                    if (key === 'services[]' || key === 'certifications[]') {
                        const cleanKey = key.replace('[]', '');
                        if (!data[cleanKey]) data[cleanKey] = [];
                        data[cleanKey].push(value);
                    } else {
                        data[key] = value;
                    }
                }

                const newsletterCheckbox = quoteForm.querySelector('#newsletter');
                data.newsletter = newsletterCheckbox ? newsletterCheckbox.checked : false;

                const ndaCheckbox = quoteForm.querySelector('#nda');
                data.nda = ndaCheckbox ? ndaCheckbox.checked : false;

                const payload = Object.assign({ type: 'quote' }, data);

                await fetch(FORM_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8'
                    },
                    body: JSON.stringify(payload)
                });

                showNotification('Quote request submitted successfully! We will contact you within 48 hours.', 'success');
                quoteForm.reset();

                // Reset multi-step form to step 1
                const firstStep = quoteForm.querySelector('.form-step[data-step="1"]');
                if (firstStep) {
                    quoteForm.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
                    firstStep.classList.add('active');
                    const currentStepSpan = quoteForm.querySelector('.current-step');
                    if (currentStepSpan) currentStepSpan.textContent = '1';
                }
            } catch (error) {
                console.error('Quote form error:', error);
                showNotification('Sorry, there was an error submitting your quote request. Please try again later.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }
}

// NEWSLETTER FORM
function handleNewsletterForm() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');

    newsletterForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            const submitButton = form.querySelector('button[type="submit"]');

            if (!emailInput || !emailInput.value) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            try {
                const payload = {
                    type: 'newsletter',
                    email: emailInput.value,
                    source: form.dataset.source || 'Footer'
                };

                await fetch(FORM_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8'
                    },
                    body: JSON.stringify(payload)
                });

                showNotification('Thank you for subscribing! You will receive updates from us.', 'success');
                form.reset();
            } catch (error) {
                console.error('Newsletter error:', error);
                showNotification('Sorry, there was an error subscribing. Please try again later.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    handleContactForm();
    handleQuoteForm();
    handleNewsletterForm();
});