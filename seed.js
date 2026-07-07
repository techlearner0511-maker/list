// One-time script to load your list into the Vercel Postgres database.
// Safe to re-run: it skips any name+type combo that's already in the database.
//   node seed.js

const { sql } = require("@vercel/postgres");

const shows = [
  ["The Richest Man in Game", "misc"],
  ["Soul Eater", "anime"],
  ["Overlord", "anime"],
  ["Link Click", "anime"],
  ["Kingdom", "webseries"],
  ["Kengan Ashura", "anime"],
  ["Kaguya Sama", "anime"],
  ["Is It Wrong to Pick a Girl in Dungeon", "anime"],
  ["Horimiya", "anime"],
  ["Golden Kamuy", "anime"],
  ["Gintama", "anime"],
  ["Fate Stay Night", "anime"],
  ["Code Geass", "anime"],
  ["Baki", "anime"],
  ["Blue Exorcist", "anime"],
  ["Rakshasa Street", "misc"],
  ["Kimi ni Todoke", "anime"],
  ["Monster", "anime"],
  ["Konosuba", "anime"],
  ["Shangri-La Frontier", "anime"],
  ["Daily Life of the Immortal King", "anime"],
  ["Durarara", "anime"],
  ["Fruits Basket", "anime"],
  ["Rising of the Shield Hero", "anime"],
  ["The Fragrant Flower Blooms with Dignity", "anime"],
  ["Money Heist Korea", "kdrama"],
  ["Sports", "misc"],
  ["DC", "misc"],
  ["Yogesh Splits", "misc"],
  ["Lockup", "kdrama"],
  ["Can This Love Be Translated", "kdrama"],
  ["Kurukshetra", "anime"],
  ["Manager Kim", "kdrama"],
  ["Study Group", "anime"],
  ["Plaza", "misc"],
  ["Duty After School", "kdrama"],
  ["Big Mouth", "kdrama"],
];

