/* Shared matrix digital-rain background for auth pages */
(() => {
  const canvas = document.getElementById('matrix');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fontSize = 16;
  const glyphs = 'アカサタabcdef0123456789#$%&!?<>{}[]/*-+'.split('');
  let drops = [];
  function resize() {
    canvas.width = innerWidth; canvas.height = innerHeight;
    drops = Array(Math.floor(canvas.width / fontSize)).fill(1);
  }
  function rain() {
    ctx.fillStyle = 'rgba(2,5,10,0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88'; ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  addEventListener('resize', resize); resize();
  if (!reduce) setInterval(rain, 55);
})();
