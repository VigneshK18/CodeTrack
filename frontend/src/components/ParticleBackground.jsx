import { useEffect, useRef } from 'react';

// Animated 3D particle network drawn on a canvas (pure JavaScript, no library).
export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animId;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouse);

    const count = window.innerWidth < 768 ? 45 : 90;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 600 + 100,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.3
    }));

    const project = (p) => {
      const fov = 600;
      const dx = mouseX / window.innerWidth - 0.5;
      const dy = mouseY / window.innerHeight - 0.5;
      const px = p.x + dx * p.z * 0.08;
      const py = p.y + dy * p.z * 0.08;
      const scale = fov / (fov + p.z);
      return {
        sx: (px - window.innerWidth / 2) * scale + window.innerWidth / 2,
        sy: (py - window.innerHeight / 2) * scale + window.innerHeight / 2,
        scale
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        if (p.z < 50) p.z = 700;
        if (p.z > 750) p.z = 50;
      }

      const projected = particles.map((p) => ({ ...p, ...project(p) })).sort((a, b) => a.z - b.z);

      const maxDist = 180;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dist = Math.hypot(a.sx - b.sx, a.sy - b.sy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.35 * Math.min(a.scale, b.scale) * 2;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      for (const p of projected) {
        const r = p.scale * 3.5;
        const alpha = Math.min(p.scale * 1.2, 0.85);
        const grad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 2);
        grad.addColorStop(0, `rgba(167, 139, 250, ${alpha})`);
        grad.addColorStop(0.5, `rgba(124, 58, 237, ${alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r * 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      if (!reduceMotion) animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