// Books - order preserved exactly as given (first = top of the reading list).
const books = [
  "The 7 Habits of Highly Effective People",
  "Ramayana",
  "Think and Grow Rich",
  "Godan by Munshi Premchand",
  "Mahabharata",
  "The Magic of Thinking Big",
  "The Alchemist",
  "Bhagavata Purana",
  "The Power of Your Subconscious Mind",
  "Sukoon by Wajid Sheikh",
  "Rich Dad Poor Dad",
  "Vishnu Purana",
  "How to Stop Overthinking Forever",
  "Jaana Zaroori Hai Kya",
  "The Simple Path to Wealth",
  "Shiva Purana",
  "Attitude Is Everything",
  "Nadiya Nahi Rukti",
  "I Will Teach You to Be Rich",
  "Man's Search for Meaning",
  "Brahma Purana",
  "The Compound Effect",
  "Gunah Ka Devta",
  "The Millionaire Fastlane",
  "Mindset: The New Psychology of Success",
  "Padma Purana",
  "Good Vibes, Good Life",
  "Lifafa",
  "The Intelligent Investor",
  "Self-Compassion",
  "Skanda Purana",
  "The Subtle Art of Not Giving a F*ck",
  "Balliya - Theek Prem Ke Beech",
  "Money: Master the Game",
  "Emotional Intelligence",
  "Markandeya Purana",
  "Why Has Nobody Told Me This Before?",
  "Man Rangi",
  "Misbehaving",
  "Feeling Good",
  "How to Win Friends and Influence People",
  "Agni Purana",
  "12 Rules for Life",
  "Mala by Nimrah Ahmed",
  "Lords of Finance",
  "The Courage to Be Disliked",
  "Nonviolent Communication",
  "Garuda Purana",
  "Limitless",
  "D se Dukh, I se Ishwar",
  "Devil Take the Hindmost",
  "Thinking, Fast and Slow",
  "Crucial Conversations",
  "The Disciplined Trader",
  "Linga Purana",
  "Get Better at Anything",
  "Kya Paaya Itna Jeekar",
  "The Creature from Jekyll Island",
  "The Power of Habit",
  "Difficult Conversations",
  "Trading in the Zone",
  "Varaha Purana",
  "The Monk Who Sold His Ferrari",
  "Most Wanted Zindagi",
  "The House of Morgan",
  "Drive",
  "Never Split the Difference",
  "Reminiscences of a Stock Operator",
  "The Power of Now",
  "Brahmavaivarta Purana",
  "Who Will Cry When You Die?",
  "Der Raat Tak",
  "The Changing World Order",
  "Blink",
  "Influence: The Psychology of Persuasion",
  "Technical Analysis of the Financial Markets",
  "The Four Agreements",
  "Matsya Purana",
  "Daring Greatly",
  "Before the Book Series",
  "Debt: The First 5,000 Years",
  "Think Again",
  "How to Talk to Anyone",
  "Technical Analysis of Stock Trends",
  "Meditations",
  "The Personal MBA",
  "Eat That Frog!",
  "Kurma Purana",
  "The Gifts of Imperfection",
  "Written in Her Name",
  "The Big Short",
  "Don't Believe Everything You Think",
  "Never Eat Alone",
  "Japanese Candlestick Charting Techniques",
  "Letters from a Stoic",
  "The Lean Startup",
  "Getting Things Done",
  "Attached by Amir Levine and Rachel Heller",
  "Vamana Purana",
  "The Art of Being Alone",
  "Fragments of Feeling",
  "The Money Game",
  "Master Your Emotions",
  "The First Minute",
  "Encyclopaedia of Chart Patterns",
  "The Obstacle Is the Way",
  "Rework",
  "The Miracle Morning",
  "Men Are from Mars, Women Are from Venus",
  "Brahmanda Purana",
  "Unhooked / Unbooked",
  "In the Silence You Left Behind",
  "The Curse of Cash",
  "Quiet: The Power of Introverts",
  "Talk Like TED",
  "Trading for a Living",
  "Ego Is the Enemy",
  "The 4-Hour Work Week",
  "The 5 AM Club",
  "How to Be an Adult in Relationships",
  "Bhavishya Purana",
  "Average Sucks",
  "Can We Be Stranger Again?",
  "Rich Dad's Conspiracy of the Rich",
  "Range",
  "Think Faster, Talk Smarter",
  "Market Wizards",
  "Discipline Is Destiny",
  "Linchpin",
  "Make Time",
  "Warmth",
  "The New One Minute Manager",
  "The Brain That Changes Itself",
  "Narada Purana",
  "The Rudest Book Ever",
  "I Can't Remember to Forget You",
  "Fake",
  "Stealing Fire",
  "Storyworthy",
  "How to Day Trade for a Living",
  "The Daily Stoic",
  "To Sell Is Human",
  "The One Thing",
  "How to Become a People Magnet",
  "Dare to Lead",
  "The Body Keeps the Score",
  "A Brief History of Time by Stephen Hawking",
  "Chanakya Neeti / Arthashastra",
  "48 Laws of Power",
  "It Starts with Us",
  "Rich Dad's Prophecy",
  "Read People Like a Book",
  "The Art of Witty Banter",
  "Order Flow Trading Setups",
  "Awareness",
  "Confessions of an Advertising Man",
  "Indistractable",
  "Umm... It's Complicated?",
  "The Go-Getter",
  "The Mind-Gut Connection",
  "The Theory of Everything",
  "The Art of War",
  "100 Non-Negotiable Rules for Men",
  "The Bookshop Woman",
  "The End of Banking",
  "The Science of Attraction",
  "How to Work with Complicated People",
  "Definitive Guide to Advanced Option Trading",
  "Reality Transurfing",
  "The Start-Up of You",
  "Deep Work: Rules for Focused Success",
  "Thank You for Leaving",
  "Books on Leadership",
  "Maximum Brainpower: Challenging the Brain for Health and Wisdom",
  "Sapiens",
];

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
  await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'show';`;
  await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS purchased BOOLEAN NOT NULL DEFAULT false;`;
  await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS position INTEGER;`;
}

async function alreadyExists(name, type) {
  const { rows } = await sql`
    SELECT 1 FROM items WHERE name = ${name} AND type = ${type} LIMIT 1;
  `;
  return rows.length > 0;
}

async function main() {
  await ensureTable();

  const now = Date.now();
  let insertedShows = 0;
  let insertedBooks = 0;
  let skipped = 0;

  // --- Shows ---
  for (let i = 0; i < shows.length; i++) {
    const [name, category] = shows[i];
    if (await alreadyExists(name, "show")) {
      skipped++;
      continue;
    }
    const id = (now - i).toString(36) + Math.random().toString(36).slice(2, 8);
    await sql`
      INSERT INTO items (id, name, type, category, purchased, position, created_at)
      VALUES (${id}, ${name}, 'show', ${category}, false, NULL, to_timestamp(${(now - i * 1000) / 1000}));
    `;
    insertedShows++;
  }

  // --- Books (position = index, preserving your given order) ---
  for (let i = 0; i < books.length; i++) {
    const name = books[i];
    if (await alreadyExists(name, "book")) {
      skipped++;
      continue;
    }
    const id = (now + i).toString(36) + Math.random().toString(36).slice(2, 8);
    await sql`
      INSERT INTO items (id, name, type, category, purchased, position, created_at)
      VALUES (${id}, ${name}, 'book', '', false, ${i}, to_timestamp(${(now - i * 1000) / 1000}));
    `;
    insertedBooks++;
  }

  console.log(`Inserted ${insertedShows} shows, ${insertedBooks} books. Skipped ${skipped} already present.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
