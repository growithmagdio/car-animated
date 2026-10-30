import { useEffect, useRef, type ReactNode } from "react";

import { useParallax } from "./use-parallax";
import "./novyra.css";

export function SiteHeader() {
  return (
    <a className="nv-header" href="#top" aria-label="NOVYRA home">
      <img className="nv-header__mark" src="/assets/novyra/mark.webp" alt="" width={300} height={207} />
      <span className="nv-header__word">NOVYRA</span>
    </a>
  );
}

export function BookPill() {
  return (
    <a className="nv-book-pill" href="#test-drive">
      <span className="nv-book-pill__dot" aria-hidden="true" />
      Book a test drive
    </a>
  );
}

export function ChapterCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="nv-chapter-cta" href={href}>
      {children}
      <span aria-hidden="true">&rarr;</span>
    </a>
  );
}

/** The chrome emblem, tilting toward the pointer in 3D. */
export function EmblemStage() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = stage.querySelector<HTMLElement>(".nv-emblem__card");
    if (!card) return;
    const onMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--ry", `${(x * 16).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-y * 16).toFixed(2)}deg`);
    };
    const onLeave = () => {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return (
    <div className="nv-emblem" ref={stageRef}>
      <span className="nv-emblem__axis" aria-hidden="true" />
      <div className="nv-emblem__card">
        <img src="/assets/novyra/emblem.webp" alt="The NOVYRA emblem: two chrome blades crossing a line of light" width={1400} height={1400} loading="lazy" decoding="async" />
        <span className="nv-emblem__sweep" aria-hidden="true" />
      </div>
    </div>
  );
}

export function ParallaxPlate({
  src,
  alt,
  label,
  caption,
  className,
  width,
  height,
}: {
  src: string;
  alt: string;
  label: string;
  caption: string;
  className?: string;
  width: number;
  height: number;
}) {
  const frameRef = useParallax<HTMLDivElement>(0.08);
  return (
    <figure className={["nv-plate", className].filter(Boolean).join(" ")}>
      <div className="nv-plate__frame" ref={frameRef}>
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      </div>
      <figcaption>
        <span>{caption}</span>
        <b>{label}</b>
      </figcaption>
    </figure>
  );
}

export function CabinBackdrop() {
  const ref = useParallax<HTMLDivElement>(0.1);
  return (
    <div className="nv-cabin__bg" ref={ref} aria-hidden="true">
      <img src="/assets/novyra/interior.webp" alt="" width={2000} height={1131} loading="lazy" decoding="async" />
    </div>
  );
}

export function CoastPlate({ line }: { line: string }) {
  const ref = useParallax<HTMLElement>(0.14);
  return (
    <section className="nv-coast" ref={ref} aria-label="The coast road">
      <img src="/assets/novyra/road.webp" alt="The GT-01 driving a cliff road above the sea at blue hour" width={2000} height={1131} loading="lazy" decoding="async" />
      <p className="nv-coast__line">{line}</p>
    </section>
  );
}

/** A thin gauge that fills when the spec scrolls into view (transform only). */
export function Gauge({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const bar = ref.current;
    if (!bar || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = bar.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;
    bar.style.setProperty("--g", "0.04");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          bar.style.setProperty("--g", String(value));
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(bar);
    return () => io.disconnect();
  }, [value]);
  return (
    <div className="nv-gauge" aria-hidden="true">
      <span ref={ref} style={{ ["--g" as string]: String(value) }} />
    </div>
  );
}
