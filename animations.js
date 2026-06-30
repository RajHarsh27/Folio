/* =============================================
   HARSH RAJ PORTFOLIO — animations.js v2
   Full cinematic experience
   ============================================= */

'use strict';

/* ─── UTILS ─── */
const qs  = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);
const isMobile = () => window.matchMedia('(pointer:coarse)').matches;
const lerp = (a, b, t) => a + (b - a) * t;

/* =========================================
   1. PAGE LOADER  — cinematic fade-in
   ========================================= */
(function() {
  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.innerHTML = `
    <div class="loader-inner">
      <div class="loader-bar"></div>
      <span class="loader-name">HARSH RAJ</span>
    </div>`;
  document.body.prepend(loader);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('done');
      setTimeout(() => loader.remove(), 900);
      // trigger hero animations after load
      document.body.classList.add('loaded');
    }, 900);
  });
})();


/* =========================================
   2. CUSTOM CURSOR — magnetic + morphing
   ========================================= */
(function() {
  if (isMobile()) return;
  const dot  = qs('.cursor-dot');
  const ring = qs('.cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;
  let isHover = false;
  let started = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!started) {
      started = true;
      rx = mx; ry = my;
      document.body.classList.add('cursor-active');
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
  document.addEventListener('mouseenter', () => { if (started) document.body.classList.add('cursor-active'); });

  // Magnetic pull toward interactive elements
  qsa('a, button, .skill-card, .tool-card, .brand-card, .contact-card, .exp-card, .nav-logo').forEach(el => {
    el.addEventListener('mouseenter', () => { isHover = true; });
    el.addEventListener('mouseleave', () => { isHover = false; });
  });

  (function loop() {
    // Dot follows instantly
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';

    // Ring lerps with delay for a smooth trailing feel
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    if (isHover) {
      ring.style.width = '48px';
      ring.style.height = '48px';
      ring.style.borderColor = 'rgba(204,68,255,0.9)';
      ring.style.backgroundColor = 'rgba(204,68,255,0.08)';
      dot.style.opacity = '0';
    } else {
      ring.style.width = '30px';
      ring.style.height = '30px';
      ring.style.borderColor = 'rgba(204,68,255,0.45)';
      ring.style.backgroundColor = 'transparent';
      dot.style.opacity = '1';
    }

    requestAnimationFrame(loop);

  })();
})();


/* =========================================
   3. PARTICLE FIELD — physics + mouse
   ========================================= */
(function() {
  const canvas = qs('#particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const COUNT = isMobile() ? 40 : 120;
  const mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  class Star {
    constructor() { this.init(true); }
    init(anywhere) {
      this.x  = Math.random() * W;
      this.y  = anywhere ? Math.random() * H : H + 5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.4 + 0.15);
      this.r  = Math.random() * 1.6 + 0.3;
      this.base_alpha = Math.random() * 0.55 + 0.1;
      this.alpha = 0;
      this.age   = 0;
      this.life  = Math.random() * 350 + 200;
      this.hue   = 270 + Math.random() * 40 - 20; // purple range
    }
    tick() {
      this.age++;
      const t = this.age / this.life;
      this.alpha = t < 0.1 ? t * 10 * this.base_alpha
                 : t > 0.85 ? (1 - t) / 0.15 * this.base_alpha
                 : this.base_alpha;
      // Mouse repulsion
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < 130) {
        const f = (130 - d) / 130 * 1.2;
        this.vx += dx/d * f * 0.08;
        this.vy += dy/d * f * 0.08;
      }
      this.vx *= 0.97; this.vy *= 0.97;
      this.x += this.vx; this.y += this.vy;
      if (this.age > this.life || this.y < -10) this.init(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${this.hue},80%,70%,${this.alpha})`;
      ctx.fill();
    }
  }

  const stars = Array.from({length: COUNT}, () => new Star());

  function drawConnections() {
    const DIST = 90;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i+1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d  = dx*dx + dy*dy;
        if (d < DIST*DIST) {
          const alpha = (1 - Math.sqrt(d)/DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = `rgba(180,80,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    stars.forEach(s => { s.tick(); s.draw(); });
    requestAnimationFrame(loop);
  })();
})();


/* =========================================
   4. MOUSE AURORA — smooth radial glow
   ========================================= */
(function() {
  let tx = 50, ty = 50, cx = 50, cy = 50;
  document.addEventListener('mousemove', e => {
    tx = e.clientX / window.innerWidth  * 100;
    ty = e.clientY / window.innerHeight * 100;
  });
  (function loop() {
    cx = lerp(cx, tx, 0.04);
    cy = lerp(cy, ty, 0.04);
    document.documentElement.style.setProperty('--mx', cx.toFixed(2) + '%');
    document.documentElement.style.setProperty('--my', cy.toFixed(2) + '%');
    requestAnimationFrame(loop);
  })();
})();


/* =========================================
   5. HERO CINEMATIC ENTRANCE
   ========================================= */
(function() {
  const words    = qsa('.hero-title .word');
  const eyebrow  = qs('.hero-eyebrow');
  const heroRevs = qsa('.reveal-hero');

  // Set initial hidden state
  words.forEach(w => {
    w.style.cssText = 'display:inline-block;opacity:0;transform:translateY(110%) skewY(10deg)';
  });
  if (eyebrow) eyebrow.style.cssText = 'opacity:0;transform:translateY(16px)';
  heroRevs.forEach(el => el.style.cssText = 'opacity:0;transform:translateY(24px)');

  function animateIn() {
    // Eyebrow
    if (eyebrow) {
      setTimeout(() => {
        eyebrow.style.transition = 'opacity 1s ease, transform 1s ease';
        eyebrow.style.opacity = '1';
        eyebrow.style.transform = 'translateY(0)';
      }, 300);
    }
    // Words cascade
    words.forEach((w, i) => {
      setTimeout(() => {
        w.style.transition = 'opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)';
        w.style.opacity = '1';
        w.style.transform = 'translateY(0) skewY(0deg)';
      }, 500 + i * 200);
    });
    // Sub text
    heroRevs.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = 'opacity 1s ease, transform 1s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 1100 + i * 150);
    });
    // Profile pic
    const pic = qs('.profile-pic');
    if (pic) {
      pic.style.cssText += ';opacity:0;transform:scale(0.85)';
      setTimeout(() => {
        pic.style.transition = 'opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)';
        pic.style.opacity = '1';
        pic.style.transform = 'scale(1)';
      }, 700);
    }
  }

  document.addEventListener('loaderDone', animateIn);
  // Fallback
  setTimeout(animateIn, 1000);
})();


