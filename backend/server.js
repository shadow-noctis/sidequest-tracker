// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs');
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const { release } = require('os');
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
  CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  publisher TEXT,
  release_date DATE
  );

  CREATE TABLE IF NOT EXISTS platforms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  manufacturer TEXT
  );  
  
  CREATE TABLE IF NOT EXISTS quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    missable BOOLEAN DEFAULT 0,
    location TEXT,
    requirement TEXT,
    hint TEXT,
    FOREIGN KEY (game_id) REFERENCES games(id)
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    unlocked BOOLEAN DEFAULT 0,
    game_id INTEGER,
    platform_id INTEGER,
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (platform_id) REFERENCES platforms(id)
  );

  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS user_quests (
      user_id INTEGER,
      quest_id INTEGER,
      completed INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, quest_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (quest_id) REFERENCES quests(id)
  );

  CREATE TABLE IF NOT EXISTS game_platform (
    game_id INTEGER,
    platform_id INTEGER,
    PRIMARY KEY(game_id, platform_id),
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (platform_id) REFERENCES platforms(id)
  )
`);

//Create admin
function createAdmin() {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    console.warn("Admin credentials missing in .env: Admin not created")
    return;
  }

  const existing = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  if(!existing) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')")
      .run(username, hashedPassword)
    console.log(`Adming user '${username}' created.`)
  } else {
    console.log(`User '${username}' already exists`)
  }
}

createAdmin();

// ROUTES

// Get all games
app.get('/api/games', (req, res) => {
  try {
    const games = db.prepare(`SELECT * FROM games`).all();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});


// Get all quests
app.get('/api/quests', (req, res) => {
  let userId = null;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded =jwt.verify(token, jwtSecret);
      userId = decoded.id
    } catch (err) {

    }
  }

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


// Get quests related to specific game
app.get('/api/games/:gameId/quests', (req, res) => {
  let userId = null;
  const gameId = req.params.gameId;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded =jwt.verify(token, jwtSecret);
      userId = decoded.id
    } catch (err) {

    }
  }
    try {
const quests = db.prepare(`
      SELECT q.*,
            CASE 
              WHEN ? IS NULL THEN 0
              ELSE IFNULL(uq.completed, 0)
            END AS completed
      FROM quests q
      LEFT JOIN user_quests uq 
            ON q.id = uq.quest_id AND uq.user_id = ?
      WHERE q.game_id = ?
  `).all(userId, userId, gameId)
  .map(q => ({ ...q, completed: !!q.completed }));

    res.json(quests);
  } catch (err) {
    console.error('Error fetching quests:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get specific quest data
app.get('/api/quests/:questId', (req, res) => {
  const questId = req.params.questId;
  
  try {
    const quest = db.prepare(`SELECT * FROM quests WHERE id = ?`).get(questId)
    res.json(quest);
  } catch (err) {
    console.error('Error fetching quest', err);
    res.status(500).json({ error: err.message })
  }
})

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
app.post('/api/quests', authenticateToken, requireRole('admin'), (req, res) => {
  const { title, description, requirement, location, missable, gameName, platformName } = req.body;
  try {
    const gameStmt = db.prepare(`
      INSERT INTO games (name) VALUES (?)
      ON CONFLICT(name) DO NOTHING
      `);
      gameStmt.run(gameName)

      const game = db.prepare(`SELECT id FROM games WHERE name = ?`).get(gameName)

      const platformStmt = db.prepare(`
        INSERT INTO platforms (name) VALUES (?)
        ON CONFLICT (name)  DO NOTHING
        `);
        platformStmt.run(platformName)

        const platform = db.prepare(`SELECT id FROM platforms WHERE name = ?`).get(platformName)

        const gpStmt =  db.prepare(`
          INSERT INTO game_platform (game_id, platform_id) VALUES (?, ?)
          ON CONFLICT(game_id, platform_id) DO NOTHING
          `);
          gpStmt.run(game.id, platform.id);

          const questStmt = db.prepare(`
              INSERT INTO quests (game_id, title, description, requirement, location, missable)
              VALUES (?, ?, ?, ?, ?, ?)
            `);
          const info = questStmt.run(game.id, title, description, requirement, location, missable);
          res.status(201).json({ id: info.lastInsertRowid, message: 'Quest added succesfully' });
    } catch (err) {
      console.error('Error adding quest: ', err);
      res.status(500).json({ error: err.message })
    }
  });

// Update quest
app.put('/api/quests/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  let { title, description, requirement, location, missable, hint} = req.body

  try {

    if (typeof missable === "boolean") {
      missable = missable ? 1: 0;
    }

    const stmt = db.prepare(`
      UPDATE quests
      SET title = ?, description = ?, requirement = ?, location = ?, missable = ?, hint = ?
      WHERE id = ?
      `);
      const info = stmt.run(title, description, requirement, location, missable, hint, id)
      if (info.changes === 0) return res. status(404).json({error: 'Quest not found'});
      res.json({ message: 'Quest updated succesfully' });
  } catch (err) {
    console.error("Error updating quest", err)
    res.status(500).json({ error: err.message });
  }
});

// Delete quest
app.delete('/api/quests/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  try{
    const stmt = db.prepare(`DELETE FROM quests WHERE id = ?`);
    const info = stmt.run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Quest not found'});
    res.json({ message: 'Quest deleted succesfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add game
app.post('/api/games', authenticateToken, requireRole('admin'), (req, res) => {
  const { name, publisher, release_date, platforms } = req.body
  try {
    //Add game to database
    const gameStmt = db.prepare(`
      INSERT INTO games (name, publisher, release_date)
      VALUES (?, ?, ?)
      `);
      const games = gameStmt.run(name, publisher, release_date);
      res.status(201).json({id: games.lastInsertRowid, message: 'Game added succesfully'});

    // Add id connection to game_platform table
    
    for (let i = 0; i < platforms.length; i++) {

    const gameId = games.lastInsertRowid;
    const platform = db.prepare(`SELECT id FROM platforms WHERE name = ?`).get(platforms[i]);
    const platformId = platform.id

    const gpStmt = db.prepare(`
      INSERT INTO game_platform (game_id, platform_id) VALUES (?, ?)`);
      gpStmt.run(gameId, platformId);
    }

  } catch (err) {
    console.error('Error adding game:', err);
    res.status(500).json({ error: err.message })
  }
})

// Get all platforms
app.get('/api/platforms', (req, res) => {
  try {
    const platforms = db.prepare(`SELECT * FROM platforms`).all();
    res.json(platforms);
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});

// Add platform
app.post('/api/platforms', authenticateToken, requireRole('admin'), (req, res) => {
  const { name, manufacturer } = req.body
  try {
    const platformStmt = db.prepare(`
      INSERT INTO platforms (name, manufacturer)
      VALUES (?, ?)
      `);
      const platforms =platformStmt.run(name, manufacturer);
      res.status(201).json({id: platforms.lastInsertRowid, message: 'Platform added succesfully'});
  } catch (err) {
    console.error('Error adding platform:', err);
    res.status(500).json({ error: err.message })
  }
})

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
    console.log('JWT payload:', { id: user.id, username: user.username, role: user.role });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role},
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

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.sendStatus(401);
    if (req.user.role !== role) return res.sendStatus(403);
    next()
  };
}

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
