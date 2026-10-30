/**
 * NOVYRA GT-01 journey. Single-shot film, split into four consecutive cuts of
 * the same continuous take so each chapter owns its own stretch of scroll.
 * Every poster is the exact first frame of the encoded clip beside it.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "./components/scroll-scrub/scroll-scrub";

export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#D9C9A6",
  background: "#0A1115",
  ink: "#ECE9E2",
  muted: "#A3AEB2",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    id: "ignite",
    label: "Ignite",
    kicker: "NOVYRA GT-01 / Electric grand tourer",
    title: "Light the line.",
    body: "A single blade of light wakes the GT-01. Keep scrolling and bring it out of the dark.",
    clip: "/assets/world/scene-01.mp4",
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    poster: "/assets/world/scene-01-poster.webp",
    mobilePoster: "/assets/world/scene-01-mobile-poster.webp",
    scroll: 1.3,
  },
  {
    id: "form",
    label: "Form",
    kicker: "Design",
    title: "Drawn in one stroke.",
    body: "One unbroken line runs from the light bar to the tail. Nothing added, nothing interrupted.",
    tags: ["Drag coefficient 0.21", "Frameless glass canopy"],
    align: "right",
    clip: "/assets/world/scene-02.mp4",
    mobileClip: "/assets/world/scene-02-mobile.mp4",
    poster: "/assets/world/scene-02-poster.webp",
    mobilePoster: "/assets/world/scene-02-mobile-poster.webp",
    scroll: 1.2,
  },
  {
    id: "drive",
    label: "Drive",
    kicker: "Performance",
    title: "Silence, at speed.",
    body: "Two motors and 680 kW, in a cabin quiet enough to hear the tyres on wet tarmac.",
    tags: ["0 to 100 km/h in 3.1 s", "720 km WLTP range"],
    clip: "/assets/world/scene-03.mp4",
    mobileClip: "/assets/world/scene-03-mobile.mp4",
    poster: "/assets/world/scene-03-poster.webp",
    mobilePoster: "/assets/world/scene-03-mobile-poster.webp",
    scroll: 1.2,
  },
  {
    id: "horizon",
    label: "Horizon",
    kicker: "The coast road",
    title: "Leave the city behind.",
    body: "Eighteen minutes on a fast charger, then drive until the sea runs out.",
    align: "right",
    clip: "/assets/world/scene-04.mp4",
    mobileClip: "/assets/world/scene-04-mobile.mp4",
    poster: "/assets/world/scene-04-poster.webp",
    mobilePoster: "/assets/world/scene-04-mobile-poster.webp",
    scroll: 1.4,
  },
];