/* =========================================
   6. SCROLL REVEAL — staggered cascade
   ========================================= */
(function() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Grid children - staggered
  qsa('.skills-grid, .tools-grid, .brands-grid, .contact-grid').forEach(group => {
    Array.from(group.children).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 100) + 'ms';
      io.observe(el);
    });
  });

  // Exp cards staggered
  qsa('.exp-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 150) + 'ms';
    io.observe(el);
  });

  // Text elements
  qsa('.section-title, .section-sub, .about-desc, .skills-tags, .contact-desc').forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });

  // Section title underline trigger
  const titleIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('title-visible');
    });
  }, { threshold: 0.5 });
  qsa('.section-title').forEach(el => titleIO.observe(el));
})();


/* =========================================
   7. NAVBAR — scroll shrink + active link
   ========================================= */
(function() {
  const nav = qs('#navbar');
  const links = qsa('.nav-links a');
  const sections = qsa('section[id]');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 140) current = s.id;
    });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }, {passive:true});
})();


/* =========================================
   8. 3D TILT — cards feel physical
   ========================================= */
(function() {
  if (isMobile()) return;
  qsa('.skill-card, .tool-card, .contact-card, .brand-card').forEach(card => {
    let raf;
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform   = `perspective(700px) rotateY(${x*12}deg) rotateX(${-y*12}deg) translateY(-6px) scale(1.03)`;
        card.style.boxShadow   = `${-x*16}px ${-y*16}px 40px rgba(204,68,255,0.22), 0 0 0 1px rgba(204,68,255,0.3)`;
        card.style.borderColor = 'rgba(204,68,255,0.5)';
        // Inner light reflection
        card.style.background  = `radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(204,68,255,0.06) 0%, var(--bg-card) 60%)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transform   = '';
      card.style.boxShadow   = '';
      card.style.borderColor = '';
      card.style.background  = '';
      card.style.transition  = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.6s ease, background 0.6s ease';
      setTimeout(() => card.style.transition = '', 600);
    });
  });
})();


/* =========================================
   9. BRAND CARD — shimmer on hover
   ========================================= */
(function() {
  qsa('.brand-card').forEach(card => {
    card.addEventListener('mouseenter', () => card.classList.add('shimmer'));
    card.addEventListener('animationend', () => card.classList.remove('shimmer'));
  });
})();


/* =========================================
   10. SCROLL PROGRESS BAR
   ========================================= */
(function() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = pct + '%';
  }, {passive:true});
})();


/* =========================================
   11. MOBILE NAV
   ========================================= */
(function() {
  const btn   = qs('#hamburger');
  const links = qs('.nav-links');
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    btn.classList.remove('open');
    links.classList.remove('open');
  }));
})();


/* =========================================
   12. SMOOTH SCROLL
   ========================================= */
qsa('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = qs(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});


/* =========================================
   13. SECTION PARALLAX — subtle depth
   ========================================= */
(function() {
  if (isMobile()) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const hero = qs('.hero-content');
    if (hero) hero.style.transform = `translateY(${y * 0.12}px)`;
    const pic = qs('.hero-profile');
    if (pic) pic.style.transform = `translateY(${y * 0.06}px)`;
  }, {passive:true});
})();


/* =========================================
   14. DISPATCH loader done event
   ========================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('loaderDone'));
  }, 950);
});
