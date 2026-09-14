const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });

const clean = (value, max = 4000) =>
  String(value || "").trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    // Honeypot anti-spam
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

    if (!name || !phone || !email || !message || !allowed.includes(enquiry)) {
      return json({ error: "Please complete all fields." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Please enter a valid email address." }, 400);
    }

    if (!env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return json({ error: "Contact service configuration error: missing API key." }, 503);
    }

    if (!env.CONTACT_FROM || !env.CONTACT_TO) {
      console.error("Missing CONTACT_FROM or CONTACT_TO", {
        hasFrom: Boolean(env.CONTACT_FROM),
        hasTo: Boolean(env.CONTACT_TO)
      });
      return json({ error: "Contact service configuration error: missing sender or recipient." }, 503);
    }

    const subject = `TCL enquiry — ${enquiry} — ${name}`;

    const text = [
      `Name / Brand: ${name}`,
      `Enquiry: ${enquiry}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      "",
      message
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject,
        text
      })
    });

    if (!response.ok) {
      const raw = await response.text();
      let providerMessage = raw;

      try {
        const parsed = JSON.parse(raw);
        providerMessage = parsed.message || parsed.error || raw;
      } catch {}

      console.error("Resend error", {
        status: response.status,
        message: providerMessage
      });

      return json({
        error: `Resend error ${response.status}: ${providerMessage}`
      }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("Contact handler error", error);
    return json({
      error: "Contact service error. Please try again."
    }, 500);
  }
}
