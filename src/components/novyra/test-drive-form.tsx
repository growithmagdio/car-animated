import { useState, type FormEvent } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string }
  | { kind: "done"; reference: string; name: string };

/** Set VITE_BOOKING_WEBHOOK_URL in .env (GoHighLevel, Make.com or Zapier inbound webhook). */
const WEBHOOK_URL = (import.meta.env.VITE_BOOKING_WEBHOOK_URL as string | undefined) ?? "";

function makeReference() {
  return `NV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export function TestDriveForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      city: String(form.get("city") ?? "").trim(),
      edition: String(form.get("edition") ?? "GT-01"),
      preferredDate: String(form.get("preferredDate") ?? ""),
    };
    if (payload.fullName.length < 2 || payload.phone.length < 6 || !payload.email.includes("@") || payload.city.length < 2) {
      setStatus({ kind: "error", message: "Add your name, a phone number, a valid email and your city, then send again." });
      return;
    }
    if (!WEBHOOK_URL) {
      setStatus({ kind: "error", message: "Bookings are not connected yet. Add VITE_BOOKING_WEBHOOK_URL to the .env file to receive requests." });
      return;
    }
    setStatus({ kind: "sending" });
    const reference = makeReference();
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, reference, source: "novyra-website", submittedAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus({ kind: "done", reference, name: payload.fullName.split(" ")[0] ?? "" });
    } catch {
      setStatus({ kind: "error", message: "The request did not go through. Check your connection and send it again." });
    }
  }

  if (status.kind === "done") {
    return (
      <div className="nv-confirm" role="status">
        <p>Request received, {status.name}.</p>
        <strong>{status.reference}</strong>
        <p>A NOVYRA concierge will call you within one working day to confirm the time and the route.</p>
      </div>
    );
  }

  return (
    <form className="nv-form" onSubmit={onSubmit} noValidate>
      <div className="nv-field">
        <label htmlFor="td-name">Full name</label>
        <input id="td-name" name="fullName" autoComplete="name" placeholder="Arjun Raman" required />
      </div>
      <div className="nv-field">
        <label htmlFor="td-phone">Phone</label>
        <input id="td-phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 98400 12345" required />
      </div>
      <div className="nv-field">
        <label htmlFor="td-email">Email</label>
        <input id="td-email" name="email" type="email" autoComplete="email" placeholder="arjun@example.com" required />
      </div>
      <div className="nv-field">
        <label htmlFor="td-city">City</label>
        <input id="td-city" name="city" autoComplete="address-level2" placeholder="Chennai" required />
      </div>
      <fieldset className="nv-field nv-field--wide nv-editions">
        <legend>Edition</legend>
        <label className="nv-edition">
          <input type="radio" id="td-ed-1" name="edition" value="GT-01" defaultChecked />
          <span>GT-01</span>
        </label>
        <label className="nv-edition">
          <input type="radio" id="td-ed-2" name="edition" value="GT-01 Nocturne" />
          <span>GT-01 Nocturne</span>
        </label>
      </fieldset>
      <div className="nv-field">
        <label htmlFor="td-date">Preferred date</label>
        <input id="td-date" name="preferredDate" type="date" />
      </div>
      {status.kind === "error" ? (
        <p className="nv-form-status" data-tone="error" role="alert">{status.message}</p>
      ) : null}
      <button className="nv-submit" type="submit" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Sending" : "Request my drive"}
        <span aria-hidden="true">&rarr;</span>
      </button>
    </form>
  );
}
