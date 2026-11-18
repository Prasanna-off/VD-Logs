import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './AnimatedList.css';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const THEMES = {
  dark: {
    '--al-frame': 'rgba(23, 23, 33, 0.75)',
    '--al-frame-edge': 'rgba(255, 255, 255, 0.08)',
    '--al-frame-highlight': 'rgba(255, 255, 255, 0.07)',
    '--al-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--al-tile': 'linear-gradient(180deg, #1e1e2d 0%, #151522 100%)',
    '--al-tile-edge': 'rgba(255, 255, 255, 0.07)',
    '--al-tile-highlight': 'rgba(255, 255, 255, 0.12)',
    '--al-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
    '--al-well': 'rgba(255, 255, 255, 0.06)',
    '--al-ink': '#f4f4f5',
    '--al-muted': 'rgba(244, 244, 245, 0.55)',
    '--al-thumb': 'rgba(255, 255, 255, 0.16)',
    '--al-ring': 'rgba(99, 102, 241, 0.6)',
    '--al-ring-fill': 'rgba(99, 102, 241, 0.08)',
    '--al-hover': 'brightness(1.12)',
    '--al-press': 'brightness(0.85)',
    '--al-active': 'brightness(1.16)'
  },
  light: {
    '--al-frame': 'rgba(245, 245, 248, 0.85)',
    '--al-frame-edge': 'rgba(24, 24, 27, 0.08)',
    '--al-frame-highlight': 'rgba(255, 255, 255, 0.95)',
    '--al-frame-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.2), 0 6px 16px -10px rgba(24, 24, 27, 0.1)',
    '--al-tile': 'linear-gradient(180deg, #ffffff 0%, #f8f8fb 100%)',
    '--al-tile-edge': 'rgba(24, 24, 27, 0.08)',
    '--al-tile-highlight': 'rgba(255, 255, 255, 1)',
    '--al-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.1)',
    '--al-well': 'rgba(24, 24, 27, 0.04)',
    '--al-ink': '#18181b',
    '--al-muted': 'rgba(39, 39, 42, 0.55)',
    '--al-thumb': 'rgba(24, 24, 27, 0.16)',
    '--al-ring': 'rgba(99, 102, 241, 0.5)',
    '--al-ring-fill': 'rgba(99, 102, 241, 0.06)',
    '--al-hover': 'brightness(0.98)',
    '--al-press': 'brightness(0.92)',
    '--al-active': 'none'
  }
};

const HIDDEN = {
  pop: { above: 'translate3d(0, -12px, 0) scale(0.8)', below: 'translate3d(0, 12px, 0) scale(0.8)' },
  slide: { above: 'translate3d(0, -28px, 0) scale(0.98)', below: 'translate3d(0, 28px, 0) scale(0.98)' },
  fade: { above: 'translate3d(0, -4px, 0)', below: 'translate3d(0, 4px, 0)' }
};

const SPRING =
  'linear(0, 0.0603, 0.2033, 0.3821, 0.5633, 0.7258, 0.8584, 0.9574, 1.0242, 1.0634, 1.0809, 1.0828, 1.0747, 1.0613, 1.046, 1.0313, 1.0186, 1.0085, 1.0012, 0.9965, 0.994, 0.9931, 0.9933, 0.9941, 0.9953, 0.9966, 0.9978, 0.9988, 1)';

const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);

const FADE_MASK = (() => {
  const steps = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1];
  const top = steps.map(t => `rgba(0, 0, 0, ${smootherstep(t).toFixed(3)}) calc(var(--al-fade-top) * ${t})`);
  const bottom = [...steps]
    .reverse()
    .map(t => `rgba(0, 0, 0, ${smootherstep(t).toFixed(3)}) calc(100% - var(--al-fade-bottom) * ${t})`);
  return `linear-gradient(to bottom, ${[...top, ...bottom].join(', ')})`;
})();

const size = value => (typeof value === 'number' ? `${value}px` : value);

