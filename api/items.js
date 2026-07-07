const { sql } = require("@vercel/postgres");

const SHOW_CATEGORIES = ["kdrama", "webseries", "movie", "anime", "misc"];

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'show',
      category TEXT NOT NULL DEFAULT '',
      purchased BOOLEAN NOT NULL DEFAULT false,
      position INTEGER,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  // Safe to re-run on an existing table from before these columns existed.
  await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'show';`;
  await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS purchased BOOLEAN NOT NULL DEFAULT false;`;
  await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS position INTEGER;`;
}

module.exports = async (req, res) => {
  await ensureTable();

  if (req.method === "GET") {
    const { rows } = await sql`
      SELECT id, name, type, category, purchased, position, created_at AS "createdAt"
      FROM items
      ORDER BY created_at DESC;
    `;
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { name, category, type } = req.body || {};
    const resolvedType = type === "book" ? "book" : "show";

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required." });
    }

    let resolvedCategory = "";
    if (resolvedType === "show") {
      if (!SHOW_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: "Invalid category." });
      }
      resolvedCategory = category;
    }

    const trimmedName = name.trim();
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    let position = null;
    if (resolvedType === "book") {
      const { rows } = await sql`
        SELECT COALESCE(MIN(position), 0) - 1 AS next_position
        FROM items WHERE type = 'book';
      `;
      position = rows[0].next_position;
    }

    await sql`
      INSERT INTO items (id, name, type, category, purchased, position)
      VALUES (${id}, ${trimmedName}, ${resolvedType}, ${resolvedCategory}, false, ${position});
    `;

    return res.status(201).json({
      id,
      name: trimmedName,
      type: resolvedType,
      category: resolvedCategory,
      purchased: false,
      position,
      createdAt: new Date().toISOString(),
    });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed." });
};
