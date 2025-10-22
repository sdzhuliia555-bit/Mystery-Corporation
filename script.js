// script.js
// Enhancements: smooth scrolling, active nav highlighting, accessible team modal, copy-to-clipboard, lazy load images

(() => {
    // Smooth scrolling for nav links
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const id = link.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Highlight active nav link based on section in view
    const navLinks = Array.from(document.querySelectorAll('nav a'));
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const id = entry.target.id;
            const link = navLinks.find(a => a.getAttribute('href') === `#${id}`);
            if (!link) return;
            if (entry.isIntersecting) link.classList.add('active');
            else link.classList.remove('active');
        });
    }, { threshold: 0.5 });
    sections.forEach(s => io.observe(s));

    // Make team cards keyboard-focusable and lazy-load images
    const teamCards = Array.from(document.querySelectorAll('.team > div'));
    const teamImages = document.querySelectorAll('.team img');
    teamImages.forEach(img => { img.loading = 'lazy'; });

    teamCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => openTeamModal(card));
        card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTeamModal(card); } });
    });

    // Accessible modal for team details
    let lastFocused = null;
    function openTeamModal(card) {
        const img = card.querySelector('img');
        const name = card.querySelector('h3')?.textContent || '';
        const desc = card.querySelector('p')?.textContent || '';

        lastFocused = document.activeElement;

        const overlay = document.createElement('div');
        overlay.className = 'team-modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.style.cssText = `
            position: fixed; inset: 0; display:flex; align-items:center; justify-content:center;
            background: rgba(0,0,0,0.7); z-index: 9999; padding: 20px;
        `;

        const modal = document.createElement('div');
        modal.className = 'team-modal';
        modal.style.cssText = `
            background: linear-gradient(180deg, rgba(0,128,128,0.95), rgba(0,102,102,0.95));
            color: #fff; border-radius: 12px; max-width: 900px; width: 100%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.6); overflow: hidden;
            display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: center;
        `;

        const imgWrap = document.createElement('div');
        imgWrap.style.cssText = 'padding:20px;';
        const largeImg = document.createElement('img');
        largeImg.src = img?.src || '';
        largeImg.alt = img?.alt || name;
        largeImg.style.cssText = 'width:100%; height:auto; border-radius:10px; border:4px solid #ffb84d; display:block;';
        imgWrap.appendChild(largeImg);

        const content = document.createElement('div');
        content.style.cssText = 'padding:20px; text-align:left;';
        const h = document.createElement('h2');
        h.textContent = name;
        h.style.marginTop = '0';
        h.style.color = '#ffcc33';
        const p = document.createElement('p');
        p.textContent = desc;
        p.style.marginBottom = '1rem';
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = `
            background: #ff6600; color: #fff; border: none; padding: 10px 14px;
            border-radius: 8px; cursor: pointer; font-weight: bold;
        `;
        closeBtn.addEventListener('click', () => closeModal(overlay));

        content.appendChild(h);
        content.appendChild(p);
        content.appendChild(closeBtn);

        modal.appendChild(imgWrap);
        modal.appendChild(content);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // close on outside click or Escape
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay); });
        const onKey = (e) => { if (e.key === 'Escape') closeModal(overlay); };
        document.addEventListener('keydown', onKey);

        // focus management
        closeBtn.focus();

        function closeModal(node) {
            document.removeEventListener('keydown', onKey);
            node.remove();
            if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
        }
    }

    // Copy-to-clipboard for contact items and small toast
    function showToast(text) {
        const t = document.createElement('div');
        t.textContent = text;
        t.style.cssText = `
            position: fixed; left:50%; transform: translateX(-50%); bottom: 30px;
            background: rgba(0,0,0,0.8); color:#fff; padding:10px 14px; border-radius:20px;
            z-index:10000; font-weight:600;
        `;
        document.body.appendChild(t);
        setTimeout(() => t.style.opacity = '1', 10);
        setTimeout(() => t.remove(), 2000);
    }

    const contactItems = Array.from(document.querySelectorAll('#contact p'));
    contactItems.forEach(p => {
        p.style.cursor = 'copy';
        p.setAttribute('tabindex', '0');
        p.addEventListener('click', () => {
            const text = p.textContent.replace(/^[^\d@+A-Za-z]+/, '').trim();
            navigator.clipboard?.writeText(text).then(() => showToast('Copied!'), () => showToast('Could not copy'));
        });
        p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.click(); } });
    });

    // Improve reduced-motion users: disable smooth scroll if prefers-reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
        // rebind nav links to instant jump
        document.querySelectorAll('nav a[href^="#"]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const id = link.getAttribute('href').slice(1);
                const target = document.getElementById(id);
                if (target) window.scrollTo({ top: target.offsetTop, behavior: 'auto' });
            }, { passive: true });
        });
    }
})();