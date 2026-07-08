const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  fullResults: true,
});

module.exports = async (req, res) => {
  const { id } = req.query;

  if (req.method === "DELETE") {
    const result = await sql`DELETE FROM items WHERE id = ${id};`;

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found." });
    }

    return res.status(204).end();
  }

  if (req.method === "PATCH") {
    const { purchased } = req.body || {};

    if (typeof purchased !== "boolean") {
      return res.status(400).json({ error: "purchased must be a boolean." });
    }

    const result = await sql`
      UPDATE items SET purchased = ${purchased} WHERE id = ${id}
      RETURNING id, name, type, category, purchased, position;
    `;

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found." });
    }

    return res.status(200).json(result.rows[0]);
  }

  res.setHeader("Allow", ["DELETE", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed." });
};
