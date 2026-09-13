/* ═══════════════════════════════════════════════════════════════════════
   Clément Jannaire — portfolio
   Vanilla JS, aucune dépendance. Chaque bloc est autonome : si l'un
   échoue, les autres continuent de fonctionner.
   ═══════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = matchMedia('(pointer: fine)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ── Découpage typographique ──────────────────────────────────────── */
  // Fait avant toute observation : les masques doivent exister au départ.

  function splitLines() {
    $$('[data-split-lines] > span').forEach((line) => {
      line.innerHTML = `<span class="line-inner">${line.innerHTML}</span>`;
    });
  }

  function splitWords() {
    $$('[data-split-words]').forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words
        .map((w, i) =>
          `<span class="word-mask"><span class="word-inner" style="--i:${i}">${w}</span></span>`)
        .join(' ');
    });
  }

  function splitLetters() {
    $$('[data-hover-letters]').forEach((el) => {
      const chars = Array.from(el.textContent);
      el.innerHTML = chars
        .map((c, i) => {
          const safe = c === ' ' ? '&nbsp;' : c.replace(/[&<>]/g, (m) =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
          return `<span class="ltr" style="transition-delay:${i * 16}ms">${safe}</span>`;
        })
        .join('');
    });
  }

  /* ── Apparitions au défilement ────────────────────────────────────── */

  function initReveal() {
    // Cascade au sein d'un même groupe. Plafonnée : avec 20 cartes, un
    // décalage linéaire ferait attendre plus d'une seconde la dernière.
    $$('.projects .card').forEach((el, i) =>
      el.style.setProperty('--d', `${Math.min(i, 7) * 60}ms`));
    $$('.skills__col').forEach((el, i) => el.style.setProperty('--d', `${i * 80}ms`));
    $$('.hero [data-reveal]').forEach((el, i) => el.style.setProperty('--d', `${300 + i * 90}ms`));

    const targets = $$('[data-reveal], [data-split-lines], [data-split-words]');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);            // une seule fois : pas de clignotement
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((el) => io.observe(el));
  }

  /* ── Écran de chargement ──────────────────────────────────────────── */

  function initLoader() {
    const loader = $('#loader');
    const count  = $('#loaderCount');
    const bar    = $('#loaderBar');
    if (!loader) return;

    const finish = () => {
      loader.classList.add('is-done');
      document.body.classList.remove('is-locked');
      // Les animations du hero démarrent une fois le rideau levé.
      setTimeout(() => $$('.hero [data-reveal], .hero [data-split-lines]')
        .forEach((el) => el.classList.add('is-in')), 120);
      setTimeout(() => loader.remove(), 1200);
    };

    if (reduceMotion) { finish(); return; }

    document.body.classList.add('is-locked');

    let value = 0;
    const tick = () => {
      // Progression décélérée : rapide au début, elle s'attarde vers 100.
      value += Math.max(1, (100 - value) * 0.12);
      if (value >= 99.5) value = 100;
      if (count) count.textContent = String(Math.floor(value)).padStart(2, '0');
      if (bar) bar.style.width = `${value}%`;
      if (value < 100) requestAnimationFrame(tick);
      else setTimeout(finish, 260);
    };
    requestAnimationFrame(tick);

    // Filet de sécurité : le site ne doit jamais rester bloqué derrière le rideau.
    setTimeout(finish, 4000);
  }

  /* ── Aurore (canvas) ──────────────────────────────────────────────── */

  function initAurora() {
    const canvas = $('#aurora');
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);  // plafonné : inutile d'aller au-delà pour du flou

    const blobs = [
      { key: '--aurora-1', x: .22, y: .18, r: .40, sx: .00021, sy: .00017, px: 0, py: 0 },
      { key: '--aurora-2', x: .80, y: .30, r: .34, sx: .00016, sy: .00025, px: 0, py: 0 },
      { key: '--aurora-3', x: .55, y: .78, r: .44, sx: .00023, sy: .00013, px: 0, py: 0 }
    ];

    const colorOf = (key) =>
      getComputedStyle(document.documentElement).getPropertyValue(key).trim() || '43, 63, 107';

    let colors = blobs.map((b) => colorOf(b.key));
    // Le thème change les teintes : on les relit à ce moment-là.
    window.addEventListener('cj:themechange', () => { colors = blobs.map((b) => colorOf(b.key)); });

    const resize = () => {
      w = innerWidth; h = innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
    if (finePointer) {
      addEventListener('pointermove', (e) => {
        tx = e.clientX / innerWidth;
        ty = e.clientY / innerHeight;
      }, { passive: true });
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      mx = lerp(mx, tx, 0.03);
      my = lerp(my, ty, 0.03);

      const base = Math.min(w, h);
      blobs.forEach((b, i) => {
        // Dérive lente + très légère attraction vers le pointeur.
        const x = (b.x + Math.sin(t * b.sx + i) * 0.07 + (mx - 0.5) * 0.05) * w;
        const y = (b.y + Math.cos(t * b.sy + i * 1.7) * 0.07 + (my - 0.5) * 0.05) * h;
        const r = b.r * base * (1 + Math.sin(t * 0.0002 + i) * 0.09);

        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${colors[i]}, 0.55)`);
        g.addColorStop(1, `rgba(${colors[i]}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    resize();
    addEventListener('resize', resize, { passive: true });
    raf = requestAnimationFrame(draw);

    // On coupe la boucle quand l'onglet passe en arrière-plan.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    });
  }


  /* ── Cartes : inclinaison 3D + projecteur ─────────────────────────── */

  function initTilt() {
    $$('[data-tilt]').forEach((card) => {
      const glow = $('.card__glow', card);

      if (!finePointer || reduceMotion) {
        // Sans pointeur fin, on garde uniquement le projecteur centré.
        return;
      }

      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;

        card.classList.add('is-tilting');
        card.style.transform =
          `perspective(900px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg) translateY(-4px)`;

        if (glow) {
          glow.style.setProperty('--px', `${x * 100}%`);
          glow.style.setProperty('--py', `${y * 100}%`);
        }
      });

      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  /* ── Projecteur sur la grille de points du hero ───────────────────── */

  function initHeroSpotlight() {
    const hero = $('#hero');
    const grid = $('.hero__grid');
    if (!hero || !grid || !finePointer || reduceMotion) return;

    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      grid.style.setProperty('--mx', `${e.clientX - r.left}px`);
      grid.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  /* ── Texte brouillé ───────────────────────────────────────────────── */

  function initScramble() {
    const el = $('#scramble');
    if (!el) return;

    const words = (el.dataset.words || '').split('|').filter(Boolean);
    if (words.length < 2) return;

    if (reduceMotion) { el.textContent = words[0]; return; }

    const glyphs = '!<>-_\\/[]{}—=+*^?#";:,.';
    let index = 0;

    const scrambleTo = (next) => new Promise((resolve) => {
      const from = el.textContent;
      const length = Math.max(from.length, next.length);
      const queue = [];

      for (let i = 0; i < length; i++) {
        const start = Math.floor(Math.random() * 24);
        queue.push({
          from: from[i] || '',
          to: next[i] || '',
          start,
          end: start + Math.floor(Math.random() * 24) + 8
        });
      }

      let frame = 0;
      const update = () => {
        let out = '';
        let done = 0;

        queue.forEach((q) => {
          if (frame >= q.end) { done++; out += q.to; }
          else if (frame >= q.start) {
            // Un glyphe aléatoire, re-tiré de temps en temps pour l'effet « décodage ».
            if (!q.char || Math.random() < 0.3) q.char = glyphs[Math.floor(Math.random() * glyphs.length)];
            out += q.char;
          } else out += q.from;
        });

        el.textContent = out;
        if (done === queue.length) resolve();
        else { frame++; requestAnimationFrame(update); }
      };
      update();
    });

    const cycle = async () => {
      index = (index + 1) % words.length;
      await scrambleTo(words[index]);
      setTimeout(cycle, 2400);
    };
    setTimeout(cycle, 2600);
  }

  /* ── Filtrage des réalisations ────────────────────────────────────── */

  function initFilters() {
    const bar = $('#filters');
    const grid = $('#projects');
    if (!bar || !grid) return;

    const empty = $('#projectsEmpty');
    const count = $('#projectCount');
    const cards = $$('.card[data-cat]', grid);
    const buttons = $$('.filter', bar);
    const FOLD = 260;   // doit rester aligné sur la transition de .is-filtered

    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter');
      if (!btn) return;

      const cat = btn.dataset.filter;
      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });

      let shown = 0;
      cards.forEach((card) => {
        const match = cat === 'all' || card.dataset.cat === cat;

        if (match) {
          shown++;
          card.hidden = false;
          // Une carte jamais observée (hors écran au chargement) doit
          // quand même apparaître une fois filtrée.
          card.classList.add('is-in');
          requestAnimationFrame(() => card.classList.remove('is-filtered'));
        } else {
          card.classList.add('is-filtered');
          setTimeout(() => {
            if (card.classList.contains('is-filtered')) card.hidden = true;
          }, reduceMotion ? 0 : FOLD);
        }
      });

      if (count) count.textContent = String(shown);
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* ── Compteurs animés ─────────────────────────────────────────────── */

  function initCounters() {
    const nodes = $$('[data-count]');
    if (!nodes.length) return;

    const render = (el, value) => {
      const pad = Number(el.dataset.pad || 0);
      const suffix = el.dataset.suffix || '';
      el.textContent = String(value).padStart(pad, '0') + suffix;
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach((el) => render(el, Number(el.dataset.count)));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);

        const target = Number(el.dataset.count) || 0;
        const duration = 1400;
        const t0 = performance.now();

        const step = (now) => {
          const p = clamp((now - t0) / duration, 0, 1);
          const eased = 1 - Math.pow(1 - p, 3);       // easeOutCubic
          render(el, Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    nodes.forEach((el) => io.observe(el));
  }

  /* ── Bandeau défilant ─────────────────────────────────────────────── */

  function initMarquee() {
    const track = $('#marqueeTrack');
    const group = $('.marquee__group', track || document);
    if (!track || !group || reduceMotion) return;

    // On duplique jusqu'à couvrir deux largeurs d'écran : la boucle est invisible.
    let groupWidth = group.offsetWidth;
    if (!groupWidth) return;

    const copies = Math.ceil((innerWidth * 2) / groupWidth) + 1;
    for (let i = 0; i < copies; i++) track.appendChild(group.cloneNode(true));

    let offset = 0;
    let speed = 0.5;          // vitesse de croisière, px/frame
    let boost = 0;            // impulsion donnée par le défilement de la page
    let lastScroll = scrollY;

    addEventListener('scroll', () => {
      const delta = scrollY - lastScroll;
      lastScroll = scrollY;
      boost = clamp(delta * 0.35, -14, 14);
    }, { passive: true });

    const loop = () => {
      boost *= 0.92;                             // l'impulsion retombe doucement
      offset -= speed + boost;
      if (offset <= -groupWidth) offset += groupWidth;
      if (offset > 0) offset -= groupWidth;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    addEventListener('resize', () => { groupWidth = group.offsetWidth || groupWidth; }, { passive: true });
  }

  /* ── Barre de progression, nav collée, lien actif ─────────────────── */

  function initScrollUI() {
    const progress = $('#progress');
    const nav = $('#nav');
    const dark = $('#apropos');

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? scrollY / max : 0;
        if (progress) progress.style.transform = `scaleX(${p})`;
        if (nav) {
          nav.classList.toggle('is-stuck', scrollY > 16);

          // La nav s'inverse tant que le bloc sombre passe derrière elle.
          if (dark) {
            const mid = nav.offsetHeight * 0.6;
            const r = dark.getBoundingClientRect();
            nav.classList.toggle('is-invert', r.top <= mid && r.bottom >= mid);
          }
        }
        ticking = false;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Surlignage du lien de nav correspondant à la section visible.
    const links = $$('[data-nav-link]');
    const sections = links
      .map((a) => $(a.getAttribute('href')))
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) =>
          a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => io.observe(s));
  }

  /* ── Thème clair / sombre ─────────────────────────────────────────── */

  function initTheme() {
    const btn = $('#themeToggle');
    if (!btn) return;

    const apply = (theme) => {
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem('cj-theme', theme); } catch (e) {}
      dispatchEvent(new CustomEvent('cj:themechange', { detail: { theme } }));
    };

    btn.addEventListener('click', (e) => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';

      // Sans View Transitions (ou en mouvement réduit), bascule directe.
      if (!document.startViewTransition || reduceMotion) { apply(next); return; }

      // Sinon : le nouveau thème s'ouvre en cercle depuis le bouton.
      const r = btn.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2;
      const y = e.clientY || r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

      const transition = document.startViewTransition(() => apply(next));
      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 620, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(() => {});
    });
  }

  /* ── Copie de l'e-mail ────────────────────────────────────────────── */

  function initCopy() {
    const btn = $('#copyMail');
    const toast = $('#toast');
    if (!btn) return;

    let timer;
    const notify = (msg) => {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('is-visible');
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
    };

    btn.addEventListener('click', async () => {
      const mail = btn.dataset.mail || '';
      try {
        await navigator.clipboard.writeText(mail);
        notify('Adresse copiée ✓');
      } catch (e) {
        // clipboard indisponible (http, permission refusée) : repli manuel.
        const ta = document.createElement('textarea');
        ta.value = mail;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-1000px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); notify('Adresse copiée ✓'); }
        catch (err) { notify(mail); }
        ta.remove();
      }
    });
  }

  /* ── Horloge de Paris & année ─────────────────────────────────────── */

  function initClock() {
    const clock = $('#clock');
    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
    if (!clock) return;

    const fmt = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });

    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  }

  /* ── Démarrage ────────────────────────────────────────────────────── */

  function boot() {
    splitLines();
    splitWords();
    splitLetters();

    initReveal();
    initLoader();
    initAurora();
    initTilt();
    initHeroSpotlight();
    initScramble();
    initFilters();
    initCounters();
    initMarquee();
    initScrollUI();
    initTheme();
    initCopy();
    initClock();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
