import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;
const subscribers = new Set<(e: { scroll: number; limit: number; velocity: number; direction: number; progress: number }) => void>();

export function setLenis(lenis: Lenis | null) {
  lenisInstance = lenis;
  if (lenis) {
    lenis.on("scroll", (e: any) => {
      subscribers.forEach((cb) => {
        try {
          cb(e);
        } catch (err) {
          console.error("Lenis scroll subscriber error:", err);
        }
      });
    });
  }
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function subscribeLenis(
  callback: (e: { scroll: number; limit: number; velocity: number; direction: number; progress: number }) => void
): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function scrollTo(target: string | HTMLElement | number, duration = 1.4) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target as any, { duration });
  } else {
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    } else if (typeof target === "string") {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }
}
