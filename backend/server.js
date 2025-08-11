// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs');
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET;

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ensure /data folder exists
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data');
}

// Connect to SQLite database (or create it)
const db = new Database('./data/quest_tracker.db');

// Initialize tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0,
    game TEXT,
    platform TEXT,
    missable BOOLEAN DEFAULT 0,
    location TEXT,
    requirement TEXT,
    hint TEXT
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    unlocked BOOLEAN DEFAULT 0,
    game TEXT,
    platform TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
  );
`);

// ROUTES

// Get all quests
app.get('/api/quests', (req, res) => {
  try {
    const quests = db.prepare('SELECT * FROM quests').all();
    res.json(quests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all achievements
app.get('/api/achievements', (req, res) => {
  try {
    const achievements = db.prepare('SELECT * FROM achievements').all();
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new quest
app.post('/api/quests', (req, res) => {
  const { title, description, game, platform, location } = req.body;
  try {
    const stmt = db.prepare(
      'INSERT INTO quests (title, description, game, platform, location) VALUES (?, ?, ?, ?, ?)'
    );
    const info = stmt.run(title, description, game, platform, location);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error('Insert error:', err)
    res.status(400).json({ error: err.message });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  const { username, password, confirmPassword} = req.body;
  const passwordHash = await bcrypt.hash(password, 10)
  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ message: "Please fill all required fields." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords don't match"})
  }
  try {
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    stmt.run(username, passwordHash);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }

});

// Login
app.post('/api/login', (req, res) => {
  const {username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials'});
  bcrypt.compare(password, user.password_hash, (err, result) => {
    if (result) {
      const token = jwt.sign({ id: user.id, username: user.username}, jwtSecret, {expiresIn: '1h'});
      res.json({ token })
    } else {
      res.status(401).json({ error: 'Invalid credentials'})
    }

  });
});

// Optional: Mark quest as completed
app.put('/api/quests/:id/complete', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('UPDATE quests SET completed = 1 WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
