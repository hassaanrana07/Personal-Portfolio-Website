// Use this instead of CSS `scroll-behavior: smooth` so it doesn't conflict
// with GSAP ScrollTrigger's pinned sections.
export function scrollToSection(id) {
  const el = document.getElementById(id) || (id === 'hero' ? document.getElementById('home') : null);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
