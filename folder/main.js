/* ============================================
   DecEmms Decorators — main.js
   ============================================ */

// ─── Nav scroll effect ─────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── Mobile menu ───────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ─── Scroll reveal ──────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── Contact form — native POST to Formsubmit.co ───
// The form submits natively to https://formsubmit.co/decmanning92@gmail.com
// No JavaScript interception needed — Formsubmit handles everything.
// On first ever submission, Formsubmit sends an activation email to confirm.
// After clicking that link, all future submissions go straight to inbox.

// ─── Smooth scroll for anchor links ─────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── Colour library — All 194 Crown Paints colours ───
// colourData is loaded from colours.js (included via script tag before main.js)

const colourSearch = document.getElementById('colourSearch');
const colourCategory = document.getElementById('colourCategory');
const colourTone = document.getElementById('colourTone');
const colourGrid = document.getElementById('colourGrid');
const colourCount = document.getElementById('colourCount');

function formatLink(name) {
  return name.toLowerCase().replace(/[''®.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-$/g, '');
}

// Pagination state
let currentPage = 1;
const ITEMS_PER_PAGE = 30;
let currentFiltered = [];

function renderColourCards() {
  const query = colourSearch.value.trim().toLowerCase();
  const category = colourCategory.value;
  const tone = colourTone.value;

  currentFiltered = colourData.filter(colour => {
    const matchesSearch = [colour.name, colour.category].some(value =>
      value.toLowerCase().includes(query)
    );
    const matchesCategory = category === 'All' || colour.category === category;
    const matchesTone = tone === 'All' || colour.tone === tone;
    return matchesSearch && matchesCategory && matchesTone;
  });

  // Reset to page 1 on filter change
  currentPage = 1;
  renderPage();
}

function renderPage() {
  const totalPages = Math.ceil(currentFiltered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = currentFiltered.slice(start, end);

  colourCount.textContent = `Showing ${Math.min(end, currentFiltered.length)} of ${currentFiltered.length} colour${currentFiltered.length === 1 ? '' : 's'}`;

  colourGrid.innerHTML = pageItems.map(colour => {
    const url = colour.link ? colour.link : `https://www.crownpaints.com/search?q=${encodeURIComponent(colour.name)}`;
    const brandName = colour.brand || 'Crown Paints';

    // Determine if the swatch is light or dark for text contrast
    const r = parseInt(colour.hex.slice(1, 3), 16);
    const g = parseInt(colour.hex.slice(3, 5), 16);
    const b = parseInt(colour.hex.slice(5, 7), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const textClass = lum > 0.65 ? 'colour-card__swatch--light' : '';

    return `
      <article class="colour-card">
        <div class="colour-card__swatch ${textClass}" style="background: ${colour.hex}">
          <span class="colour-card__hex">${colour.hex}</span>
        </div>
        <div class="colour-card__meta">
          <div>
            <span class="colour-card__name">${colour.name}</span>
            <span class="colour-card__tags">${brandName} · ${colour.category}</span>
          </div>
          <a href="${url}" target="_blank" rel="noopener" class="colour-card__link">View Sample ↗</a>
        </div>
      </article>
    `;
  }).join('');

  if (!currentFiltered.length) {
    colourGrid.innerHTML = '<p class="colour__empty">No colours match your search. Try a different keyword or category.</p>';
  }

  // Render pagination
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const existingPag = document.getElementById('colourPagination');
  if (existingPag) existingPag.remove();

  if (totalPages <= 1) return;

  const pag = document.createElement('div');
  pag.id = 'colourPagination';
  pag.className = 'colour__pagination';

  // Prev button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '← Prev';
  prevBtn.className = 'pag-btn';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => { currentPage--; renderPage(); scrollToColours(); });
  pag.appendChild(prevBtn);

  // Page numbers
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) startPage = Math.max(1, endPage - maxButtons + 1);

  if (startPage > 1) {
    pag.appendChild(createPageBtn(1));
    if (startPage > 2) { const dots = document.createElement('span'); dots.textContent = '…'; dots.className = 'pag-dots'; pag.appendChild(dots); }
  }

  for (let i = startPage; i <= endPage; i++) {
    pag.appendChild(createPageBtn(i));
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) { const dots = document.createElement('span'); dots.textContent = '…'; dots.className = 'pag-dots'; pag.appendChild(dots); }
    pag.appendChild(createPageBtn(totalPages));
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next →';
  nextBtn.className = 'pag-btn';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => { currentPage++; renderPage(); scrollToColours(); });
  pag.appendChild(nextBtn);

  colourGrid.parentNode.insertBefore(pag, colourGrid.nextSibling);
}

function createPageBtn(page) {
  const btn = document.createElement('button');
  btn.textContent = page;
  btn.className = 'pag-btn' + (page === currentPage ? ' pag-btn--active' : '');
  btn.addEventListener('click', () => { currentPage = page; renderPage(); scrollToColours(); });
  return btn;
}

function scrollToColours() {
  const el = document.getElementById('colourGrid');
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

if (colourSearch && colourCategory && colourTone) {
  [colourSearch, colourCategory, colourTone].forEach(control => {
    control.addEventListener('input', renderColourCards);
    control.addEventListener('change', renderColourCards);
  });
  renderColourCards();
}

// ─── Active nav link highlighting ───────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--slate)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ─── Custom Form Submission (PHP) ───────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const statusDiv = document.getElementById('formStatus');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    if (statusDiv) {
      statusDiv.textContent = '';
      statusDiv.className = 'form__status';
    }

    const formData = new FormData(contactForm);
    const data = new URLSearchParams(formData);

    fetch('https://script.google.com/macros/s/AKfycbwx8kt6KWxtHS63uzbW7GViSRSgKKTL9VTk6iWVxzWjAgjdWY16ZvmIQVg2JSpdZ5KV/exec', {
      method: 'POST',
      body: data
    })
      .then(response => response.json())
      .then(data => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        if (statusDiv) {
          statusDiv.textContent = data.message || 'Message sent successfully!';
          statusDiv.className = 'form__status form__status--success';
          statusDiv.style.color = '#38a169';
          statusDiv.style.marginTop = '15px';
        }
        contactForm.reset();
      })
      .catch(error => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        if (statusDiv) {
          statusDiv.textContent = 'Oops! There was a problem sending your message.';
          statusDiv.className = 'form__status form__status--error';
          statusDiv.style.color = '#e53e3e';
          statusDiv.style.marginTop = '15px';
        }
      });
  });
}

// ─── Theme Toggle ────────────────────────────
const themeToggle = document.getElementById('darkModeToggle');
if (themeToggle) {
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  });
}