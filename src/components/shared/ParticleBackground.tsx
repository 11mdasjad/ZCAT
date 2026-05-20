'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#00d4ff', '#a855f7', '#ec4899'];
const COUNT = 40;
const LINK_DIST = 150;
const FPS = 30;

interface P { x: number; y: number; vx: number; vy: number; r: number; c: string; o: number }

export default function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    let w = 0, h = 0, id = 0;

    const ps: P[] = [];

    const resize = () => {
      w = cv.width = cv.offsetWidth;
      h = cv.height = cv.offsetHeight;
    };

    const init = () => {
      resize();
      ps.length = 0;
      for (let i = 0; i < COUNT; i++) {
        ps.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8,
          r: 1 + Math.random() * 2,
          c: COLORS[i % 3],
          o: 0.1 + Math.random() * 0.3,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // links
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
          const d = dx * dx + dy * dy;
          if (d < LINK_DIST * LINK_DIST) {
            ctx.strokeStyle = `rgba(33,38,45,${0.3 * (1 - Math.sqrt(d) / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }

      // particles
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.globalAlpha = p.o;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => { draw(); id = window.setTimeout(loop, 1000 / FPS); };

    init();
    loop();

    window.addEventListener('resize', resize);
    return () => { clearTimeout(id); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <canvas ref={ref} className="w-full h-full" />
    </div>
  );
}
