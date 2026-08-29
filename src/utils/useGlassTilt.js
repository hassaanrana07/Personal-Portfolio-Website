export function handleGlassMouseMove(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const w = rect.width;
  const h = rect.height;

  // Set cursor coordinates for radial spotlight
  card.style.setProperty('--mx', `${x}px`);
  card.style.setProperty('--my', `${y}px`);

  // Calculate 3D tilt up to 6 degrees
  const dx = x - w / 2;
  const dy = y - h / 2;

  const rotateX = (dy / (h / 2)) * 6;
  const rotateY = -(dx / (w / 2)) * 6;

  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

export function handleGlassMouseLeave(e) {
  const card = e.currentTarget;
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  card.style.setProperty('--mx', '50%');
  card.style.setProperty('--my', '50%');
}
