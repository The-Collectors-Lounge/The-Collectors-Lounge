import { onRequestPost } from "./functions/api/contact.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return onRequestPost({ request, env });
    }

    if (url.pathname.startsWith("/api/")) {
      return new Response(
        JSON.stringify({ error: "Not found" }),
        { status: 404, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
