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

    if (!env.RESEND_API_KEY || !env.CONTACT_FROM || !env.CONTACT_TO) {
      console.error("Missing contact configuration", {
        hasApiKey: Boolean(env.RESEND_API_KEY),
        hasFrom: Boolean(env.CONTACT_FROM),
        hasTo: Boolean(env.CONTACT_TO)
      });
      return json({ error: "Contact service configuration error." }, 503);
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "The-Collectors-Lounge-Contact-Form/1.0"
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: `TCL enquiry — ${enquiry} — ${name}`,
        text: [
          `Name / Brand: ${name}`,
          `Enquiry: ${enquiry}`,
          `Phone: ${phone}`,
          `Email: ${email}`,
          "",
          message
        ].join("\n")
      })
    });

    if (!response.ok) {
      const raw = await response.text();
      console.error("Resend error", {
        status: response.status,
        body: raw
      });
      return json({ error: "Unable to send your enquiry. Please try again." }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("Contact handler error", error);
    return json({ error: "Unable to send your enquiry. Please try again." }, 500);
  }
}
