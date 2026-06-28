import { Hono } from "hono";
import { characterRoute } from "./routes/character";

type Bindings = {
  // Static assets binding for the built web SPA (apps/web/dist).
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

// API routes. The web app and the API now share the same origin, so CORS is
// no longer required.
const api = new Hono<{ Bindings: Bindings }>();
api.route("/character", characterRoute);
api.get("/", (c) => c.text("ff14-profile-card api"));

app.route("/api", api);

// Anything that isn't an API route falls through to the static assets (the web
// SPA). When an asset isn't found, serve index.html so client-side routing /
// deep links still work.
app.all("*", async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status === 404) {
    const url = new URL(c.req.url);
    url.pathname = "/";
    return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
  }
  return res;
});

export default app;
