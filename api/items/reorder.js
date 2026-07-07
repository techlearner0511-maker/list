const { sql } = require("@vercel/postgres");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { ids } = req.body || {};

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids must be a non-empty array." });
  }

  for (let i = 0; i < ids.length; i++) {
    await sql`UPDATE items SET position = ${i} WHERE id = ${ids[i]};`;
  }

  return res.status(200).json({ ok: true });
};
