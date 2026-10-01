// Click treatment for the landing navigation circles: press, ripple from the pointer, then a
// short fade before same-tab navigation so the ripple is seen. Modified clicks, new-tab links
// and reduced-motion users navigate immediately.
const RIPPLE_MS = 260;

export function bindNavCircles(root: ParentNode = document) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const landing = document.querySelector('.landing');

  root.querySelectorAll<HTMLElement>('.lp-item').forEach((item) => {
    const fill = item.querySelector<HTMLElement>('.lp-fill');
    const circle = item.querySelector<HTMLElement>('.lp-circle');
    if (!fill || !circle) return;

    const ripple = (x?: number, y?: number) => {
      if (reduce.matches) return;
      const r = circle.getBoundingClientRect();
      const dot = document.createElement('span');
      dot.className = 'lp-ripple';
      dot.style.left = `${(x ?? r.left + r.width / 2) - r.left}px`;
      dot.style.top = `${(y ?? r.top + r.height / 2) - r.top}px`;
      fill.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    };

    item.addEventListener('pointerdown', (e) => {
      item.classList.add('is-pressed');
      ripple(e.clientX, e.clientY);
    });
    const release = () => item.classList.remove('is-pressed');
    item.addEventListener('pointerup', release);
    item.addEventListener('pointerleave', release);
    item.addEventListener('pointercancel', release);

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || (e.key === ' ' && item.classList.contains('is-soon'))) {
        if (e.key === ' ') e.preventDefault();
        ripple();
      }
    });

    if (!(item instanceof HTMLAnchorElement)) return;
    item.addEventListener('click', (e) => {
      const modified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
      if (modified || item.target === '_blank' || reduce.matches) return;
      e.preventDefault();
      landing?.classList.add('is-leaving');
      window.setTimeout(() => window.location.assign(item.href), RIPPLE_MS);
    });
  });

  // Coming back via the back/forward cache: clear the leaving state.
  window.addEventListener('pageshow', () => landing?.classList.remove('is-leaving'));
}
