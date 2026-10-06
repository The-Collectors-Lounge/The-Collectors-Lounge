const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });

const clean = (value, max = 4000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    // Honeypot: legitimate visitors leave this empty.
    if (clean(data.company, 200)) return json({ ok: true });

    const name = clean(data.name, 200);
    const enquiry = clean(data.request, 120);
    const phone = clean(data.phone, 80);
    const email = clean(data.email, 254);
    const message = clean(data.message, 5000);

    const allowed = [
      "Renting / Private Activation",
      "Market Development",
      "Retail / Brand Presence"
    ];

    if (
      !name ||
      !phone ||
      !message ||
      !emailPattern.test(email) ||
      !allowed.includes(enquiry) ||
      data.privacy_ack !== "yes"
    ) {
      return json({ error: "Please complete all required fields." }, 400);
    }

    const apiKey = env.RESEND_API_KEY;
    const from = env.CONTACT_FROM || "brands@thecollectorslounge.mx";
    const to = env.CONTACT_TO || "brands@thecollectorslounge.mx";

    if (!apiKey) {
      console.error("RESEND_API_KEY is missing");
      return json({ error: "Unable to send your enquiry right now." }, 503);
    }

    const subject = `TCL enquiry — ${enquiry} — ${name}`;
    const text = [
      `Name / Brand: ${name}`,
      `Enquiry: ${enquiry}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Privacy policy acknowledged: yes`,
      `Marketing consent: ${data.marketing_consent === "yes" ? "yes" : "no"}`,
      "",
      message
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "The-Collectors-Lounge-Website/1.0"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        text
      })
    });

    if (!response.ok) {
      const providerError = await response.text();
      console.error("Resend error", response.status, providerError);
      return json({ error: "Unable to send your enquiry right now." }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("Contact error", error);
    return json({ error: "Unable to process your enquiry." }, 500);
  }
}
