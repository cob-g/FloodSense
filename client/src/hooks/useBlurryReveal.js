import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Applies a blurry reveal animation to all matched child elements within a container.
 * 
 * @param {React.MutableRefObject} containerRef - The ref of the parent container holding the elements.
 * @param {string} filterSelector - CSS selector for elements to animate (default: 'section').
 * @param {boolean} enabled - Whether the animation should run (default: true).
 */
export const useBlurryReveal = (containerRef, filterSelector = 'section', enabled = true) => {
  const location = useLocation();

  useLayoutEffect(() => {
    if (!enabled || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Scope target lookup to the provided container to avoid cross-page selections.
      const targets = gsap.utils.toArray(filterSelector, containerRef.current);

      if (targets.length === 0) return;

      targets.forEach((target) => {
        const animationTargets = target.children.length > 0 ? Array.from(target.children) : target;
        const isBlurOnly = target?.getAttribute?.('data-reveal-mode') === 'blur-only';

        gsap.from(animationTargets, {
          scrollTrigger: {
            trigger: target,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: isBlurOnly ? 0 : 40,
          filter: 'blur(12px)',
          autoAlpha: 0,
          duration: 1,
          stagger: isBlurOnly ? 0 : 0.15,
          ease: 'power3.out',
          clearProps: 'all'
        });
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [containerRef, filterSelector, enabled, location.pathname]);
};
