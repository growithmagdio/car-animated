import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { ScrollScrubScene, ScrollScrubTheme } from "./scroll-scrub";
import { subscribeLenis, scrollTo } from "../../lib/lenis";
import "./scroll-scrub.css";

export interface FrameScrubProps {
  scenes: ScrollScrubScene[];
  theme: ScrollScrubTheme;
  className?: string;
  onActiveSectionChange?: (index: number) => void;
}

type ThemeStyle = CSSProperties & Record<`--ss-${string}`, string | number>;

const DESKTOP_TOTAL_FRAMES = 289;
const MOBILE_TOTAL_FRAMES = 181;

export function FrameScrub({
  scenes,
  theme,
  className,
  onActiveSectionChange,
}: FrameScrubProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressSpanRef = useRef<HTMLSpanElement | null>(null);
  const routeNavRef = useRef<HTMLElement | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  // We detect reduced motion and mobile format once on mount
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const coarseOrNarrow = window.matchMedia("(max-width: 860px), (pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setIsMobileDevice(coarseOrNarrow);
    setIsReducedMotion(reduced);

    const isMobile = coarseOrNarrow;
    const totalFrames = isMobile ? MOBILE_TOTAL_FRAMES : DESKTOP_TOTAL_FRAMES;

    const getFrameUrl = (index: number) => {
      const pad = String(index).padStart(4, "0");
      return `/frames/${isMobile ? "mobile" : "desktop"}/frame_${pad}.webp`;
    };

    const images = new Map<number, HTMLImageElement>();
    const loadedIndices = new Set<number>();
    const requestedIndices = new Set<number>();
    let activeRequests = 0;
    const MAX_CONCURRENT = 6;
    let currentTargetFrame = 1;
    let lastDrawnFrame = -1;
    let rafId = 0;
    let destroyed = false;

    // Cache metrics to eliminate layout thrashing
    let rootTop = 0;
    let maxScroll = 1;
    const totalWeight = scenes.reduce((sum, s) => sum + (s.scroll ?? 1), 0);
    const chapterCumulativeWeights: number[] = [];
    let cumulative = 0;
    for (const scene of scenes) {
      chapterCumulativeWeights.push(cumulative);
      cumulative += (scene.scroll ?? 1);
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });

    const drawFrame = (target: number) => {
      if (!canvas || !ctx || destroyed) return;

      // Find target or nearest loaded frame
      let bestIdx = target;
      if (!images.has(target)) {
        let minDiff = Infinity;
        for (const idx of loadedIndices) {
          const diff = Math.abs(idx - target);
          if (diff < minDiff) {
            minDiff = diff;
            bestIdx = idx;
          }
        }
      }

      const img = images.get(bestIdx);
      if (!img) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (!iw || !ih || cw === 0 || ch === 0) return;

      // Object-fit: cover math (scale to fill, center crop)
      const scale = Math.max(cw / iw, ch / ih);
      const sw = cw / scale;
      const sh = ch / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      lastDrawnFrame = bestIdx;
    };

    const requestDraw = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        drawFrame(currentTargetFrame);
      });
    };

    const pumpQueue = () => {
      if (destroyed || reduced) return;
      const unrequested: number[] = [];
      for (let i = 1; i <= totalFrames; i++) {
        if (!requestedIndices.has(i)) {
          unrequested.push(i);
        }
      }
      unrequested.sort(
        (a, b) => Math.abs(a - currentTargetFrame) - Math.abs(b - currentTargetFrame)
      );

      while (activeRequests < MAX_CONCURRENT && unrequested.length > 0) {
        const nextIdx = unrequested.shift()!;
        requestedIndices.add(nextIdx);
        activeRequests++;

        const img = new Image();
        img.src = getFrameUrl(nextIdx);

        const onDone = () => {
          if (destroyed) return;
          images.set(nextIdx, img);
          loadedIndices.add(nextIdx);
          activeRequests--;
          pumpQueue();

          if (
            nextIdx === currentTargetFrame ||
            Math.abs(nextIdx - currentTargetFrame) < Math.abs(lastDrawnFrame - currentTargetFrame)
          ) {
            requestDraw();
          }
        };

        if (typeof img.decode === "function") {
          img.decode().then(onDone).catch(() => {
            img.onload = onDone;
            img.onerror = () => {
              activeRequests--;
              pumpQueue();
            };
          });
        } else {
          img.onload = onDone;
          img.onerror = () => {
            activeRequests--;
            pumpQueue();
          };
        }
      }
    };

    // Preload frame 1 immediately and draw as poster
    const frame1 = new Image();
    frame1.src = getFrameUrl(1);
    requestedIndices.add(1);
    activeRequests++;
    const onFrame1Ready = () => {
      images.set(1, frame1);
      loadedIndices.add(1);
      activeRequests--;
      drawFrame(1);
      pumpQueue();
    };

    if (typeof frame1.decode === "function") {
      frame1.decode().then(onFrame1Ready).catch(() => {
        frame1.onload = onFrame1Ready;
      });
    } else {
      frame1.onload = onFrame1Ready;
    }

    // Resize canvas with devicePixelRatio capped at 2
    const resizeCanvas = () => {
      if (!canvas || !rootRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const stageRect = canvas.parentElement?.getBoundingClientRect() || canvas.getBoundingClientRect();
      const w = Math.round(stageRect.width * dpr);
      const h = Math.round(stageRect.height * dpr);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        lastDrawnFrame = -1;
        drawFrame(currentTargetFrame);
      }

      // Update cached section metrics on resize only (no layout thrash on scroll)
      const root = rootRef.current;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      rootTop = root.getBoundingClientRect().top + scrollY;
      maxScroll = Math.max(1, root.offsetHeight - window.innerHeight);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    let lastActiveChapter = 0;

    // Handle scroll events directly from Lenis
    const onScroll = (scrollY: number) => {
      if (destroyed || reduced) return;

      const progress = Math.min(Math.max(0, (scrollY - rootTop) / maxScroll), 1);

      // Directly update progress bar style without React state
      if (progressSpanRef.current) {
        progressSpanRef.current.style.transform = `scaleX(${progress})`;
      }

      const frameIdx = Math.min(
        totalFrames,
        Math.max(1, Math.round(progress * (totalFrames - 1)) + 1)
      );

      if (frameIdx !== currentTargetFrame) {
        currentTargetFrame = frameIdx;
        pumpQueue();
        requestDraw();
      }

      // Check active chapter
      const progressWeight = progress * totalWeight;
      let chapterIdx = 0;
      for (let i = scenes.length - 1; i >= 0; i--) {
        if (progressWeight >= chapterCumulativeWeights[i]) {
          chapterIdx = i;
          break;
        }
      }

      if (chapterIdx !== lastActiveChapter) {
        lastActiveChapter = chapterIdx;
        setActiveSection(chapterIdx);
        onActiveSectionChange?.(chapterIdx);

        // Update aria-current directly on route buttons for instant response
        if (routeNavRef.current) {
          const buttons = routeNavRef.current.querySelectorAll<HTMLButtonElement>(
            ".scroll-scrub__route-button"
          );
          buttons.forEach((btn, idx) => {
            if (idx === chapterIdx) {
              btn.setAttribute("aria-current", "step");
            } else {
              btn.removeAttribute("aria-current");
            }
          });
        }
      }
    };

    const unsubscribe = subscribeLenis((e) => {
      onScroll(e.scroll);
    });

    return () => {
      destroyed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeCanvas);
      unsubscribe();
    };
  }, [scenes, onActiveSectionChange]);

  const jumpToChapter = (index: number) => {
    if (!rootRef.current) return;
    const root = rootRef.current;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const rootTop = root.getBoundingClientRect().top + scrollY;
    const maxScroll = Math.max(1, root.offsetHeight - window.innerHeight);
    const totalWeight = scenes.reduce((sum, s) => sum + (s.scroll ?? 1), 0);

    let cumulative = 0;
    for (let i = 0; i < index; i++) {
      cumulative += (scenes[i].scroll ?? 1);
    }

    const targetScroll = rootTop + (cumulative / totalWeight) * maxScroll + 5;
    scrollTo(targetScroll, 1.4);
  };

  if (scenes.length === 0) return null;

  const themeStyle: ThemeStyle = {
    "--ss-accent": theme.accent,
    "--ss-bg": theme.background,
    "--ss-ink": theme.ink,
    "--ss-muted": theme.muted,
  };

  return (
    <section
      className={["scroll-scrub", className].filter(Boolean).join(" ")}
      ref={rootRef}
      style={themeStyle}
    >
      <div className="scroll-scrub__stage">
        <div aria-hidden="true" className="scroll-scrub__media">
          <canvas ref={canvasRef} className="scroll-scrub__canvas" />
        </div>

        <div aria-hidden="true" className="scroll-scrub__progress">
          <span ref={progressSpanRef} />
        </div>

        <nav aria-label="Journey chapters" className="scroll-scrub__route" ref={routeNavRef}>
          {scenes.map((scene, index) => (
            <button
              aria-current={activeSection === index ? "step" : undefined}
              className="scroll-scrub__route-button"
              key={scene.id}
              onClick={() => jumpToChapter(index)}
              type="button"
            >
              <span>{scene.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="scroll-scrub__story">
        {scenes.map((scene, index) => {
          const Heading = index === 0 ? "h1" : "h2";
          const bandStyle: CSSProperties = {
            minHeight: `${Math.max(scene.scroll ?? 1, 0.2) * 100}svh`,
          };

          return (
            <article
              className="scroll-scrub__chapter"
              data-align={scene.align ?? "left"}
              id={scene.id}
              key={scene.id}
              style={bandStyle}
            >
              <div className="scroll-scrub__chapter-pin">
                {isReducedMotion ? (
                  <img
                    src={isMobileDevice && scene.mobilePoster ? scene.mobilePoster : scene.poster}
                    alt=""
                    className="scroll-scrub__reduced-poster"
                  />
                ) : null}
                <div className="scroll-scrub__copy">
                  {scene.kicker ? (
                    <p className="scroll-scrub__kicker">{scene.kicker}</p>
                  ) : null}
                  <Heading className="scroll-scrub__title">
                    {scene.title}
                  </Heading>
                  <p className="scroll-scrub__body">{scene.body}</p>
                  {scene.tags?.length ? (
                    <ul className="scroll-scrub__tags">
                      {scene.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  ) : null}
                  {scene.actions ? (
                    <div className="scroll-scrub__actions">{scene.actions}</div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
