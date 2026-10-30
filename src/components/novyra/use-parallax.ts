import { useEffect, useRef } from "react";
import { subscribeLenis } from "../../lib/lenis";

/** Writes a --py offset (px) on the element as it crosses the viewport. Transform only. */
export function useParallax<T extends HTMLElement>(strength = 0.12) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 860px)").matches;
    if (reduceMotion || isMobile) {
      el.style.setProperty("--py", "0px");
      el.style.willChange = "auto";
      return;
    }

    let isVisible = false;
    let cachedTop = 0;
    let cachedHeight = 0;
    let vh = window.innerHeight || 1;

    const measure = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset || 0;
      cachedTop = rect.top + scrollY;
      cachedHeight = rect.height;
      vh = window.innerHeight || 1;
    };

    const update = (scrollY: number) => {
      if (!isVisible) return;
      const top = cachedTop - scrollY;
      const center = top + cachedHeight / 2 - vh / 2;
      el.style.setProperty("--py", `${(-center * strength).toFixed(1)}px`);
    };

    measure();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            el.style.willChange = "transform";
            update(window.scrollY || 0);
          } else {
            el.style.willChange = "auto";
          }
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);

    const onResize = () => {
      const mobileNow = window.matchMedia("(max-width: 860px)").matches;
      if (mobileNow) {
        el.style.setProperty("--py", "0px");
        el.style.willChange = "auto";
        return;
      }
      measure();
      update(window.scrollY || 0);
    };

    const unsubscribe = subscribeLenis((e) => {
      update(e.scroll);
    });

    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      io.disconnect();
      unsubscribe();
      window.removeEventListener("resize", onResize);
      el.style.removeProperty("--py");
      el.style.willChange = "auto";
    };
  }, [strength]);

  return ref;
}
