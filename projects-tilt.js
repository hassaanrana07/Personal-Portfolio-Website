document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.holo-card-tilt');

  cards.forEach(cardTilt => {
    const card = cardTilt.querySelector('.holo-card');

    cardTilt.addEventListener('mousemove', (e) => {
      const rect = cardTilt.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const w = rect.width;
      const h = rect.height;

      const dx = x - (w / 2);
      const dy = y - (h / 2);

      // Max rotation ±15 degrees
      const rotateX = -(dy / (h / 2)) * 15;
      const rotateY = (dx / (w / 2)) * 15;

      // Add the moving class to remove transitions for instantaneous response
      cardTilt.classList.add('moving');

      // Update custom properties on card-front (for shimmer position)
      const px = (x / w) * 100;
      const py = (y / h) * 100;
      cardTilt.style.setProperty('--holo-x', px);
      cardTilt.style.setProperty('--holo-y', py);

      // Apply the rotation
      cardTilt.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    cardTilt.addEventListener('mouseleave', () => {
      cardTilt.classList.remove('moving');
      // Reset transform
      cardTilt.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      cardTilt.style.setProperty('--holo-x', '50');
      cardTilt.style.setProperty('--holo-y', '50');
    });

    // Flip toggle on click
    cardTilt.addEventListener('click', (e) => {
      // Prevent flipping if clicked on a link (GitHub, Live demo) or dynamic details CTA
      if (e.target.closest('a')) {
        return;
      }
      
      // If clicked on flip back button, explicitly unflip
      if (e.target.closest('.btn-flip-back')) {
        card.classList.remove('flipped');
        e.stopPropagation();
        return;
      }

      // Prevent flipping if clicked on any other button element
      if (e.target.closest('button')) {
        return;
      }

      card.classList.toggle('flipped');
    });
  });
});
