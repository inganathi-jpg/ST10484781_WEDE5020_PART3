/* js/script.js
   Handles:
   - Lightbox for gallery images
   - Accordion on Services page
   - Form validation for contact & enquiry
   - Enquiry response simulation
   - Contact form mailto compilation
   - Search/filter for services and blog posts
*/

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------
     LIGHTBOX (gallery)
     ------------------------- */
  (function setupLightbox() {
    const galleryImgs = document.querySelectorAll('.gallery img, .gallery-grid img, img[data-lightbox="true"]');
    if (!galleryImgs.length) return;

    const overlay = document.createElement('div');
    overlay.id = 'lightboxOverlay';
    overlay.innerHTML = `
      <div id="lightboxContent" role="dialog" aria-modal="true">
        <button id="lightboxClose" aria-label="Close">✕</button>
        <img id="lightboxImg" src="" alt="">
        <p id="lightboxCaption"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    const lightboxImg = overlay.querySelector('#lightboxImg');
    const lightboxCaption = overlay.querySelector('#lightboxCaption');

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.id === 'lightboxClose') {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    galleryImgs.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        const srcLarge = img.getAttribute('data-large') || img.src;
        const caption = img.getAttribute('alt') || '';
        lightboxImg.src = srcLarge;
        lightboxImg.alt = caption;
        lightboxCaption.textContent = caption;
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
  })();


  /* -------------------------
     ACCORDION (services)
     ------------------------- */
  (function setupAccordion() {
    const toggles = document.querySelectorAll('.accordion-toggle');
    if (!toggles.length) return;

    toggles.forEach(btn => {
      const panel = btn.nextElementSibling;
      // initialize panels closed
      panel.style.maxHeight = null;
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        // close all siblings? you can implement that if needed
        if (expanded) {
          btn.setAttribute('aria-expanded', 'false');
          panel.style.maxHeight = null;
        } else {
          btn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  })();


  /* -------------------------
     FORM VALIDATION (contact + enquiry)
     ------------------------- */
  function showFieldError(field, message) {
    if (!field) return;
    clearFieldError(field);
    const wrapper = field.parentNode;
    const err = document.createElement('div');
    err.className = 'field-error';
    err.textContent = message;
    wrapper.appendChild(err);
    field.classList.add('invalid-field');
  }

  function clearFieldError(field) {
    if (!field) return;
    const wrapper = field.parentNode;
    const existing = wrapper.querySelector('.field-error');
    if (existing) existing.remove();
    field.classList.remove('invalid-field');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7;
  }

  // CONTACT form
  (function contactHandler() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const name = contactForm.querySelector('input[name="name"]');
      const email = contactForm.querySelector('input[name="email"]');
      const message = contactForm.querySelector('textarea[name="message"]');
      const type = contactForm.querySelector('select[name="messageType"]');

      [name, email, message].forEach(clearFieldError);

      if (!name.value.trim()) { showFieldError(name, 'Please enter your name'); valid = false; }
      if (!validateEmail(email.value.trim())) { showFieldError(email, 'Enter a valid email'); valid = false; }
      if (!message.value.trim() || message.value.trim().length < 5) { showFieldError(message, 'Please enter a short message'); valid = false; }

      if (!valid) return;

      // compile mailto
      const recipient = 'gcobsandson@example.com'; // <-- REPLACE with real email before deployment
      const subject = encodeURIComponent(`${type.value} - Message from ${name.value.trim()}`);
      let body = `Name: ${name.value.trim()}\nEmail: ${email.value.trim()}\nMessage Type: ${type.value}\n\nMessage:\n${message.value.trim()}`;
      body = encodeURIComponent(body);
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    });
  })();

  // ENQUIRY form
  (function enquiryHandler() {
    const enquiryForm = document.getElementById('enquiryForm');
    if (!enquiryForm) return;

    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const name = enquiryForm.querySelector('input[name="name"]');
      const phone = enquiryForm.querySelector('input[name="phone"]');
      const service = enquiryForm.querySelector('select[name="service"]');
      const date = enquiryForm.querySelector('input[name="date"]');
      const notes = enquiryForm.querySelector('textarea[name="notes"]');

      [name, phone, service, date, notes].forEach(clearFieldError);

      if (!name.value.trim()) { showFieldError(name, 'Please enter your name'); valid = false; }
      if (!validatePhone(phone.value.trim())) { showFieldError(phone, 'Enter a valid phone number'); valid = false; }
      if (!service.value) { showFieldError(service, 'Choose a service'); valid = false; }
      if (!date.value) { showFieldError(date, 'Choose a date'); valid = false; }
      if (notes.value && notes.value.length > 0 && notes.value.length < 5) { showFieldError(notes, 'Please provide more detail'); valid = false; }

      if (!valid) return;

      // Simple simulated response
      let cost = 'Contact for quote';
      if (service.value === 'basic') cost = 'From R300';
      if (service.value === 'deep') cost = 'From R800';
      if (service.value === 'commercial') cost = 'Custom quote';
      const availability = 'We have availability on the selected date. We will confirm within 24 hours.';

      const responseArea = document.getElementById('enquiryResponse');
      responseArea.innerHTML = `
        <div class="enq-success">
          <h3>Enquiry Received</h3>
          <p>Thank you ${name.value.trim()} — estimated cost: <strong>${cost}</strong>.</p>
          <p>${availability}</p>
          <p>We will contact you at ${phone.value.trim()}.</p>
        </div>
      `;
      enquiryForm.reset();
      responseArea.scrollIntoView({ behavior: 'smooth' });
    });
  })();


  /* -------------------------
     SEARCH / FILTER (services + blog)
     ------------------------- */

  (function setupSearch() {
    // Services search/filter
    const svcSearch = document.getElementById('serviceSearch');
    const svcList = document.querySelectorAll('.service-item');
    if (svcSearch && svcList.length) {
      svcSearch.addEventListener('input', () => {
        const q = svcSearch.value.trim().toLowerCase();
        svcList.forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(q) ? '' : 'none';
        });
      });
    }

    // Blog search/filter (filters by h2 and list text)
    const blogSearch = document.getElementById('blogSearch');
    const posts = document.querySelectorAll('.blog-post');
    if (blogSearch && posts.length) {
      blogSearch.addEventListener('input', () => {
        const q = blogSearch.value.trim().toLowerCase();
        posts.forEach(post => {
          const text = post.textContent.toLowerCase();
          post.style.display = text.includes(q) ? '' : 'none';
        });
      });
    }
  })();

}); // DOMContentLoaded end

