import { Hono } from "hono";
import { cors } from "hono/cors";
import { characterRoute } from "./routes/character";

type Bindings = {
  CORS_ORIGIN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", (c, next) => {
  const origin = c.env.CORS_ORIGIN ?? "*";
  return cors({ origin })(c, next);
});

app.route("/character", characterRoute);

app.get("/", (c) => c.text("ff14-profile-card-proxy"));

export default app;
