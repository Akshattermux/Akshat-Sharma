document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ==========================================
  // HAMBURGER MOBILE NAV
  // ==========================================
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const terminalTriggerMobile = document.getElementById('terminal-trigger-mobile');

  function openMobileNav() {
    hamburgerBtn.classList.add('open');
    mobileDrawer.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    hamburgerBtn.classList.remove('open');
    mobileDrawer.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      if (hamburgerBtn.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  // Close drawer when a mobile nav link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  // Wire mobile terminal trigger
  if (terminalTriggerMobile) {
    terminalTriggerMobile.addEventListener('click', () => {
      closeMobileNav();
      const termOverlay = document.getElementById('terminal-overlay');
      if (termOverlay) {
        termOverlay.classList.add('active');
        const termInput = document.getElementById('terminal-input');
        if (termInput) setTimeout(() => termInput.focus(), 100);
      }
    });
  }


  // ==========================================
  // RADIAL ORB SKILLS — ANIMATED ENTRANCE + FILTER TABS + SVG RINGS
  // ==========================================
  const filterTabs    = document.querySelectorAll('.skill-tab');
  const skillOrbs     = document.querySelectorAll('.skill-orb');
  const filterTabsRow = document.getElementById('skills-filter-tabs');
  const CIRCUMFERENCE = 213.63; // 2 * π * 34

  // --- Staggered entrance reveal via IntersectionObserver ---
  let orbRevealIndex = 0;
  function revealOrbs(entries) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const orb = entry.target;
      if (orb.classList.contains('revealed')) return;

      // Staggered delay based on order
      const delay = orbRevealIndex * 60; // 60ms stagger between each orb
      orbRevealIndex++;

      setTimeout(() => {
        orb.classList.add('revealed');

        // Animate the SVG ring fill
        const fill = orb.querySelector('.ring-fill');
        if (fill && !fill.dataset.animated) {
          const pct = parseFloat(fill.getAttribute('data-pct')) || 0;
          const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
          // Small extra delay so entrance finishes before ring starts filling
          setTimeout(() => {
            fill.style.strokeDashoffset = offset;
          }, 200);
          fill.dataset.animated = '1';
        }
      }, delay);

      orbObserver.unobserve(orb);
    });
  }

  const orbObserver = new IntersectionObserver(revealOrbs, {
    root: null,
    threshold: 0.15
  });

  skillOrbs.forEach(orb => orbObserver.observe(orb));

  // --- Reveal the filter tabs row on scroll ---
  if (filterTabsRow) {
    const tabObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          filterTabsRow.classList.add('revealed');
          tabObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    tabObserver.observe(filterTabsRow);
  }

  // --- Filter tab switching with re-animation ---
  function setFilter(filter) {
    filterTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-filter') === filter));

    let visibleIdx = 0;
    skillOrbs.forEach(orb => {
      const cat = orb.getAttribute('data-cat');
      const shouldShow = (filter === 'all' || cat === filter);

      if (!shouldShow) {
        orb.classList.add('hidden');
        orb.classList.remove('revealed');
      } else {
        orb.classList.remove('hidden');
        // Re-animate entrance with stagger
        const stagger = visibleIdx * 40;
        visibleIdx++;
        orb.classList.remove('revealed');

        setTimeout(() => {
          orb.classList.add('revealed');

          // Re-trigger ring fill animation
          const fill = orb.querySelector('.ring-fill');
          if (fill) {
            const pct = parseFloat(fill.getAttribute('data-pct')) || 0;
            const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
            fill.style.strokeDashoffset = String(CIRCUMFERENCE);
            setTimeout(() => {
              fill.style.strokeDashoffset = offset;
            }, 80);
          }
        }, stagger);
      }
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => setFilter(tab.getAttribute('data-filter')));
  });


  // --- Cinematic Eased Smooth Scroll (Lenis) ---

  let lenisInstance = null;
  if (typeof Lenis !== 'undefined') {
    lenisInstance = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Premium exponential scroll easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1.02
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenisInstance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // --- Dynamic Frosted Glass Custom Cursor ---
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');

  if (cursor && follower) {
    let cursorPos = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
      cursorPos.x = e.clientX;
      cursorPos.y = e.clientY;

      // Dot follows immediately
      gsap.to(cursor, {
        x: cursorPos.x,
        y: cursorPos.y,
        duration: 0.04,
        overwrite: 'auto'
      });

      // Follower follows with elegant drag delay
      gsap.to(follower, {
        x: cursorPos.x,
        y: cursorPos.y,
        duration: 0.32,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    // Hover elements triggers cursor expand and color change
    const updateHoverEvents = () => {
      const hoverables = document.querySelectorAll('a, button, input, textarea, select, .button, .timeline-dot');
      hoverables.forEach((el) => {
        // Avoid duplicate triggers
        el.removeEventListener('mouseenter', addCursorHover);
        el.removeEventListener('mouseleave', removeCursorHover);
        
        el.addEventListener('mouseenter', addCursorHover);
        el.addEventListener('mouseleave', removeCursorHover);
      });
    };

    function addCursorHover() {
      cursor.classList.add('hovering');
      follower.classList.add('hovering');
    }

    function removeCursorHover() {
      cursor.classList.remove('hovering');
      follower.classList.remove('hovering');
    }

    updateHoverEvents();

    // 3D Card Showcase Cursor State
    const container3D = document.querySelector('.project-3d-wrapper');
    if (container3D) {
      container3D.addEventListener('mouseenter', () => {
        follower.classList.add('viewing-3d');
      });
      container3D.addEventListener('mouseleave', () => {
        follower.classList.remove('viewing-3d');
      });
    }

    // Observe page mutations to automatically apply hover logic to newly loaded elements
    const observer = new MutationObserver(updateHoverEvents);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // --- Header Pill Scroll Morph ---
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const handleHeaderScroll = () => {
      if (window.scrollY > 60) {
        topbar.classList.add('topbar-shrunk');
      } else {
        topbar.classList.remove('topbar-shrunk');
      }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }

  // --- Smooth Scroll to Anchor Sections (Lenis Synchronized) ---
  const setupNavAnchorScroll = () => {
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          e.preventDefault();
          if (lenisInstance) {
            // Scroll to the target element with offset matching shrunk navbar height
            lenisInstance.scrollTo(targetSection, {
              duration: 1.25,
              offset: -75,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
          } else {
            targetSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  };
  setupNavAnchorScroll();

  // --- GSAP ScrollTrigger ScrollSpy Active Highlighting ---
  const setupScrollSpy = () => {
    const sections = ['about', 'projects', 'timeline', 'contact'];
    sections.forEach((id) => {
      const sectionEl = document.getElementById(id);
      const linkEl = document.querySelector(`.nav a[href="#${id}"]`);
      if (sectionEl && linkEl) {
        ScrollTrigger.create({
          trigger: sectionEl,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) {
              linkEl.classList.add('active');
            } else {
              linkEl.classList.remove('active');
            }
          }
        });
      }
    });
  };
  setupScrollSpy();

  // --- Tactile Magnetic Physics on Hover ---
  const applyMagneticHover = () => {
    const magneticItems = document.querySelectorAll('.button, .nav a, .proj-link');
    magneticItems.forEach((item) => {
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        // Calculate offset from center of button
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(item, {
          x: x * 0.32,
          y: y * 0.32,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      item.addEventListener('mouseleave', () => {
        gsap.to(item, {
          x: 0,
          y: 0,
          duration: 0.65,
          ease: 'elastic.out(1.1, 0.48)',
          overwrite: 'auto'
        });
      });
    });
  };
  applyMagneticHover();

  // Skills Progress Fill Animation using GSAP ScrollTrigger
  const skillFills = document.querySelectorAll('.skill-progress-fill');
  if (skillFills.length > 0) {
    ScrollTrigger.create({
      trigger: '.skills-section',
      start: 'top 78%',
      onEnter: () => {
        skillFills.forEach(fill => {
          const progress = fill.getAttribute('data-progress') || '0%';
          gsap.to(fill, {
            width: progress,
            duration: 1.4,
            ease: 'power2.out'
          });
        });
      }
    });
  }

  // Skills Cards Hover Glow Sync with Custom Cursor Follower
  const skillsCards = document.querySelectorAll('.skills-category-card');
  if (skillsCards.length > 0 && follower) {
    skillsCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const domain = card.getAttribute('data-domain');
        follower.classList.add('skills-hover');
        
        let glowColor = 'var(--accent)';
        if (domain === 'ai') glowColor = 'rgba(255, 179, 71, 0.85)';
        else if (domain === 'frontend') glowColor = 'rgba(56, 214, 199, 0.85)';
        else if (domain === 'backend') glowColor = 'rgba(167, 139, 250, 0.85)';
        else if (domain === 'iot') glowColor = 'rgba(239, 68, 68, 0.85)';
        else if (domain === 'mern') glowColor = 'rgba(97, 218, 251, 0.85)';
        else if (domain === 'mobile') glowColor = 'rgba(167, 139, 250, 0.85)';
        else if (domain === 'webcore') glowColor = 'rgba(56, 214, 199, 0.85)';
        
        gsap.to(follower, {
          scale: 2.2,
          borderColor: glowColor,
          boxShadow: `0 0 25px ${glowColor}`,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      card.addEventListener('mouseleave', () => {
        follower.classList.remove('skills-hover');
        gsap.to(follower, {
          scale: 1,
          borderColor: '',
          boxShadow: '',
          backgroundColor: '',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;



  // Canvas animation setup
  const canvas = document.getElementById('hero-canvas');
  const detailNum = document.getElementById('detail-number');
  const detailTitle = document.getElementById('detail-title');
  const detailFocusText = document.getElementById('detail-focus-text');
  const detailDesc = document.getElementById('detail-desc');
  const detailCard = document.querySelector('.hero-detail-card');

  const frameCount = 120;
  const images = [];
  const sequence = { frame: 0, target: 0 };
  let rafId = null;
  let isReady = false;
  let imageLoadCount = 0;
  let resizeTimeoutId = null;

  const rolesData = [
    {
      title: 'Prompt Engineer & Architect',
      focus: 'LLM Orchestration & Context Design',
      desc: 'Structuring optimized context windows, refining system prompts, and architecting robust vector-database RAG integrations.',
      label: '01'
    },
    {
      title: 'Creative Frontend Developer',
      focus: 'Three.js 3D & Premium Motion UI',
      desc: 'Crafting immersive WebGL graphics, custom canvas engines, and physics-based GSAP scroll experiences that feel expensive.',
      label: '02'
    },
    {
      title: 'Scalable Backend Engineer',
      focus: 'Node.js & Distributed Systems',
      desc: 'Architecting high-concurrency Node.js APIs, microservices architectures, and highly optimized database querying and caching layers.',
      label: '03'
    },
    {
      title: 'IoT & Robotics Developer',
      focus: 'Smart Telemetry & Hardware Integration',
      desc: 'Connecting cyber-physical devices, hardware nodes, microcontrollers, and designing autonomous robotic configurations.',
      label: '04'
    },
    {
      title: 'AWS & Server Management',
      focus: 'Cloud Infrastructure & VPS Hosting',
      desc: 'Deploying high-availability secure cloud systems, serverless architectures, and configuring robust server management environments.',
      label: '05'
    },
    {
      title: 'ML & AI Enthusiast',
      focus: 'Deep Learning & Neural Architectures',
      desc: 'Developing sophisticated PyTorch models, custom predictive layers, and optimization pipelines for complex data patterns.',
      label: '06'
    },
    {
      title: 'Cognitive AI Specialist',
      focus: 'Agentic Workflows & NLP',
      desc: 'Engineering autonomous cognitive agents, multi-model orchestrations, and advanced semantic understanding protocols.',
      label: '07'
    }
  ];

  let lastActiveIndex = -1;

  function updateFrameCopy(frameIndex) {
    // 7 segments for 120 frames
    const activeIndex = Math.min(6, Math.floor(frameIndex / (120 / 7)));

    if (activeIndex !== lastActiveIndex) {
      lastActiveIndex = activeIndex;
      const currentRole = rolesData[activeIndex];

      // Highlight active heading on the left
      const headingItems = document.querySelectorAll('.hero-heading-item');
      headingItems.forEach((item, idx) => {
        if (idx === activeIndex) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Update right-side glass details card with smooth GSAP transition
      if (detailCard) {
        gsap.to(detailCard, {
          opacity: 0.28,
          y: -8,
          duration: 0.16,
          ease: 'power2.inOut',
          onComplete: () => {
            if (detailNum) detailNum.textContent = currentRole.label;
            if (detailTitle) detailTitle.textContent = currentRole.title;
            if (detailFocusText) detailFocusText.textContent = currentRole.focus;
            if (detailDesc) detailDesc.textContent = currentRole.desc;
            
            gsap.to(detailCard, {
              opacity: 1,
              y: 0,
              duration: 0.26,
              ease: 'power2.out'
            });
          }
        });
      }
    }
  }

  // Add click handlers to left-side headings to scrub to their respective stages
  setTimeout(() => {
    const headingItems = document.querySelectorAll('.hero-heading-item');
    const heroSection = document.querySelector('.hero-sequence');
    
    if (headingItems.length > 0 && heroSection) {
      headingItems.forEach((item) => {
        item.addEventListener('click', () => {
          const index = parseInt(item.getAttribute('data-index'));
          
          // Calculate the target scroll position within the hero sequence
          const startScroll = heroSection.offsetTop;
          const totalScroll = heroSection.offsetHeight - window.innerHeight;
          // Calculate target progress from 0.0 to 1.0 (spaced across index 0 to 6)
          const targetProgress = index / 6; 
          const targetScrollPos = startScroll + (targetProgress * totalScroll);

          if (lenisInstance) {
            lenisInstance.scrollTo(targetScrollPos, {
              duration: 1.5,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
          } else {
            window.scrollTo({
              top: targetScrollPos,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  }, 1000);

  function setupCanvas() {
    if (!canvas) return null;

    const context = canvas.getContext('2d');
    if (!context) return null;

    const getCanvasSize = () => {
      const bounds = canvas.getBoundingClientRect();
      return {
        width: bounds.width || window.innerWidth,
        height: bounds.height || window.innerHeight
      };
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = getCanvasSize();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame();
      ScrollTrigger.refresh();
    };

    const drawCover = (image, alpha = 1) => {
      const { width: canvasWidth, height: canvasHeight } = getCanvasSize();

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.fillStyle = '#02050b';
      context.fillRect(0, 0, canvasWidth, canvasHeight);

      const drawFallback = () => {
        const gradient = context.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, '#10213b');
        gradient.addColorStop(0.5, '#07111f');
        gradient.addColorStop(1, '#02050b');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        context.fillStyle = 'rgba(255, 179, 71, 0.14)';
        context.beginPath();
        context.arc(canvasWidth * 0.68, canvasHeight * 0.28, Math.min(canvasWidth, canvasHeight) * 0.22, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = 'rgba(56, 214, 199, 0.12)';
        context.beginPath();
        context.arc(canvasWidth * 0.3, canvasHeight * 0.72, Math.min(canvasWidth, canvasHeight) * 0.18, 0, Math.PI * 2);
        context.fill();
      };

      if (!image || !image.complete || !image.naturalWidth) {
        drawFallback();
        return;
      }

      try {
        // Premium Portrait Framing: Scale the character's height to exactly 90% of the canvas height.
        // This guarantees the character is fully and beautifully contained inside the rounded frame on all devices.
        const ratio = (canvasHeight * 0.90) / image.naturalHeight;
        const drawWidth = image.naturalWidth * ratio;
        const drawHeight = image.naturalHeight * ratio;

        // Center horizontally
        const offsetX = (canvasWidth - drawWidth) / 2;

        // Elevate the top margin to exactly 6% of the canvas height, providing elegant breathing room
        // below the top rounded borders and preventing any cropped "overfitting" of the head.
        const offsetY = canvasHeight * 0.06;

        context.globalAlpha = alpha;
        context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
        context.globalAlpha = 1;

        const vignette = context.createRadialGradient(
          canvasWidth * 0.5, canvasHeight * 0.42, Math.min(canvasWidth, canvasHeight) * 0.12,
          canvasWidth * 0.5, canvasHeight * 0.42, Math.min(canvasWidth, canvasHeight) * 0.82
        );
        vignette.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
        vignette.addColorStop(0.4, 'rgba(7, 17, 31, 0.06)');
        vignette.addColorStop(1, 'rgba(2, 5, 11, 0.64)');
        context.fillStyle = vignette;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        const rim = context.createLinearGradient(0, 0, canvasWidth, 0);
        rim.addColorStop(0, 'rgba(56, 214, 199, 0.02)');
        rim.addColorStop(0.5, 'rgba(255, 255, 255, 0.015)');
        rim.addColorStop(1, 'rgba(255, 179, 71, 0.03)');
        context.fillStyle = rim;
        context.fillRect(0, 0, canvasWidth, canvasHeight);
      } catch (error) {
        console.error('Canvas draw error:', error);
        drawFallback();
      }
    };

    function drawFrame() {
      const currentIndex = Math.max(0, Math.min(frameCount - 1, Math.round(sequence.frame)));
      
      // Find the nearest already-loaded frame to prevent blank space / flickering
      let bestImage = null;
      let minDistance = Infinity;
      
      for (let i = 0; i < frameCount; i++) {
        const img = images[i];
        if (img && img.complete && img.naturalWidth) {
          const distance = Math.abs(i - currentIndex);
          if (distance < minDistance) {
            minDistance = distance;
            bestImage = img;
          }
          if (distance === 0) break; // Perfect match found
        }
      }
      
      if (!bestImage) return; // No frames loaded at all yet
      
      drawCover(bestImage);
      updateFrameCopy(currentIndex);
    }

    function setTargetFrame(nextFrame) {
      sequence.frame = Math.max(0, Math.min(frameCount - 1, nextFrame));
      drawFrame();
    }

    resizeCanvas();
    window.addEventListener('resize', () => {
      if (resizeTimeoutId) clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(resizeCanvas, 120);
    }, { passive: true });

    // Instantiate image frames empty
    for (let index = 0; index < frameCount; index += 1) {
      const image = new Image();
      image.decoding = 'async';
      images.push(image);
    }

    // Progressive Priority Queue Setup (Coarse-to-Fine loading)
    const frameQueue = [];
    
    // Pass 1: Coarse resolution (Every 8th frame, plus start and end)
    const pass1 = [];
    for (let i = 0; i < frameCount; i += 8) pass1.push(i);
    if (!pass1.includes(frameCount - 1)) pass1.push(frameCount - 1);
    
    // Pass 2: Medium resolution (Every 4th frame)
    const pass2 = [];
    for (let i = 0; i < frameCount; i += 4) {
      if (!pass1.includes(i)) pass2.push(i);
    }
    
    // Pass 3: Fine resolution (Every 2nd frame)
    const pass3 = [];
    for (let i = 0; i < frameCount; i += 2) {
      if (!pass1.includes(i) && !pass2.includes(i)) pass3.push(i);
    }
    
    // Pass 4: Full resolution (Remaining odd frames)
    const pass4 = [];
    for (let i = 0; i < frameCount; i++) {
      if (!pass1.includes(i) && !pass2.includes(i) && !pass3.includes(i)) {
        pass4.push(i);
      }
    }
    
    frameQueue.push(...pass1, ...pass2, ...pass3, ...pass4);
    
    // Concurrent load scheduler (Limit to 3 parallel HTTP requests to prevent network clog)
    const MAX_CONCURRENT = 3;
    let activeConnections = 0;
    let nextQueueIndex = 0;
    
    function loadNext() {
      if (nextQueueIndex >= frameQueue.length) return;
      if (activeConnections >= MAX_CONCURRENT) return;
      
      const frameIdx = frameQueue[nextQueueIndex];
      nextQueueIndex++;
      activeConnections++;
      
      const image = images[frameIdx];
      
      const onImageLoaded = () => {
        activeConnections--;
        imageLoadCount++;
        
        // Boot up as soon as 2 crucial frames are ready
        if (!isReady && imageLoadCount >= 2) {
          isReady = true;
          drawFrame();
          try { initHeroScrollTrigger(); } catch (e) {}
        }
        
        // Refresh frame on-screen if this loaded frame is near the active viewport frame
        const currentActiveFrame = Math.round(sequence.frame);
        if (Math.abs(currentActiveFrame - frameIdx) <= 6) {
          drawFrame();
        }
        
        // Refresh ScrollTrigger when progressive loading queue finishes completely
        if (imageLoadCount === frameCount) {
          ScrollTrigger.refresh();
        }
        
        loadNext();
      };
      
      const onImageError = () => {
        activeConnections--;
        console.warn(`Failed to load progressive frame: ${frameIdx + 1}`);
        loadNext();
      };
      
      image.onload = onImageLoaded;
      image.onerror = onImageError;
      image.src = `./${frameIdx + 1}.png`;
      
      // Spawn extra connections up to slot limit
      loadNext();
    }
    
    // Trigger loader scheduler
    loadNext();

    // ScrollTrigger setup - initialize only after canvas sequence is ready
    const heroSection = document.querySelector('.hero-sequence');
    let heroScrollInit = false;
    function initHeroScrollTrigger() {
      if (heroScrollInit || !heroSection) return;
      heroScrollInit = true;

      gsap.to(sequence, {
        frame: frameCount - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.18,
          pin: '.hero-shell',
          invalidateOnRefresh: true,
          anticipatePin: 1,
          fastScrollEnd: true
        },
        onUpdate: () => {
          drawFrame();
        }
      });
    }
  }

  setupCanvas();

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      if (lenisInstance) {
        lenisInstance.scrollTo(target, {
          offset: 0,
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Contact form submission with AJAX and premium feedback
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      const formData = new FormData(contactForm);
      const dataObj = {};
      formData.forEach((value, key) => {
        dataObj[key] = value;
      });

      fetch('https://formsubmit.co/ajax/akshatsharma5645@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataObj)
      })
      .then(response => response.json())
      .then(data => {
        submitBtn.textContent = 'Message Sent!';
        contactForm.reset();
        
        // Show premium custom success toast
        showToast('Message sent successfully! I will get back to you soon.', 'success');
        
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 3000);
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        submitBtn.textContent = 'Error!';
        showToast('Oops! Something went wrong. Please try again.', 'error');
        
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 3000);
      });
    });
  }

  // --- Three.js 3D Projects Showcase ---
  function init3DProjects() {
    const container = document.getElementById('project-3d-canvas-container');
    if (!container || typeof THREE === 'undefined') {
      console.warn('Three.js not loaded or container not found');
      return;
    }

    const overlay = document.getElementById('project-details-overlay');
    const badgeEl = document.getElementById('proj-badge');
    const titleEl = document.getElementById('proj-title');
    const descEl = document.getElementById('proj-desc');

    // Extract project data from DOM
    const projectCards = document.querySelectorAll('.project-card-data');
    const projects = [];
    projectCards.forEach((card) => {
      projects.push({
        index: card.getAttribute('data-index'),
        title: card.querySelector('h3').textContent,
        desc: card.querySelector('p').textContent,
        gradA: card.getAttribute('data-gradient-a') || '#ffb347',
        gradB: card.getAttribute('data-gradient-b') || '#ff7c57',
        tech: card.getAttribute('data-tech') || '',
        link: card.getAttribute('data-link') || '#',
        features: (card.getAttribute('data-features') || '').split(';')
      });
    });

    if (projects.length === 0) return;

    // Create Scene, Camera, WebGLRenderer
    const scene = new THREE.Scene();
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 8.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Spotlight that shines on the hovered card (with a nice starting off-center elevation)
    const spotLight = new THREE.SpotLight(0xffffff, 3.2);
    spotLight.position.set(1.5, 3.0, 10);
    spotLight.angle = Math.PI / 4.5;
    spotLight.penumbra = 0.85;
    spotLight.decay = 2;
    spotLight.distance = 20;
    scene.add(spotLight);

    // Add a soft overhead point light for ambient 3D depth
    const dirLight = new THREE.DirectionalLight(0x38d6c7, 1.2);
    dirLight.position.set(0, 5, 5);
    scene.add(dirLight);

    // Default teal accent light (theme toggle removed)
    dirLight.color.setHex(0x38d6c7);


    // Create dynamic high-quality canvas texture for cards
    function createCardTexture(proj) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 700;
      const ctx = canvas.getContext('2d');

      // 1. Draw solid sleek dark panel background
      ctx.fillStyle = '#060b13';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw glossy gradient light source
      const bgGrad = ctx.createRadialGradient(canvas.width/2, 0, 10, canvas.width/2, 0, canvas.height*0.8);
      bgGrad.addColorStop(0, 'rgba(56, 214, 199, 0.15)');
      bgGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Draw rounded glow borders
      const radius = 32;
      ctx.lineWidth = 4;
      const borderGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      borderGrad.addColorStop(0, proj.gradA);
      borderGrad.addColorStop(0.5, 'rgba(255,255,255,0.18)');
      borderGrad.addColorStop(1, proj.gradB);
      ctx.strokeStyle = borderGrad;

      // Path for rounded rectangle
      function drawRoundedRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }

      // Draw border
      drawRoundedRect(6, 6, canvas.width - 12, canvas.height - 12, radius);
      ctx.stroke();

      // 4. Draw Accent Mesh Pattern / Visual Glass Reflection
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }
      // Add subtle circular holographic nodes at cross points
      ctx.fillStyle = proj.gradA;
      for (let i = gridSize * 2; i < canvas.width - gridSize; i += gridSize * 3) {
        for (let j = gridSize * 2; j < canvas.height - gridSize; j += gridSize * 3) {
          ctx.beginPath();
          ctx.arc(i, j, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Draw Glossy Diagonal Sheen
      const sheenGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      sheenGrad.addColorStop(0, 'rgba(255,255,255,0)');
      sheenGrad.addColorStop(0.3, 'rgba(255,255,255,0.015)');
      sheenGrad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
      sheenGrad.addColorStop(0.7, 'rgba(255,255,255,0.015)');
      sheenGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width * 0.4, canvas.height);
      ctx.lineTo(-canvas.width * 0.6, canvas.height);
      ctx.closePath();
      ctx.fill();

      // 6. Draw Text Badge / Index
      const projNum = parseInt(proj.index) + 1;
      const projNumStr = projNum < 10 ? `0${projNum}` : projNum;
      const badgeText = `PROJECT ${projNumStr}`;
      ctx.font = '900 18px Sora, sans-serif';
      ctx.fillStyle = proj.gradA;
      ctx.fillText(badgeText, 45, 75);

      // Draw active visual thumbnail box representation
      const cardVisGrad = ctx.createLinearGradient(45, 120, canvas.width - 45, 120);
      cardVisGrad.addColorStop(0, proj.gradA);
      cardVisGrad.addColorStop(1, proj.gradB);
      ctx.fillStyle = cardVisGrad;
      drawRoundedRect(45, 110, canvas.width - 90, 240, 20);
      ctx.fill();

      // Draw subtle logo/mesh elements inside the visual block
      ctx.fillStyle = 'rgba(18, 13, 7, 0.18)';
      ctx.font = '800 120px Sora, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(projNumStr, canvas.width / 2, 230);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // 7. Draw Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 38px Sora, sans-serif';
      ctx.fillText(proj.title, 45, 415);

      // 8. Draw Description with wrapping
      ctx.fillStyle = 'rgba(245, 248, 255, 0.72)';
      ctx.font = '400 21px Inter, sans-serif';
      const words = proj.desc.split(' ');
      let line = '';
      let y = 465;
      const maxWidth = canvas.width - 90;
      const lineHeight = 30;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, 45, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 45, y);

      // 9. Draw CTA trigger line
      ctx.fillStyle = proj.gradA;
      ctx.font = '600 20px Sora, sans-serif';
      ctx.fillText('VIEW CASE STUDY →', 45, 620);

      // Create texture
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      return texture;
    }

    // Array to hold our card meshes
    const cardMeshes = [];
    const cardGeometry = new THREE.PlaneGeometry(3.1, 4.2);

    projects.forEach((proj, idx) => {
      const texture = createCardTexture(proj);
      // Use physical material to capture beautiful spotlight shines and specular glossiness
      const material = new THREE.MeshPhysicalMaterial({
        map: texture,
        roughness: 0.35,          // Increased roughness to diffuse specular hot-spot glare
        metalness: 0.12,          // Soft metallic sheen
        clearcoat: 0.5,           // Reduce mirror clearcoat glare
        clearcoatRoughness: 0.22, // Soft highlight contours
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(cardGeometry, material);
      
      // Starting positions (staggered in X)
      mesh.position.x = (idx - 1) * 3.8;
      mesh.position.z = 0;
      mesh.userData = {
        index: idx,
        projData: proj,
        baseX: (idx - 1) * 3.8,
        targetX: (idx - 1) * 3.8,
        targetY: 0,
        targetZ: 0,
        targetRotY: 0,
        targetRotX: 0,
        isHovered: false
      };

      scene.add(mesh);
      cardMeshes.push(mesh);
    });

    // Tracking mouse coordinates
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let isMouseOverContainer = false;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      // Normalize mouse between -1 and 1
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      isMouseOverContainer = true;
    });

    container.addEventListener('mouseleave', () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
      isMouseOverContainer = false;
    });

    // Raycasting for exact hovering
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    // Scroll progress from ScrollTrigger
    let scrollProgress = 0;
    
    // We bind the card showcase horizontal glide to scroll, pinning the wrapper when centered on screen!
    const projectsWrapper = document.querySelector('.project-3d-wrapper');
    if (projectsWrapper) {
      // 1. Core Pinning ScrollTrigger for horizontal glide card carousel
      ScrollTrigger.create({
        trigger: projectsWrapper,
        start: 'center center', // Pin when the center of the rounded box hits the center of the screen
        end: '+=200%',          // Lock the cards glide for 2 full screen heights of scroll progress
        pin: true,
        pinSpacing: true,       // Explicitly enforce pin spacing to preserve scroll flow
        scrub: 1.2,             // Buttery smooth inertial lag
        anticipatePin: 1,
        onUpdate: (self) => {
          if (self && !isNaN(self.progress)) {
            scrollProgress = self.progress; // ranges from 0 to 1
          } else {
            scrollProgress = 0;
          }
        }
      });

      // 2. Section-Bound Visibility Toggle ScrollTrigger to prevent pinning bleed-through/overlap glitches
      ScrollTrigger.create({
        trigger: '#projects',
        start: 'top bottom', // When top of projects enters screen bottom
        end: 'bottom top',   // When bottom of projects leaves screen top
        onToggle: (self) => {
          if (self.isActive) {
            projectsWrapper.style.visibility = 'visible';
            projectsWrapper.style.opacity = '1';
            projectsWrapper.style.pointerEvents = 'auto';
          } else {
            projectsWrapper.style.visibility = 'hidden';
            projectsWrapper.style.opacity = '0';
            projectsWrapper.style.pointerEvents = 'none';
          }
        }
      });
    }

    // Active project tracker to update overlay copy
    let activeIndex = 0;
    let overlayTimeout = null;
    function updateOverlay(index) {
      if (isNaN(index) || index < 0 || index >= projects.length) return;
      if (index === activeIndex) return;
      activeIndex = index;

      if (overlayTimeout) {
        clearTimeout(overlayTimeout);
      }

      overlay.classList.add('transitioning');
      
      const targetIndex = index;
      overlayTimeout = setTimeout(() => {
        const activeProj = projects[targetIndex];
        if (activeProj) {
          const activeProjNum = parseInt(activeProj.index) + 1;
          badgeEl.textContent = activeProjNum < 10 ? `0${activeProjNum}` : activeProjNum;
          titleEl.textContent = activeProj.title;
          descEl.textContent = activeProj.desc;
          badgeEl.style.background = `linear-gradient(135deg, ${activeProj.gradA}, ${activeProj.gradB})`;
        }
        overlay.classList.remove('transitioning');
        overlayTimeout = null;
      }, 300);
    }

    // Set initial overlay details
    badgeEl.textContent = `01`;
    titleEl.textContent = projects[0].title;
    descEl.textContent = projects[0].desc;
    badgeEl.style.background = `linear-gradient(135deg, ${projects[0].gradA}, ${projects[0].gradB})`;

    // Modal Control System
    const modal = document.getElementById('project-details-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalCloseBtn = document.getElementById('project-modal-close-btn');
    const modalCloseAction = document.getElementById('project-modal-close-action');
    const modalHeaderGrad = document.getElementById('modal-header-gradient');
    const modalBadge = document.getElementById('modal-badge');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalFeatures = document.getElementById('modal-features');
    const modalTech = document.getElementById('modal-tech');
    const modalGallery = document.getElementById('modal-gallery');
    const modalActionBtn = document.getElementById('modal-action-btn');
    const detailsTrigger = document.getElementById('view-details-trigger');

    function openProjectModal(index) {
      const proj = projects[index];
      if (!proj || !modal) return;

      const modalProjNum = parseInt(proj.index) + 1;
      const modalProjNumStr = modalProjNum < 10 ? `0${modalProjNum}` : modalProjNum;
      modalBadge.textContent = `Project ${modalProjNumStr}`;
      modalTitle.textContent = proj.title;
      modalDesc.textContent = proj.desc;
      
      modalHeaderGrad.style.background = `linear-gradient(135deg, ${proj.gradA}, ${proj.gradB})`;
      modalBadge.style.boxShadow = `0 0 15px ${proj.gradA}`;

      // Populate Visual Gallery Showcase
      if (modalGallery) {
        modalGallery.innerHTML = '';
        const idxVal = parseInt(proj.index);

        if (idxVal === 0) {
          // Live portfolio interactive iframe
          const iframe = document.createElement('iframe');
          iframe.src = 'https://akshattermux.github.io/Akshat-Sharma/';
          iframe.width = '100%';
          iframe.height = '240';
          iframe.frameBorder = '0';
          iframe.style.background = '#0d1421';
          iframe.style.borderRadius = '12px';
          iframe.style.border = '1px solid rgba(0, 255, 247, 0.2)';
          iframe.style.boxShadow = `0 0 24px rgba(0, 255, 247, 0.15)`;
          iframe.allowFullscreen = true;
          modalGallery.appendChild(iframe);
        } else {
          // Screenshot slides with fallbacks
          const screenshotData = {
            1: {
              srcs: ['img/work1.jpg', 'img/Projects/one.jpg'],
              falls: [
                'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80'
              ]
            },
            2: {
              srcs: ['img/work2.jpg', 'img/Projects/two.jpg'],
              falls: [
                'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80'
              ]
            },
            3: {
              srcs: ['img/Projects/three1.jpg', 'img/Projects/three.jpg'],
              falls: [
                'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'
              ]
            },
            4: {
              srcs: ['img/work4.jpg', 'img/Projects/Four.jpg'],
              falls: [
                'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&auto=format&fit=crop&q=80'
              ]
            },
            5: {
              srcs: ['img/work6.jpg', 'img/Projects/six.jpg'],
              falls: [
                'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&auto=format&fit=crop&q=80'
              ]
            },
            6: {
              srcs: ['img/work5.jpg', 'img/Projects/Five.jpg'],
              falls: [
                'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80'
              ]
            },
            7: {
              srcs: ['img/work7.png', 'img/Projects/seven.png'],
              falls: [
                'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80'
              ]
            },
            8: {
              srcs: ['img/work8.jpg', 'img/work8-1.jpg'],
              falls: [
                'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80'
              ]
            },
            9: {
              srcs: ['img/work9.jpeg', 'img/Projects/nine.jpeg'],
              falls: [
                'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=600&auto=format&fit=crop&q=80'
              ]
            }
          };

          const pData = screenshotData[idxVal];
          if (pData) {
            pData.srcs.forEach((src, sIdx) => {
              const img = document.createElement('img');
              img.src = src;
              img.alt = `${proj.title} Screen ${sIdx + 1}`;
              img.onerror = function() {
                this.onerror = null;
                this.src = pData.falls[sIdx];
              };
              modalGallery.appendChild(img);
            });
          }
        }
      }
      
      modalFeatures.innerHTML = '';
      proj.features.forEach((feat) => {
        if (!feat.trim()) return;
        const li = document.createElement('li');
        li.textContent = feat;
        modalFeatures.appendChild(li);
      });

      modalTech.innerHTML = '';
      const tags = proj.tech.split(',');
      tags.forEach((tag) => {
        if (!tag.trim()) return;
        const span = document.createElement('span');
        span.className = 'tech-tag';
        span.textContent = tag.trim();
        modalTech.appendChild(span);
      });

      // Clear old extra buttons if any
      const existingExtraBtn = document.getElementById('modal-action-btn-extra');
      if (existingExtraBtn) {
        existingExtraBtn.remove();
      }

      modalActionBtn.href = proj.link;
      modalActionBtn.textContent = 'Open Project Normally ↗';
      modalActionBtn.style.display = 'inline-block';

      // Check if it's FriendsBook (index 8) to show web and app buttons
      if (parseInt(proj.index) === 8) {
        modalActionBtn.textContent = 'Launch Web Platform ↗';
        
        // Add App Store/Play Store action button
        const appBtn = document.createElement('a');
        appBtn.id = 'modal-action-btn-extra';
        appBtn.href = 'https://play.google.com/store/apps/details?id=com.friendsbook.auth';
        appBtn.target = '_blank';
        appBtn.className = 'button primary';
        appBtn.style.background = 'linear-gradient(135deg, #a78bfa, #7c3aed)';
        appBtn.style.boxShadow = '0 0 15px rgba(167, 139, 250, 0.4)';
        appBtn.style.display = 'inline-block';
        appBtn.innerHTML = '<span style="display:flex; align-items:center; gap:6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle; fill:#fff;"><path d="M17.523 15.3414L20.655 20.7675C21.009 21.3813 20.799 22.1648 20.1855 22.5188C19.572 22.8728 18.7885 22.6628 18.4345 22.0493L15.2535 16.5383C12.9845 17.5028 10.4285 17.3828 8.27148 16.2023L5.05948 21.7658C4.70848 22.3813 3.92648 22.5958 3.31098 22.2448C2.69548 21.8938 2.48098 21.1118 2.83198 20.4963L6.08298 14.8658C2.96948 12.5693 1.05448 8.84777 1.00048 4.67277H23.0005C22.9465 8.84777 21.0315 12.5693 17.523 15.3414ZM7.00048 8.17277C7.00048 8.72505 7.4482 9.17277 8.00048 9.17277C8.55276 9.17277 9.00048 8.72505 9.00048 8.17277C9.00048 7.62048 8.55276 7.17277 8.00048 7.17277C7.4482 7.17277 7.00048 7.62048 7.00048 8.17277ZM15.0005 8.17277C15.0005 8.72505 15.4482 9.17277 16.0005 9.17277C16.5528 9.17277 17.0005 8.72505 17.0005 8.17277C17.0005 7.62048 16.5528 7.17277 16.0005 7.17277C15.4482 7.17277 15.0005 7.62048 15.0005 8.17277Z"/></svg>Get Android App ↗</span>';
        
        const modalActions = document.querySelector('.project-modal-actions');
        if (modalActions && modalCloseAction) {
          modalActions.insertBefore(appBtn, modalCloseAction);
        }
      }

      modal.classList.add('active');
      
      gsap.fromTo('.project-modal-card', 
        { scale: 0.88, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' }
      );
    }
    window.openProjectModal = openProjectModal;

    function closeProjectModal() {
      if (!modal) return;
      gsap.to('.project-modal-card', {
        scale: 0.9,
        opacity: 0,
        y: 20,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          modal.classList.remove('active');
        }
      });
    }

    if (detailsTrigger) {
      detailsTrigger.addEventListener('click', () => {
        openProjectModal(activeIndex);
      });
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
    if (modalCloseAction) modalCloseAction.addEventListener('click', closeProjectModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);

    // Resize Handler
    function handleResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Adjust camera distance dynamically based on width and aspect ratio to ensure cards are huge and never cut off!
      const aspect = w / h;
      if (w < 600) {
        camera.position.z = 9.5;
      } else if (w < 900) {
        camera.position.z = 8.5;
      } else {
        // Dynamic cap: if aspect is high (short/wide screen), decrease Z to bring cards closer and larger!
        camera.position.z = Math.max(5.8, Math.min(8.5, 8.5 - (aspect - 1.7) * 1.3));
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    // Click handler to select and highlight projects
    container.addEventListener('click', (e) => {
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(cardMeshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const index = clickedMesh.userData.index;
        updateOverlay(index);

        // Highlight jump effect
        gsap.to(clickedMesh.position, {
          z: 1.2,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
          onComplete: () => {
            openProjectModal(index);
          }
        });
      }
    });

    const clock = new THREE.Clock();

    // Animation Render Loop
    function animate() {
      requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Lerp mouse coordinates for maximum butter-smooth movement
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // Spotlight follows mouse with an elegant diagonal offset to prevent direct specular hot-spot burns on text
      spotLight.position.x = mouse.x * 6 + 1.2;
      spotLight.position.y = mouse.y * 4 + 2.5;

      // Cover Flow spacing & slide calculations based on Scroll Progress
      // Scroll moves the cards from right to left
      // We map scrollProgress (0 to 1) to horizontal displacement offset
      // Dynamically scale based on the actual number of projects loaded
      let safeScrollProgress = parseFloat(scrollProgress);
      if (isNaN(safeScrollProgress) || typeof safeScrollProgress !== 'number') {
        safeScrollProgress = 0;
      }
      const targetScrollOffset = safeScrollProgress * (projects.length - 1);
      
      // Determine which card is currently closest to the center
      let currentActiveIndex = Math.round(targetScrollOffset);
      if (isNaN(currentActiveIndex)) {
        currentActiveIndex = 0;
      } else {
        currentActiveIndex = Math.max(0, Math.min(projects.length - 1, currentActiveIndex));
      }
      updateOverlay(currentActiveIndex);

      // Raycast testing for card hover
      mouseVector.x = mouse.x;
      mouseVector.y = mouse.y;
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(cardMeshes);
      let hoveredIndex = -1;
      if (intersects.length > 0 && isMouseOverContainer) {
        hoveredIndex = intersects[0].object.userData.index;
      }

      cardMeshes.forEach((mesh, idx) => {
        const data = mesh.userData;
        const isHovered = (idx === hoveredIndex);
        data.isHovered = isHovered;

        // Cover Flow math!
        // Calculate displacement from centered position
        const activeOffset = idx - targetScrollOffset; // 0 when card is exactly centered
        
        // 1. Target Position X
        // Centered card stays in middle, side cards slide away to give space
        let posX = activeOffset * 3.5;
        if (activeOffset > 0.1) {
          posX += 0.5; // push right cards further right
        } else if (activeOffset < -0.1) {
          posX -= 0.5; // push left cards further left
        }
        data.targetX = posX;

        // 2. Target Position Z & Rotation Y
        // Centered card stands in front, side cards fall back and rotate inward (Apple Cover Flow!)
        if (Math.abs(activeOffset) < 0.1) {
          data.targetZ = isHovered ? 1.0 : 0.4;
          data.targetRotY = 0;
          data.targetRotX = isHovered ? mouse.y * 0.15 : 0;
        } else {
          data.targetZ = -1.2;
          // Rotate cards on left outward, right inward
          data.targetRotY = activeOffset > 0 ? -Math.PI / 4.2 : Math.PI / 4.2;
          data.targetRotX = 0;
        }

        // Add soft interactive floating wave so the 3D scene feels organic
        const floatAnim = Math.sin(time * 1.5 + idx * 2.0) * 0.08;
        
        // Lerp positions & rotations for fluid motion physics
        mesh.position.x += (data.targetX - mesh.position.x) * 0.09;
        mesh.position.y += (data.targetY + floatAnim + (isHovered ? mouse.y * 0.25 : 0) - mesh.position.y) * 0.09;
        mesh.position.z += (data.targetZ - mesh.position.z) * 0.09;

        // Rotations
        mesh.rotation.y += (data.targetRotY + (isHovered ? mouse.x * 0.25 : 0) - mesh.rotation.y) * 0.09;
        mesh.rotation.x += (data.targetRotX - mesh.rotation.x) * 0.09;
        mesh.rotation.z += ((isHovered ? -mouse.x * 0.08 : 0) - mesh.rotation.z) * 0.09;

        // Scale up on hover
        const targetScale = isHovered ? 1.08 : 1.0;
        mesh.scale.x += (targetScale - mesh.scale.x) * 0.12;
        mesh.scale.y += (targetScale - mesh.scale.y) * 0.12;
        mesh.scale.z += (targetScale - mesh.scale.z) * 0.12;
      });

      renderer.render(scene, camera);
    }

    animate();
  }

  // Initialize Three.js Projects Showcase
  init3DProjects();
  ScrollTrigger.refresh();

  // --- Retro Sound Effect Synthesis Engine (SoundManager) ---
  const SoundManager = {
    ctx: null,
    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },
    playOscillator(freq, type, duration, volume = 0.05, decay = 0.0001) {
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(decay, this.ctx.currentTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (err) {
        console.warn('Audio play failure:', err);
      }
    },
    playType() {
      this.playOscillator(1400 + Math.random() * 200, 'sine', 0.015, 0.02, 0.0001);
    },
    playError() {
      this.playOscillator(110, 'sawtooth', 0.25, 0.12, 0.001);
    },
    playTick() {
      this.playOscillator(750, 'triangle', 0.012, 0.04, 0.0001);
    },
    playScore() {
      try {
        this.init();
        if (!this.ctx) return;
        this.playOscillator(587.33, 'sine', 0.12, 0.06, 0.0001); // D5
        setTimeout(() => {
          this.playOscillator(1174.66, 'sine', 0.18, 0.06, 0.0001); // D6
        }, 80);
      } catch (e) {}
    },
    playBoot() {
      try {
        this.init();
        if (!this.ctx) return;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major arpeggio
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            this.playOscillator(freq, 'sine', 0.35, 0.03, 0.0001);
          }, idx * 60);
        });
      } catch (e) {}
    },
    playPowerOff() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const duration = 0.35;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + duration);
        
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(now + duration);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // --- Dynamic Color Theme Manager (ThemeManager) ---
  const ThemeManager = {
    activeTheme: localStorage.getItem('akshatos_theme') || 'obsidian',
    setTheme(themeName) {
      const allowedThemes = ['obsidian', 'cyberpunk', 'matrix', 'solar'];
      const normalized = themeName.toLowerCase().trim();
      if (!allowedThemes.includes(normalized)) {
        return false;
      }
      this.activeTheme = normalized;
      localStorage.setItem('akshatos_theme', normalized);
      
      if (normalized === 'obsidian') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', normalized);
      }
      return true;
    }
  };
  
  // Apply saved theme immediately on load
  ThemeManager.setTheme(ThemeManager.activeTheme);

  // --- Interactive Retro CLI Terminal Engine (AkshatOS) ---
  const terminalOverlay = document.getElementById('terminal-overlay');
  const terminalTrigger = document.getElementById('terminal-trigger');
  const terminalCloseX = document.getElementById('terminal-close-x');
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalBody = document.getElementById('terminal-body');
  const matrixCanvas = document.getElementById('matrix-canvas');
  const matrixHint = document.getElementById('matrix-exit-hint');
  
  let isTerminalOpen = false;
  let commandHistory = [];
  let historyIndex = -1;
  const pageStartTime = performance.now();
  let hasBooted = false;

  function bootSequence() {
    hasBooted = true;
    terminalInput.disabled = true;
    terminalOutput.innerHTML = '';
    
    const bootLines = [
      { text: '[   0.000000] Booting AkshatOS Kernel v1.8.2-LTS...', type: 'welcome-msg' },
      { text: '[   0.082491] Syncing active project assets... DONE', type: 'term-success' },
      { text: '[   0.210928] Establishing 3D Cover Flow coordinates... ACTIVE', type: 'term-info' },
      { text: '[   0.345021] Mounting creative telemetry nodes... OK', type: 'term-success' },
      { text: '[   0.491290] Bypassing secure firewall environment... BYPASSED', type: 'term-highlight' },
      { text: '<br>Welcome Akshat Sharma Vats! AkshatOS Terminal Console Ready.<br>Type <span class="term-highlight">help</span> to view active system directives.<br>', type: 'welcome-msg' }
    ];

    let currentLine = 0;
    
    function printNextBootLine() {
      if (currentLine < bootLines.length) {
        printLine(bootLines[currentLine].text, bootLines[currentLine].type);
        currentLine++;
        setTimeout(printNextBootLine, 75); // fast typing cadence
      } else {
        terminalInput.disabled = false;
        terminalInput.focus();
      }
    }
    
    printNextBootLine();
  }

  function toggleTerminal() {
    isTerminalOpen = !isTerminalOpen;
    if (isTerminalOpen) {
      terminalOverlay.classList.add('active');
      if (lenisInstance) lenisInstance.stop(); // Stop scroll when terminal is active
      
      if (!hasBooted) {
        setTimeout(bootSequence, 180);
      } else {
        setTimeout(() => terminalInput.focus(), 150);
      }
      showToast('Session established. AkshatOS Console loaded.', 'info');
    } else {
      terminalOverlay.classList.remove('active');
      if (lenisInstance) lenisInstance.start(); // Resume scroll
      terminalInput.blur();
      stopMatrix();
      stopTelemetry();
      stopSnake();
    }
  }

  if (terminalTrigger) terminalTrigger.addEventListener('click', toggleTerminal);
  if (terminalCloseX) terminalCloseX.addEventListener('click', () => toggleTerminal());
  
  // Close overlay on clicking backdrop (except clicking the terminal window itself)
  terminalOverlay.addEventListener('click', (e) => {
    if (e.target === terminalOverlay) {
      toggleTerminal();
    }
  });

  // Clicking anywhere inside terminal container focuses the input box
  const terminalContainer = document.querySelector('.terminal-container');
  if (terminalContainer) {
    terminalContainer.addEventListener('click', (e) => {
      // Don't focus if selecting text or clicking a link
      if (window.getSelection().toString() === '' && !e.target.classList.contains('term-link-item')) {
        terminalInput.focus();
      }
    });
  }

  // Trap backtick ` key for toggle, and ESC key for exit
  window.addEventListener('keydown', (e) => {
    if (e.key === '`') {
      e.preventDefault();
      toggleTerminal();
    } else if (e.key === 'Escape') {
      if (matrixCanvas.style.display === 'block') {
        stopMatrix();
      } else if (isTelemetryRunning) {
        stopTelemetry();
      } else if (isSnakeRunning) {
        stopSnake();
      } else if (isTerminalOpen) {
        toggleTerminal();
      }
    }
  });

  // Terminal Input Handling
  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      // Typewriter key press sounds sync
      if (e.key !== 'Enter' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
        SoundManager.playType();
      }

      if (e.key === 'Enter') {
        const fullInput = terminalInput.value;
        const trimmedInput = fullInput.trim();
        
        if (trimmedInput !== '') {
          commandHistory.push(trimmedInput);
          historyIndex = commandHistory.length;
        }

        // Print input line in exact premium powerline prompt style
        printLine(`<span class="prompt-arrow">➜</span> <span class="prompt-dir">~</span> <span class="prompt-user">[akshat.os]</span> <span class="prompt-char">›</span> ${fullInput}`);
        
        // Execute Command
        executeCommand(trimmedInput);
        
        terminalInput.value = '';
        terminalBody.scrollTop = terminalBody.scrollHeight;
      } 
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0 && historyIndex > 0) {
          historyIndex--;
          terminalInput.value = commandHistory[historyIndex];
        }
      } 
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
          historyIndex++;
          terminalInput.value = commandHistory[historyIndex];
        } else if (historyIndex === commandHistory.length - 1) {
          historyIndex = commandHistory.length;
          terminalInput.value = '';
        }
      }
    });
  }

  function printLine(text, type = '') {
    const p = document.createElement('p');
    p.className = `term-line ${type}`;
    p.innerHTML = text;
    terminalOutput.appendChild(p);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Project data reference from init3DProjects
  let parsedProjects = [];
  try {
    const projectCards = document.querySelectorAll('.project-card-data');
    projectCards.forEach((card) => {
      parsedProjects.push({
        index: card.getAttribute('data-index'),
        title: card.querySelector('h3').textContent,
        link: card.getAttribute('data-link') || '#',
      });
    });
  } catch (err) {
    console.error('Failed to parse projects for terminal:', err);
  }

  function executeCommand(cmd) {
    const parts = cmd.toLowerCase().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    if (command === '') return;

    switch (command) {
      case 'help':
        printLine('Available Terminal Commands:', 'term-highlight');
        printLine('  <span class="term-info">about</span>          - Print developer information & bio');
        printLine('  <span class="term-info">projects</span>       - Access selected project directories');
        printLine('  <span class="term-info">timeline</span>       - Display execution roadmap / operational process');
        printLine('  <span class="term-info">contact</span>        - Display encrypted communications paths');
        printLine('  <span class="term-info">theme &lt;name&gt;</span>   - Cycle system color themes (obsidian, cyberpunk, matrix, solar)');
        printLine('  <span class="term-info">telemetry</span>      - Display live hardware sweep radar & oscilloscope telemetry');
        printLine('  <span class="term-info">snake</span>          - Launch decryptor classic game with sound sync');
        printLine('  <span class="term-info">neofetch</span>       - Render systems capability and kernel telemetry');
        printLine('  <span class="term-info">matrix</span>         - Initialize cyber decryption streams');
        printLine('  <span class="term-info">hack</span>           - Simulate remote root-access breach sequence');
        printLine('  <span class="term-info">clear</span>          - Clear console buffers');
        printLine('  <span class="term-info">exit</span>           - Terminate terminal session');
        break;

      case 'theme':
        if (args.length === 0 || args[0] === '') {
          printLine(`Active System Theme: <span class="term-highlight">${ThemeManager.activeTheme.toUpperCase()}</span>`);
          printLine('Available dynamic themes: obsidian, cyberpunk, matrix, solar. Usage: <span class="term-info">theme &lt;name&gt;</span>');
        } else {
          const success = ThemeManager.setTheme(args[0]);
          if (!success) {
            printLine(`bash: theme not found: ${args[0]}. Choose from: obsidian, cyberpunk, matrix, solar.`, 'term-error');
            SoundManager.playError();
          } else {
            printLine(`Uplink established. System theme dynamically updated to: <span class="term-highlight">${args[0].toUpperCase()}</span>`, 'term-success');
          }
        }
        break;

      case 'telemetry':
        startTelemetry();
        break;

      case 'snake':
        startSnake();
        break;

      case 'about':
        printLine('System Profile: Akshat Sharma Vats', 'term-highlight');
        printLine('--------------------------------------------');
        printLine('I am a BCA passout creative developer with a deep structural command over both hardware and software systems.');
        printLine('I bridge the gap between physical hardware telemetry and immersive web animations, marrying robust programming architectures with futuristic aesthetics.');
        printLine('My focus lies in detailed layout compositions, elastic scroll pacing, and custom canvas render engines.');
        break;

      case 'projects':
        printLine('Index of Operational Deliverables:', 'term-highlight');
        printLine('--------------------------------------------');
        if (parsedProjects.length === 0) {
          printLine('No projects registered in directory cache.');
        } else {
          printLine('Click an item to examine case studies directly:');
          parsedProjects.forEach((proj, idx) => {
            const num = String(idx + 1).padStart(2, '0');
            printLine(`  [${num}] <span class="term-link-item" onclick="window.terminalActionTrigger(${idx})">${proj.title}</span>`);
          });
        }
        break;

      case 'timeline':
        printLine('Operational Roadmap Sequence:', 'term-highlight');
        printLine('--------------------------------------------');
        printLine('  [Phase 01: Direction] ──► Visual tone, grid framework setup, flow design.');
        printLine('  [Phase 02: Build]     ──► Canvas buffer loops, Three.js layout grids, GSAP binding.');
        printLine('  [Phase 03: Delivery]  ──► Cache validation, telemetry streams, final pass.');
        break;

      case 'contact':
        printLine('Secure Communication Telemetry:', 'term-highlight');
        printLine('--------------------------------------------');
        printLine('  Email : <a href="mailto:akshatsharma5645@gmail.com" class="term-link-item" target="_blank">akshatsharma5645@gmail.com</a>');
        printLine('  Phone : <a href="tel:+918979995507" class="term-link-item">+91 89799 95507</a>');
        printLine('  GitHub: <a href="https://github.com/Akshattermux" class="term-link-item" target="_blank">Akshattermux</a>');
        printLine('  Insta : <a href="https://instagram.com/akshat.sharma.vats" class="term-link-item" target="_blank">akshat.sharma.vats</a>');
        printLine('  Loc   : Rampur Maniharan, Saharanpur, UP - 247451');
        break;

      case 'clear':
        terminalOutput.innerHTML = '';
        break;

      case 'exit':
        toggleTerminal();
        break;

      case 'neofetch':
        printNeofetch();
        break;

      case 'matrix':
        printLine('Initializing decrypt streams...', 'term-success');
        setTimeout(() => startMatrix(), 400);
        break;

      case 'hack':
        runHackSimulation();
        break;

      default:
        printLine(`bash: command not found: ${command}. Type <span class="term-highlight">help</span> for guidelines.`, 'term-line');
    }
  }

  // Expose link trigger function globally to connect terminal link to openThreeJS modal
  window.terminalActionTrigger = function(index) {
    toggleTerminal(); // Close terminal
    setTimeout(() => {
      // Find case study details trigger in page
      const modal = document.getElementById('project-details-modal');
      if (modal && typeof window.openProjectModal === 'function') {
        window.openProjectModal(index);
      } else {
        // Fallback: trigger page scroll to projects section
        const projSection = document.getElementById('projects');
        if (projSection) {
          projSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 300);
  };

  function printNeofetch() {
    const uptimeMs = performance.now() - pageStartTime;
    const uptimeSec = Math.floor(uptimeMs / 1000);
    const uptimeMin = Math.floor(uptimeSec / 60);
    const uptimeStr = uptimeMin > 0 ? `${uptimeMin} mins, ${uptimeSec % 60} secs` : `${uptimeSec} secs`;

    const asciiLogo = `
     _  _  _   _ 
    |_||_||_ |  |
    | || ||_ |  |
   
   AKSHAT SHARMA VATS
    `;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const infoHTML = `
      <div class="neofetch-grid">
        <div class="neofetch-logo">${asciiLogo}</div>
        <div class="neofetch-info">
          <div><span class="term-highlight">akshat</span>@<span class="term-highlight">akshatos</span></div>
          <div>-------------------------</div>
          <div><strong>OS</strong>: AkshatOS v1.8.2-LTS x86_64</div>
          <div><strong>Host</strong>: Creative Developer Portfolio Node</div>
          <div><strong>Kernel</strong>: 5.15.0-akshattermux-creative</div>
          <div><strong>Uptime</strong>: ${uptimeStr}</div>
          <div><strong>Shell</strong>: bash-termux v5.1.16</div>
          <div><strong>Resolution</strong>: ${screenWidth}x${screenHeight}</div>
          <div><strong>DE</strong>: ThreeJS WebGL Engine</div>
          <div><strong>WM</strong>: GSAP ScrollTrigger Window Manager</div>
          <div><strong>CPU</strong>: PyTorch Cognitive Agent & ML Layer</div>
          <div><strong>GPU</strong>: Custom Canvas 2D Sequence Engine</div>
          <div><strong>Memory</strong>: 100% Polish Architecture</div>
          <div><strong>Telemetry Node</strong>: ESP32 WiFi Servo Radar Core</div>
        </div>
      </div>
    `;
    printLine(infoHTML);
  }

  function runHackSimulation() {
    terminalInput.disabled = true;
    
    // SOUND STAGE 1: Penetration boot up
    printLine('[+] INITIALIZING COGNITIVE PENETRATION FRAMEWORK v4.2.1-EXPLOIT...', 'term-highlight');
    SoundManager.playOscillator(900, 'sawtooth', 0.15, 0.05);

    // Dynamic SSH loading sequence
    setTimeout(() => {
      printLine('[!] ESTABLISHING SSH HANDSHAKE OVER PORT 8080... DIRECT DIAL: 192.168.100.89', 'term-info');
      SoundManager.playOscillator(1046.5, 'sine', 0.08, 0.03);
    }, 400);

    setTimeout(() => {
      const progressEl = document.createElement('p');
      progressEl.className = 'term-line term-info';
      progressEl.innerHTML = 'SSH EXPLOIT INJECTION: [░░░░░░░░░░] 0%';
      terminalOutput.appendChild(progressEl);

      let progressVal = 0;
      const interval = setInterval(() => {
        progressVal += 10;
        const filled = Math.floor(progressVal / 10);
        const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
        progressEl.innerHTML = `SSH EXPLOIT INJECTION: [${bar}] ${progressVal}%`;
        SoundManager.playOscillator(1500 + progressVal * 8, 'sine', 0.02, 0.02, 0.0001);
        terminalBody.scrollTop = terminalBody.scrollHeight;

        if (progressVal >= 100) {
          clearInterval(interval);
          // Run Stack overflow seek next
          runExploitStage();
        }
      }, 70);
    }, 900);

    function runExploitStage() {
      printLine('[✓] HANDSHAKE COMPLETED successfully.', 'term-success');
      printLine('[+] EXPLOITING STACK OVERFLOW BUFFER... BYPASSING PORT SECURITY...', 'term-info');
      SoundManager.playOscillator(1174.7, 'sine', 0.08, 0.03);

      // Memory Seek dynamic print
      setTimeout(() => {
        printLine('[!] DECRYPTING SYSTEM ROOT HEAP MEMORY ADDRESSES:', 'term-highlight');
        
        let count = 0;
        const maxMemCount = 6;
        const memAddresses = [
          '0x7FFD0A9C', '0x7FFD0B12', '0x7FFF004A', '0x7FFF008E', '0x7FFF01AC', '0x7FFF02E3'
        ];

        const memInterval = setInterval(() => {
          if (count < maxMemCount) {
            const hex = Math.floor(Math.random() * 4294967295).toString(16).toUpperCase();
            printLine(`  [MEM_SEEK] ${memAddresses[count]} -> [ DECRYPTED: 0x${hex} ] -> <span class="term-success">OK</span>`);
            SoundManager.playOscillator(2000 - count * 150, 'triangle', 0.03, 0.03, 0.0001);
            terminalBody.scrollTop = terminalBody.scrollHeight;
            count++;
          } else {
            clearInterval(memInterval);
            runNeuralBypass();
          }
        }, 120);
      }, 500);
    }

    function runNeuralBypass() {
      printLine('[✓] BYPASS COMPLETED. LOCAL ACCESS LEVEL: ROOT', 'term-success');
      SoundManager.playScore();
      terminalBody.scrollTop = terminalBody.scrollHeight;

      setTimeout(() => {
        printLine('[!] BYPASSING AKSHATOS CORE COGNITIVE LAYER CODENAME: [VATSKY]...', 'term-highlight');
        SoundManager.playOscillator(600, 'sawtooth', 0.2, 0.06);
      }, 500);

      setTimeout(() => {
        printLine('[✓] COGNITIVE KEY ESTABLISHED: LEVEL 4 ROOT ACCESS CONFIRMED!', 'term-success');
        SoundManager.playScore();
        terminalBody.scrollTop = terminalBody.scrollHeight;
        runExfiltration();
      }, 1100);
    }

    function runExfiltration() {
      setTimeout(() => {
        printLine('[+] EXFILTRATING HIGH-VALUE INTEL DIRECTORIES...', 'term-info');
        SoundManager.playTick();
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }, 400);

      const intelItems = [
        { name: '/nodes/prompt_architect.model', status: 'BYPASSED', type: 'term-success' },
        { name: '/nodes/canvas_particle.vector', status: 'HIJACKED', type: 'term-highlight' },
        { name: '/nodes/hardware_esp32.firmware', status: 'CRACKED', type: 'term-highlight' },
        { name: '/nodes/aws_server_mgmt.config', status: 'ACQUIRED', type: 'term-success' },
        { name: '/nodes/akshat_sharma_vats.bio', status: 'DUPLICATED', type: 'term-success' }
      ];

      intelItems.forEach((item, idx) => {
        setTimeout(() => {
          printLine(`  -> ${item.name.padEnd(35, '.')} [ <span class="${item.type}">${item.status}</span> ]`);
          SoundManager.playTick();
          terminalBody.scrollTop = terminalBody.scrollHeight;
          
          if (idx === intelItems.length - 1) {
            runBreachComplete();
          }
        }, 800 + idx * 250);
      });
    }

    function runBreachComplete() {
      setTimeout(() => {
        const asciiSkull = `
<pre class="term-success" style="font-family:'Courier New', monospace; line-height:1.1; font-size:12px; margin: 10px 0; text-align: center; text-shadow: 0 0 5px var(--accent-2);">
         .---.
       .'  __  __ '.
      /   (o)  (o)  \\
      |    _    _   |
      |   '-'  '-'  |
       \\  '------'  /
        '.________.'
           ||||
</pre>
        `;
        const asciiLogo = `
<pre class="term-success" style="font-family:'Courier New', monospace; line-height:1.2; font-size:12px; margin: 10px 0; text-shadow: 0 0 5px var(--accent-2);">
 ██████╗ ██████╗ ███████╗ █████╗  ██████╗██╗  ██╗
 ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝██║  ██║
 ██████╔╝██████╔╝█████╗  ███████║██║     ███████║
 ██╔══██╗██╔══██╗██╔══╝  ██╔══██║██║     ██╔══██║
 ██████╔╝██║  ██║███████╗██║  ██║╚██████╗██║  ██║
 ╚══════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
</pre>
        `;
        printLine(asciiSkull);
        printLine(asciiLogo);
        printLine('====================================================', 'term-success');
        printLine('     SYSTEM INTRUSION SUCCESSFUL: AKSHATOS OWNED!    ', 'term-highlight');
        printLine('====================================================', 'term-success');
        SoundManager.playBoot();
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }, 600);

      setTimeout(() => {
        terminalInput.disabled = false;
        terminalInput.focus();
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }, 1000);
    }
  }

  // --- Matrix Canvas Rain Animation Stream ---
  let matrixInterval = null;
  let matrixContext = null;
  let matrixColumns = [];
  let matrixFontSize = 14;

  function startMatrix() {
    // Hide visual details temporarily
    terminalOverlay.style.opacity = '0';
    matrixCanvas.style.display = 'block';
    matrixHint.style.display = 'block';

    const resizeCanvas = () => {
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
      
      const colsCount = Math.floor(matrixCanvas.width / matrixFontSize) + 1;
      matrixColumns = [];
      for (let i = 0; i < colsCount; i++) {
        matrixColumns.push(Math.random() * -100); // Random offset above view
      }
    };

    matrixContext = matrixCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Character set: numbers + letters + katakana
    const charList = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン".split("");

    function drawRain() {
      matrixContext.fillStyle = 'rgba(0, 0, 0, 0.05)';
      matrixContext.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      matrixContext.fillStyle = '#0f0';
      matrixContext.font = `bold ${matrixFontSize}px monospace`;
      matrixContext.shadowColor = '#0f0';
      matrixContext.shadowBlur = 8;

      matrixColumns.forEach((y, x) => {
        const char = charList[Math.floor(Math.random() * charList.length)];
        const xPos = x * matrixFontSize;
        const yPos = y * matrixFontSize;

        // Draw character
        matrixContext.fillText(char, xPos, yPos);

        // Reset if offscreen or random trigger
        if (yPos > matrixCanvas.height && Math.random() > 0.975) {
          matrixColumns[x] = 0;
        } else {
          matrixColumns[x]++;
        }
      });
      matrixContext.shadowBlur = 0; // Reset blur
    }

    matrixInterval = setInterval(drawRain, 33); // ~30 FPS

    // Cancel click handler
    matrixCanvas.addEventListener('click', stopMatrix, { once: true });
  }

  function stopMatrix() {
    if (matrixInterval) {
      clearInterval(matrixInterval);
      matrixInterval = null;
    }
    matrixCanvas.style.display = 'none';
    matrixHint.style.display = 'none';
    
    // Fade terminal back in
    if (isTerminalOpen) {
      terminalOverlay.style.opacity = '1';
      terminalInput.focus();
    }
  }

  // --- Live Telemetry and Snake Game Globals & Implementations ---
  let isTelemetryRunning = false;
  let telemetryRafId = null;
  const gameCanvas = document.getElementById('terminal-game-canvas');
  const canvasView = document.getElementById('terminal-canvas-view');

  let isSnakeRunning = false;
  let snakeInterval = null;
  let snakeScore = 0;
  let snakeHighScore = parseInt(localStorage.getItem('akshatos_snake_highscore') || '0');
  let snakeDir = 'right';
  let snakeNextDir = 'right';

  const mobileCanvasExitBtn = document.getElementById('mobile-canvas-exit');
  const snakeCtrlBtns = document.querySelectorAll('.snake-ctrl-btn');
  
  if (mobileCanvasExitBtn) {
    mobileCanvasExitBtn.addEventListener('click', () => {
      if (isTelemetryRunning) stopTelemetry();
      if (isSnakeRunning) stopSnake();
    });
  }
  
  const handleMobileSnakeCtrl = (clickedDir) => {
    if (!isSnakeRunning) return;
    if (clickedDir === 'up' && snakeDir !== 'down') snakeNextDir = 'up';
    else if (clickedDir === 'down' && snakeDir !== 'up') snakeNextDir = 'down';
    else if (clickedDir === 'left' && snakeDir !== 'right') snakeNextDir = 'left';
    else if (clickedDir === 'right' && snakeDir !== 'left') snakeNextDir = 'right';
    SoundManager.playTick();
  };

  snakeCtrlBtns.forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleMobileSnakeCtrl(btn.getAttribute('data-dir'));
    });
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleMobileSnakeCtrl(btn.getAttribute('data-dir'));
    });
  });

  function startTelemetry() {
    if (!gameCanvas || !canvasView) return;
    
    if (isSnakeRunning) stopSnake();
    
    isTelemetryRunning = true;
    canvasView.classList.add('active');
    
    SoundManager.playBoot();
    printLine('Establishing secure uplink connection to remote IoT telemetry hardware nodes...', 'term-success');
    printLine('Displaying real-time sweep radar and channel oscilloscope data stream. Press [ESC] to exit.', 'term-info');
    
    const ctx = gameCanvas.getContext('2d');
    let angle = 0;
    const blips = [];
    const wavePoints = [];
    const maxWavePoints = 120;
    
    const resizeGameCanvas = () => {
      const rect = canvasView.getBoundingClientRect();
      gameCanvas.width = rect.width - 48;
      gameCanvas.height = rect.height - 96;
    };
    resizeGameCanvas();
    window.addEventListener('resize', resizeGameCanvas);
    
    function drawTelemetry() {
      if (!isTelemetryRunning) return;
      
      ctx.fillStyle = 'rgba(2, 5, 11, 0.15)';
      ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
      
      const cx = gameCanvas.width / 2;
      const cy = gameCanvas.height * 0.42;
      const radius = Math.min(cx, cy) * 0.85;
      
      ctx.strokeStyle = 'rgba(56, 214, 199, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - radius - 15, cy);
      ctx.lineTo(cx + radius + 15, cy);
      ctx.moveTo(cx, cy - radius - 15);
      ctx.lineTo(cx, cy + radius + 15);
      ctx.stroke();
      
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * (i / 4), 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.strokeStyle = 'rgba(56, 214, 199, 0.28)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
      ctx.stroke();
      
      const scanX = cx + Math.cos(angle) * radius;
      const scanY = cy + Math.sin(angle) * radius;
      
      ctx.strokeStyle = 'rgba(56, 214, 199, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = 'rgba(56, 214, 199, 0.6)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(scanX, scanY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      if (Math.random() < 0.02 && blips.length < 8) {
        const blipAngle = Math.random() * Math.PI * 2;
        const blipDist = (0.25 + Math.random() * 0.72) * radius;
        blips.push({
          x: cx + Math.cos(blipAngle) * blipDist,
          y: cy + Math.sin(blipAngle) * blipDist,
          alpha: 1.0,
          soundPlayed: false
        });
      }
      
      blips.forEach((blip, index) => {
        ctx.fillStyle = `rgba(255, 179, 71, ${blip.alpha})`;
        ctx.beginPath();
        ctx.arc(blip.x, blip.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = `rgba(255, 179, 71, ${blip.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(blip.x, blip.y, 10 * (2.0 - blip.alpha), 0, Math.PI * 2);
        ctx.stroke();
        
        const sweepDiff = Math.abs(angle - Math.atan2(blip.y - cy, blip.x - cx));
        if (sweepDiff < 0.08 && !blip.soundPlayed) {
          SoundManager.playOscillator(1200, 'sine', 0.08, 0.02, 0.0001);
          blip.soundPlayed = true;
        }
        
        blip.alpha -= 0.0085;
        if (blip.alpha <= 0) {
          blips.splice(index, 1);
        }
      });
      
      angle = (angle + 0.024) % (Math.PI * 2);
      
      const oscY = gameCanvas.height * 0.85;
      const oscH = gameCanvas.height * 0.12;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.fillRect(32, oscY - oscH - 10, gameCanvas.width - 64, oscH * 2 + 20);
      ctx.strokeRect(32, oscY - oscH - 10, gameCanvas.width - 64, oscH * 2 + 20);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.beginPath();
      ctx.moveTo(32, oscY);
      ctx.lineTo(gameCanvas.width - 32, oscY);
      ctx.stroke();
      
      const nextWaveVal = Math.sin(Date.now() * 0.01) * Math.cos(Date.now() * 0.003) * (oscH * 0.6) + (Math.random() - 0.5) * 6;
      wavePoints.push(nextWaveVal);
      if (wavePoints.length > maxWavePoints) {
        wavePoints.shift();
      }
      
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      
      const step = (gameCanvas.width - 74) / maxWavePoints;
      for (let i = 0; i < wavePoints.length; i++) {
        const xPos = 37 + i * step;
        const yPos = oscY + wavePoints[i];
        if (i === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      ctx.font = '10px "Roboto Mono", monospace';
      ctx.fillStyle = 'rgba(56, 214, 199, 0.7)';
      ctx.fillText(`UPLINK STATUS: SECURE (100%)`, 45, 45);
      ctx.fillText(`RADAR COMPONENT: ESP32 WIFI SWEEP`, 45, 60);
      ctx.fillText(`FPS: 60 / HW CLOCK: SYNCED`, 45, 75);
      ctx.fillText(`SWEEP RESOLUTION: 0.18deg`, 45, 90);
      
      ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.fillText(`OSCILLOSCOPE CHANNEL: TELEMETRY_MAIN_CH1`, gameCanvas.width - 290, 45);
      ctx.fillText(`SIGNAL STATE: CONVERGENT`, gameCanvas.width - 290, 60);
      ctx.fillText(`FREQ OFFSET: ${(150 + Math.sin(Date.now()*0.001)*12).toFixed(2)}Hz`, gameCanvas.width - 290, 75);
      ctx.fillText(`ATTENUATION: -3dB`, gameCanvas.width - 290, 90);
      
      telemetryRafId = requestAnimationFrame(drawTelemetry);
    }
    
    telemetryRafId = requestAnimationFrame(drawTelemetry);
  }

  function stopTelemetry() {
    if (!isTelemetryRunning) return;
    isTelemetryRunning = false;
    
    if (telemetryRafId) {
      cancelAnimationFrame(telemetryRafId);
      telemetryRafId = null;
    }
    
    if (canvasView) {
      canvasView.classList.remove('active');
    }
    
    SoundManager.playPowerOff();
    printLine('Visual telemetry channel terminated. Connection securely closed.', 'term-error');
  }

  function startSnake() {
    if (!gameCanvas || !canvasView) return;
    
    if (isTelemetryRunning) stopTelemetry();
    
    isSnakeRunning = true;
    canvasView.classList.add('active');
    canvasView.classList.add('snake-active');
    
    SoundManager.playBoot();
    printLine('Loading Decryptor Core Decoupler... Decrypting system node with classic Snake protocols.', 'term-success');
    printLine('Controls: Arrow Keys or W-A-S-D. Eat glow cores to bypass firewalls. Press [ESC] to abort.', 'term-info');
    
    const ctx = gameCanvas.getContext('2d');
    
    const resizeGameCanvas = () => {
      const rect = canvasView.getBoundingClientRect();
      gameCanvas.width = rect.width - 48;
      gameCanvas.height = rect.height - 96;
    };
    resizeGameCanvas();
    window.addEventListener('resize', resizeGameCanvas);
    
    const gridSize = 16;
    let snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    snakeDir = 'right';
    snakeNextDir = 'right';
    let food = { x: 5, y: 5 };
    snakeScore = 0;
    
    function spawnFood() {
      const cols = Math.floor(gameCanvas.width / gridSize);
      const rows = Math.floor(gameCanvas.height / gridSize);
      food.x = Math.floor(Math.random() * (cols - 4)) + 2;
      food.y = Math.floor(Math.random() * (rows - 4)) + 2;
      
      for (let cell of snake) {
        if (cell.x === food.x && cell.y === food.y) {
          spawnFood();
          break;
        }
      }
    }
    spawnFood();
    
    const handleSnakeInput = (e) => {
      if (!isSnakeRunning) return;
      
      const key = e.key.toLowerCase();
      if ((key === 'arrowup' || key === 'w') && snakeDir !== 'down') {
        snakeNextDir = 'up';
        SoundManager.playTick();
        e.preventDefault();
      } else if ((key === 'arrowdown' || key === 's') && snakeDir !== 'up') {
        snakeNextDir = 'down';
        SoundManager.playTick();
        e.preventDefault();
      } else if ((key === 'arrowleft' || key === 'a') && snakeDir !== 'right') {
        snakeNextDir = 'left';
        SoundManager.playTick();
        e.preventDefault();
      } else if ((key === 'arrowright' || key === 'd') && snakeDir !== 'left') {
        snakeNextDir = 'right';
        SoundManager.playTick();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleSnakeInput);
    
    let lastTime = 0;
    const gameSpeed = 100;
    
    function drawSnakeGame(time) {
      if (!isSnakeRunning) return;
      
      if (time - lastTime >= gameSpeed) {
        lastTime = time;
        
        snakeDir = snakeNextDir;
        const head = { ...snake[0] };
        
        if (snakeDir === 'up') head.y--;
        else if (snakeDir === 'down') head.y++;
        else if (snakeDir === 'left') head.x--;
        else if (snakeDir === 'right') head.x++;
        
        const cols = Math.floor(gameCanvas.width / gridSize);
        const rows = Math.floor(gameCanvas.height / gridSize);
        
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
          gameOver();
          return;
        }
        
        for (let cell of snake) {
          if (cell.x === head.x && cell.y === head.y) {
            gameOver();
            return;
          }
        }
        
        snake.unshift(head);
        
        if (head.x === food.x && head.y === food.y) {
          snakeScore += 10;
          if (snakeScore > snakeHighScore) {
            snakeHighScore = snakeScore;
            localStorage.setItem('akshatos_snake_highscore', snakeHighScore);
          }
          SoundManager.playScore();
          spawnFood();
        } else {
          snake.pop();
        }
      }
      
      ctx.fillStyle = '#02050b';
      ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.01)';
      ctx.lineWidth = 1;
      for (let x = 0; x < gameCanvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gameCanvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < gameCanvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gameCanvas.width, y);
        ctx.stroke();
      }
      
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
      
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2.2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 6;
      snake.forEach((cell, idx) => {
        ctx.fillStyle = idx === 0 ? '#00ff66' : 'rgba(0, 255, 102, 0.65)';
        ctx.fillRect(
          cell.x * gridSize + 1,
          cell.y * gridSize + 1,
          gridSize - 2,
          gridSize - 2
        );
      });
      ctx.shadowBlur = 0;
      
      ctx.font = '11px "Roboto Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`SCORE: ${snakeScore}`, 16, 24);
      ctx.fillText(`HIGH SCORE: ${snakeHighScore}`, 16, 38);
      
      ctx.fillStyle = '#ff007f';
      ctx.fillText(`DECRYPTING FIREWALL_NODE_7B`, gameCanvas.width - 200, 24);
      
      snakeInterval = requestAnimationFrame(drawSnakeGame);
    }
    
    function gameOver() {
      isSnakeRunning = false;
      window.removeEventListener('keydown', handleSnakeInput);
      SoundManager.playError();
      
      printLine(`[GAME OVER] Firewall bypass failed! High score cached. Final score: <span class="term-highlight">${snakeScore}</span>.`, 'term-error');
      
      if (canvasView) {
        canvasView.classList.remove('active');
        canvasView.classList.remove('snake-active');
      }
    }
    
    snakeInterval = requestAnimationFrame(drawSnakeGame);
  }

  function stopSnake() {
    if (!isSnakeRunning) return;
    isSnakeRunning = false;
    
    if (snakeInterval) {
      cancelAnimationFrame(snakeInterval);
      snakeInterval = null;
    }
    
    if (canvasView) {
      canvasView.classList.remove('active');
      canvasView.classList.remove('snake-active');
    }
    
    SoundManager.playPowerOff();
    printLine('Visual decryption bypass stream aborted.', 'term-error');
  }

  // Scroll reveal animations
  const revealTargets = gsap.utils.toArray('.glass-card, .timeline-item, .quote-card, .about-copy, .stats-grid article, .contact-copy, .contact-form');
  revealTargets.forEach((element) => {
    gsap.from(element, {
      opacity: 0,
      y: 28,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 88%',
        end: 'top 70%'
      }
    });
  });

  // Recalculate ScrollTrigger markers once the page window fully loads (webfonts, assets, structural sizing)
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
});

// Custom Toast Notification System
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger animate in
  requestAnimationFrame(() => {
    toast.classList.add('active');
  });

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('active');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 4000);
}