const AnimatedList = ({
  items = [],
  onItemSelect,
  renderItem,
  initialSelectedIndex = -1,
  selectOnHover = true,
  enableArrowNavigation = true,
  loop = false,
  animation = 'pop',
  animateOnce = false,
  stagger = 0.05,
  showGradients = true,
  fadeSize = 40,
  displayScrollbar = true,
  frame = true,
  theme = 'dark',
  accentColor,
  radius = 12,
  gap = 8,
  width = '100%',
  maxHeight = 380,
  className = '',
  itemClassName = '',
  style
}) => {
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const indicatorRef = useRef(null);
  const ringRef = useRef(null);
  const itemRefs = useRef([]);
  const engineRef = useRef(null);
  const keyboardRef = useRef(false);
  const navigatingRef = useRef(false);
  const [selected, setSelected] = useState(initialSelectedIndex);
  const baseId = useId();
  const settings = {
    items,
    onItemSelect,
    selected,
    selectOnHover,
    enableArrowNavigation,
    loop,
    animation,
    animateOnce,
    stagger,
    showGradients,
    fadeSize
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const indicator = indicatorRef.current;
    const ring = ringRef.current;
    if (!root || !viewport || !track || !indicator || !ring) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const springEase = CSS.supports?.('transition-timing-function', 'linear(0, 1)')
      ? SPRING
      : 'cubic-bezier(0.34, 1.4, 0.64, 1)';
    const transition = `transform 620ms ${springEase}, opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), filter 200ms ease`;
    const motion = { y: 0, h: 0, vy: 0, vh: 0, ty: 0, th: 0, ready: false };
    const fades = { top: '', bottom: '' };
    let boxes = [];
    let current = null;
    let entered = false;
    let engaged = false;
    let pointer = [0, 0];
    let raf = 0;
    let last = 0;

    const mode = () => {
      const chosen = settingsRef.current.animation;
      if (chosen === 'none' || !HIDDEN[chosen]) return 'none';
      return reduced ? 'fade' : chosen;
    };

    const apply = (element, state) => {
      element.dataset.state = state;
      const pose = current && current !== 'none' && state !== 'in' ? HIDDEN[current][state] : '';
      element.style.transform = pose;
      element.style.opacity = pose ? '0' : '';
    };

    const syncRing = () => {
      const item = itemRefs.current[settingsRef.current.selected];
      if (!item) return;
      const state = item.dataset.state || 'in';
      if (state === ring.dataset.state) return;
      ring.style.transitionDelay = item.style.transitionDelay;
      apply(ring, state);
    };

    const write = () => {
      indicator.style.transform = `translate3d(0, ${motion.y.toFixed(2)}px, 0)`;
      indicator.style.height = `${motion.h.toFixed(2)}px`;
    };

    const frame = now => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;

      const friction = 1 - Math.exp(-22 * dt);
      motion.y += (motion.ty - motion.y) * friction;
      motion.h += (motion.th - motion.h) * friction;

      write();

      if (Math.abs(motion.ty - motion.y) > 0.1 || Math.abs(motion.th - motion.h) > 0.1) {
        raf = requestAnimationFrame(frame);
      }
    };

    const place = immediate => {
      const idx = settingsRef.current.selected;
      const item = itemRefs.current[idx];
      if (!item) {
        indicator.style.opacity = '0';
        return;
      }
      const top = item.offsetTop;
      const height = item.offsetHeight;
      motion.ty = top;
      motion.th = height;
      if (immediate || !motion.ready) {
        motion.y = top;
        motion.h = height;
        motion.ready = true;
        write();
      } else if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
      indicator.style.opacity = '1';
    };

    const measure = () => {
      boxes = itemRefs.current.map(el => {
        if (!el) return { top: 0, bottom: 0 };
        return { top: el.offsetTop, bottom: el.offsetTop + el.offsetHeight };
      });
    };

    const updateFades = () => {
      const st = viewport.scrollTop;
      const sh = viewport.scrollHeight;
      const ch = viewport.clientHeight;
      const maxScroll = Math.max(0, sh - ch);
      const topFade = Math.min(settingsRef.current.fadeSize, st);
      const bottomFade = Math.min(settingsRef.current.fadeSize, maxScroll - st);

      if (fades.top !== `${topFade}px`) {
        fades.top = `${topFade}px`;
        viewport.style.setProperty('--al-fade-top', fades.top);
      }
      if (fades.bottom !== `${bottomFade}px`) {
        fades.bottom = `${bottomFade}px`;
        viewport.style.setProperty('--al-fade-bottom', fades.bottom);
      }
    };

    const reveal = () => {
      current = mode();
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transition = transition;
        el.style.transitionDelay = `${(i * settingsRef.current.stagger).toFixed(3)}s`;
        apply(el, 'in');
      });
    };

    const sync = () => {
      measure();
      reveal();
      place(true);
      updateFades();
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
      place(true);
      updateFades();
    });
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);

    const onScroll = () => {
      updateFades();
    };

    viewport.addEventListener('scroll', onScroll, { passive: true });
    updateFades();
    sync();

    engineRef.current = { place, syncRing, updateFades, sync };

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      viewport.removeEventListener('scroll', onScroll);
      engineRef.current = null;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    engineRef.current?.sync();
  }, [items, animation]);

  useEffect(() => {
    engineRef.current?.place(false);
  }, [selected]);

  return (
    <div
      ref={rootRef}
      className={`animated-list${frame ? ' animated-list--framed' : ''} ${className}`.trim()}
      data-animated={animation !== 'none' ? '' : undefined}
      style={{
        ...(THEMES[theme] ?? THEMES.dark),
        '--al-radius': `${Math.max(0, radius)}px`,
        '--al-gap': `${Math.max(0, gap)}px`,
        '--al-width': size(width),
        '--al-accent': accentColor || 'var(--al-ink)',
        ...style
      }}
    >
      <div
        ref={viewportRef}
        className={`animated-list__viewport${displayScrollbar ? '' : ' animated-list__viewport--bare'}`}
        role="listbox"
        tabIndex={0}
        style={{
          maxHeight: size(maxHeight),
          maskImage: showGradients ? FADE_MASK : undefined,
          WebkitMaskImage: showGradients ? FADE_MASK : undefined
        }}
      >
        <div ref={trackRef} className="animated-list__track">
          {items.map((item, index) => {
            const entry = item !== null && typeof item === 'object' ? item : { title: item };
            const isSelected = index === selected;
            return (
              <div
                key={entry.id ?? index}
                ref={element => {
                  itemRefs.current[index] = element;
                }}
                id={`${baseId}-${index}`}
                className={`animated-list__item ${itemClassName}`.trim()}
                role="option"
                aria-selected={isSelected}
                data-index={index}
                data-selected={isSelected ? '' : undefined}
                onPointerEnter={selectOnHover ? () => setSelected(index) : undefined}
                onClick={() => {
                  setSelected(index);
                  onItemSelect?.(item, index);
                }}
              >
                {renderItem ? (
                  renderItem(item, index, isSelected)
                ) : (
                  <>
                    {(entry.image || entry.icon) && (
                      <span className="animated-list__lead">
                        {entry.image ? <img src={entry.image} alt="" draggable={false} /> : entry.icon}
                      </span>
                    )}
                    <span className="animated-list__text">
                      <span className="animated-list__title">{entry.title}</span>
                      {entry.description && <span className="animated-list__description">{entry.description}</span>}
                    </span>
                    {entry.meta && <span className="animated-list__meta">{entry.meta}</span>}
                  </>
                )}
                <span className="animated-list__rim" aria-hidden="true" />
              </div>
            );
          })}
          <span ref={indicatorRef} className="animated-list__indicator" aria-hidden="true">
            <span ref={ringRef} className="animated-list__ring" />
          </span>
        </div>
      </div>
      {frame && <span className="animated-list__frame-rim" aria-hidden="true" />}
    </div>
  );
};

export default AnimatedList;
