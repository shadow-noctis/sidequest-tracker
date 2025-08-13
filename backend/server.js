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
    game TEXT NOT NULL,
    platform TEXT,
    missable BOOLEAN DEFAULT 0,
    location TEXT,
    requirement TEXT,
    hint TEXT
    extras JSON
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

  CREATE TABLE IF NOT EXISTS user_quests (
      user_id INTEGER,
      quest_id INTEGER,
      completed INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, quest_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (quest_id) REFERENCES quests(id)
  );
`);

// ROUTES

// Get all quests
app.get('/api/quests', authenticateToken, (req, res) => {
  const userId = req.user.id;

  try {
    const quests = db.prepare(`
      SELECT q.*,
             IFNULL(uq.completed, 0) AS completed
      FROM quests q
      LEFT JOIN user_quests uq 
             ON q.id = uq.quest_id AND uq.user_id = ?
    `).all(userId).map(q => ({ ...q, completed: !!q.completed })); // convert to Boolean

    res.json(quests);
  } catch (err) {
    console.error('Error fetching quests:', err);
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
  const { username, password } = req.body;
  console.log(username)
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  bcrypt.compare(password, user.password_hash, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!result) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // ✅ Only create token once and send once
    console.log('JWT payload:', { id: user.id, username: user.username });
    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.json({ token });
  });
});

// Mark quest as completed
app.post('/api/quests/:id/complete', authenticateToken, (req, res) => {
  const questId = req.params.id;
  const userId = req.user.id;
  const completed = req.body.completed ? 1 : 0;

  try {
    const stmt = db.prepare(`
      INSERT INTO user_quests (user_id, quest_id, completed)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, quest_id) DO UPDATE SET completed = ?
    `);
    stmt.run(userId, questId, completed, completed);

    res.json({ message: `Quest marked as ${completed ? 'completed' : 'not completed'}` });
  } catch (err) {
    console.error('Error updating quest:', err);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/user/quests', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const stmt = db.prepare(`
        SELECT q.*, uq.completed
        FROM quests q
        LEFT JOIN user_quests uq
        ON q.id = uq.quest_id AND uq.user_id = ?
    `);
    const quests = stmt.all(userId);
    res.json(quests);
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}
module.exports = authenticateToken;

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
