import { ScrollScrub } from "./components/scroll-scrub/scroll-scrub";
import {
  BookPill,
  CabinBackdrop,
  ChapterCta,
  CoastPlate,
  EmblemStage,
  Gauge,
  ParallaxPlate,
  SiteHeader,
} from "./components/novyra/parts";
import { TestDriveForm } from "./components/novyra/test-drive-form";
import { scrollScrubScenes, scrollScrubTheme } from "./scroll-scrub-scenes";

// Module constant: the last chapter carries the hand-off to the booking form.
const journey = scrollScrubScenes.map((scene, index, all) =>
  index === all.length - 1
    ? { ...scene, actions: <ChapterCta href="#test-drive">Book a test drive</ChapterCta> }
    : scene,
);

const specs = [
  { label: "Peak power, dual motor", value: "680", unit: "kW", gauge: 0.86 },
  { label: "0 to 100 km/h", value: "3.1", unit: "s", gauge: 0.92 },
  { label: "Range, WLTP", value: "720", unit: "km", gauge: 0.8 },
  { label: "10 to 80% charge at 350 kW", value: "18", unit: "min", gauge: 0.74 },
  { label: "Drag coefficient", value: "0.21", unit: "Cd", gauge: 0.88 },
  { label: "Top speed, limited", value: "260", unit: "km/h", gauge: 0.7 },
];

const dims = [
  { label: "Length", value: "4,912", unit: "mm" },
  { label: "Width", value: "2,010", unit: "mm" },
  { label: "Height", value: "1,286", unit: "mm" },
  { label: "Wheelbase", value: "3,010", unit: "mm" },
];

export default function App() {
  return (
    <div className="nv-page" id="top">
      <SiteHeader />
      <BookPill />

      <main>
        <ScrollScrub scenes={journey} theme={scrollScrubTheme} />

        <section className="nv-section nv-mark" id="mark" aria-labelledby="mark-title">
          <EmblemStage />
          <div>
            <p className="nv-label">The mark</p>
            <h2 className="nv-h2" id="mark-title">Two blades and a horizon.</h2>
            <p className="nv-lede">
              The N is cut from the same line of light that runs across the car&apos;s nose, so the
              badge and the car read as one signature. Move your cursor over it.
            </p>
            <ul className="nv-mark-notes">
              <li><b>Blades</b>Two angled cuts, forward and back, for a car that is never still.</li>
              <li><b>Horizon</b>The thin line through the middle is the road ahead, and the light bar on every NOVYRA.</li>
              <li><b>Finish</b>Brushed platinum with a champagne edge, machined from a single billet.</li>
            </ul>
          </div>
        </section>

        <section className="nv-section nv-details" id="details" aria-labelledby="details-title">
          <div className="nv-details__head">
            <p className="nv-label">Details</p>
            <h2 className="nv-h2" id="details-title">Up close, it gets quieter.</h2>
          </div>
          <ParallaxPlate
            className="nv-plate--light"
            src="/assets/novyra/light.webp"
            alt="The razor-thin front light bar glowing on wet black paint"
            label="Light bar"
            caption="A 1.8 mm blade of light, 1.9 metres wide. It greets you, signals, and dims to a pulse when the car is charging."
            width={1400}
            height={1045}
          />
          <ParallaxPlate
            className="nv-plate--wheel"
            src="/assets/novyra/wheel.webp"
            alt="A forged graphite aero wheel with bronze inlays"
            label="22 in forged"
            caption="Graphite spokes with bronze inlays, shaped to pull air off the brakes."
            width={1400}
            height={1045}
          />
          <div className="nv-blueprint">
            <p className="nv-label">Profile</p>
            <div className="nv-blueprint__img">
              <img
                src="/assets/novyra/side.webp"
                alt="Side profile of the GT-01 on black"
                width={2000}
                height={857}
                loading="lazy"
              />
            </div>
            <dl className="nv-dims">
              {dims.map((d) => (
                <div key={d.label}>
                  <dt>{d.label}</dt>
                  <dd>
                    {d.value}
                    <small>{d.unit}</small>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="nv-cabin" id="cabin" aria-labelledby="cabin-title">
          <CabinBackdrop />
          <div className="nv-cabin__copy">
            <div>
              <p className="nv-label">Inside</p>
              <h2 className="nv-h2" id="cabin-title">A lounge that happens to move.</h2>
              <p className="nv-lede">
                One curved display wraps the driver. Everything else is leather, wood and a sky you
                can see through the roof.
              </p>
            </div>
            <ul className="nv-materials">
              <li><span>Seats</span><b>Quilted cream nappa</b></li>
              <li><span>Trim</span><b>Open-pore walnut</b></li>
              <li><span>Detail</span><b>Brushed bronze</b></li>
              <li><span>Roof</span><b>Panoramic glass</b></li>
            </ul>
          </div>
        </section>

        <section className="nv-section nv-specs" id="specs" aria-labelledby="specs-title">
          <div>
            <p className="nv-label">Performance</p>
            <h2 className="nv-h2" id="specs-title">Numbers you feel before you read.</h2>
            <p className="nv-lede">
              An 800 V platform with a 112 kWh battery set low between the axles. The weight sits
              where your hips are, so the car turns around you.
            </p>
            <p className="nv-spec-note">Concept figures, subject to homologation.</p>
          </div>
          <dl className="nv-spec-list">
            {specs.map((s) => (
              <div className="nv-spec" key={s.label}>
                <dt>{s.label}</dt>
                <dd>
                  <span className="nv-spec__value">
                    {s.value}
                    <span className="nv-spec__unit">{s.unit}</span>
                  </span>
                  <Gauge value={s.gauge} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <CoastPlate line="Built for the long way home, with the sea on your left." />

        <section className="nv-section nv-book" id="test-drive" aria-labelledby="book-title">
          <div className="nv-book__aside">
            <p className="nv-label">Test drive</p>
            <h2 className="nv-h2" id="book-title">Take the coast road.</h2>
            <p className="nv-lede">
              Tell us where you are. We bring the GT-01 to you for 90 minutes, with a route planned
              around the best stretch of road nearby.
            </p>
            <ol className="nv-book__steps">
              <li>Send the request. It takes under a minute.</li>
              <li>A concierge calls within one working day to fix the time.</li>
              <li>The car arrives charged, cleaned and ready at your door.</li>
            </ol>
          </div>
          <TestDriveForm />
        </section>
      </main>

      <footer className="nv-footer">
        <div className="nv-footer__brand">
          <img src="/assets/novyra/mark.webp" alt="" width={300} height={207} />
          NOVYRA
        </div>
        <p>
          NOVYRA is a concept brand. The GT-01, its specifications and all imagery on this site are
          computer generated.
        </p>
      </footer>
    </div>
  );
}
