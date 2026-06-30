import { Hono } from "hono";
import { fetchCharacter } from "../lib/lodestone";

export const characterRoute = new Hono();

characterRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await fetchCharacter(id);
  if (!result.ok) {
    const status =
      result.code === "not_found" ? 404 : result.code === "private" ? 403 : 503;
    return c.json({ error: result.code, message: result.message }, status);
  }
  return c.json(result);
});
