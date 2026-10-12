// Quarto rewrites the script URL relative to each rendered page.
document.addEventListener('DOMContentLoaded', () => {
  const script = Array.from(document.scripts).find(s => /assets\/navigation\.js(?:\?|$)/.test(s.src));
  if (!script) return;
  const root = new URL('../', script.src);
  const relative = decodeURIComponent(location.pathname.slice(root.pathname.length));
  const spanish = relative.startsWith('es/');
  const page = (spanish ? relative.slice(3) : relative) || 'index.html';
  const labels = {
    'research.html': ['Research', 'Investigación'],
    'publications.html': ['Publications', 'Publicaciones'],
    'teaching.html': ['Teaching', 'Docencia'],
    'cv.html': ['CV', 'CV'],
    'notes.html': ['Notes', 'Notas']
  };
  document.querySelectorAll('.navbar-nav a.nav-link').forEach(link => {
    const basename = new URL(link.href).pathname.split('/').pop();
    if (!labels[basename]) return;
    link.href = new URL((spanish ? 'es/' : '') + basename, root).href;
    const label = link.querySelector('.menu-text') || link;
    label.textContent = labels[basename][spanish ? 1 : 0];
    link.classList.toggle('active', page === basename || (basename === 'notes.html' && page.startsWith('notes/')));
    if (link.classList.contains('active')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const toggle = document.querySelector('.navbar-nav.ms-auto a.nav-link');
  if (toggle) {
    const link = toggle.matches('a') ? toggle : toggle.querySelector('a');
    if (link) {
      link.href = new URL((spanish ? '' : 'es/') + page, root).href;
      link.hreflang = spanish ? 'en' : 'es';
      link.lang = spanish ? 'en' : 'es';
      (link.querySelector('.menu-text') || link).textContent = spanish ? 'English' : 'Español';
    }
  }
  const brand = document.querySelector('.navbar-brand');
  if (brand) brand.href = new URL((spanish ? 'es/' : '') + 'index.html', root).href;
});
