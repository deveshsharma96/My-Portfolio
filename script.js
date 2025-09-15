document.addEventListener('DOMContentLoaded', () => {

  // --- Elements
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.getElementById('header');
  const backToTopButton = document.getElementById('back-to-top');
  const aboutSection = document.getElementById('about');
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  // --- Mobile menu toggle
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  }

  // --- Smooth scroll for internal links (and close mobile menu)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Scroll Reveal (reveal elements have class "reveal" and optional data-delay)
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay ? parseInt(entry.target.dataset.delay.replace('ms','')) : 0;
        setTimeout(() => entry.target.classList.add('active'), delay);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach(elem => revealObserver.observe(elem));

  // --- Timeline animation
  const timelineItems = document.querySelectorAll('.timeline-item');
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // alternate direction based on index
        if (idx % 2 !== 0) entry.target.classList.add('right');
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.2 });
  timelineItems.forEach(item => timelineObserver.observe(item));

  // --- Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const href = link.getAttribute('href') || '';
          link.classList.toggle('active', href.substring(1) === entry.target.id);
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  sections.forEach(s => navObserver.observe(s));

  // --- Scroll-based effects (header shadow, back-to-top, cursor hide after about)
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('header-scrolled', window.scrollY > 50);
    if (backToTopButton) backToTopButton.classList.toggle('visible', window.pageYOffset > 300);

    if (aboutSection && cursorDot && cursorOutline) {
      const aboutBottom = aboutSection.offsetTop + aboutSection.offsetHeight;
      if (window.scrollY > aboutBottom) {
        document.body.style.cursor = 'default';
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
      } else {
        document.body.style.cursor = 'none';
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
      }
    }
  });

  // --- BACK TO TOP click behavior
  if (backToTopButton) {
    backToTopButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Hero Canvas Particle Animation
  const canvas = document.getElementById('hero-canvas');
  let ctx = null;
  let particlesArray = [];

  if (canvas) {
    ctx = canvas.getContext('2d');

    function setupCanvas() {
      // use clientWidth/Height to keep coordinates in CSS pixels
      canvas.width = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
      canvas.height = canvas.clientHeight || canvas.offsetHeight || window.innerHeight;
    }

    class Particle {
      constructor(x, y, dX, dY, size) {
        this.x = x; this.y = y; this.directionX = dX; this.directionY = dY; this.size = size;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,102,241,0.5)';
        ctx.fill();
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        this.x += this.directionX; this.y += this.directionY;
        this.draw();
      }
    }

    function initParticles() {
      particlesArray = [];
      const area = canvas.width * canvas.height;
      let num = Math.max(20, Math.floor(area / 9000)); // ensure reasonable min
      for (let i = 0; i < num; i++) {
        let size = (Math.random() * 2.5) + 1;
        let x = Math.random() * (canvas.width - size * 2) + size * 2;
        let y = Math.random() * (canvas.height - size * 2) + size * 2;
        let dX = (Math.random() * 0.6) - 0.3;
        let dY = (Math.random() * 0.6) - 0.3;
        particlesArray.push(new Particle(x, y, dX, dY, size));
      }
    }

    function connect() {
      if (!ctx) return;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const dist2 = dx * dx + dy * dy;
          // threshold based on width (squared)
          const maxDist = (canvas.width / 7) * (canvas.width / 7);
          if (dist2 < maxDist) {
            let opacity = 1 - (dist2 / (maxDist * 1.2));
            if (opacity > 0) {
              ctx.strokeStyle = `rgba(129,140,248,${Math.min(0.9, opacity)})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
              ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
              ctx.stroke();
            }
          }
        }
      }
    }

    function animateParticles() {
      requestAnimationFrame(animateParticles);
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach(p => p.update());
      connect();
    }

    window.addEventListener('resize', () => { setupCanvas(); initParticles(); });
    setupCanvas(); initParticles(); animateParticles();
  }

  // --- Typing Animation
  function typeWriter(element, text, speed, callback) {
    let i = 0;
    element.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    element.appendChild(cursor);
    function type() {
      if (i < text.length) {
        element.insertBefore(document.createTextNode(text.charAt(i)), cursor);
        i++;
        setTimeout(type, speed);
      } else {
        if (callback) callback();
      }
    }
    type();
  }

  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  if (heroTitle && heroSubtitle) {
    const titleText = "DEVESH SHARMA";
    const subtitleText = "Creative Full-Stack Developer & AI/ML Enthusiast";
    setTimeout(() => {
      typeWriter(heroTitle, titleText, 150, () => {
        const c = heroTitle.querySelector('.typing-cursor');
        if (c) { c.style.animation = 'none'; c.style.opacity = '0'; }
        typeWriter(heroSubtitle, subtitleText, 50);
      });
    }, 900);
  }



  // --- Custom cursor movement & interactions
  if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', e => {
      const posX = e.clientX, posY = e.clientY;
      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;
      // smooth outline via animate fallback
      cursorOutline.animate([{ left: `${posX}px`, top: `${posY}px` }], { duration: 450, fill: 'forwards' });
    });

    const interactiveElements = document.querySelectorAll('a, button, .card-content, .timeline-item, [type="submit"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursorOutline.classList.add('cursor-interact'));
      el.addEventListener('mouseleave', () => cursorOutline.classList.remove('cursor-interact'));
    });
  }


  // Reveal effect for certifications
const certs = document.querySelectorAll("#certifications .p-4");
certs.forEach((box, i) => {
  box.style.opacity = "0";
  box.style.transform = "translateY(50px)";
  setTimeout(() => {
    box.style.transition = "all 0.8s ease";
    box.style.opacity = "1";
    box.style.transform = "translateY(0)";
  }, i * 200); // stagger animation
});


}); // DOMContentLoaded end


