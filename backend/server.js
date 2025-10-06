// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs');
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const { release } = require('os');
const { json } = require('stream/consumers');
const { parse } = require('path');
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
  name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  release_date DATE,
  publisher TEXT,
  extras TEXT,
  game_id INTEGER,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
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
    extras TEXT,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    warning TEXT,
    requires TEXT NOT NULL,
    game_id INTEGER,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
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
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS quest_version(
    quest_id INTEGER,
    version_id INTEGER,
    PRIMARY KEY (quest_id, version_id),
    FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS game_platform (
    game_id INTEGER,
    platform_id INTEGER,
    PRIMARY KEY(game_id, platform_id),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS achievement_platform (
    achievement_id INTEGER,
    platform_id INTEGER,
    PRIMARY KEY (achievement_id, platform_id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_achievement (
    user_id INTEGER,
    achievement_id INTEGER,
    achieved INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

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

// Get gameName
app.get('/api/games/:gameId/name', (req, res) => {
  const gameId = req.params.gameId
  
  try {
    const game = db.prepare(`SELECT name FROM games WHERE id = ?`).get(gameId)
    res.json(game.name)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
});

// Get versions, grouped by gameName
app.get('/api/versions', (req, res) => {
  try {
    const versions = db.prepare(`
        SELECT g.name as gameName,
              json_group_array(
                json_object(
                  'id', v.id,
                  'name', v.name,
                  'year', v.release_date,
                  'developer', v.publisher,
                  'gameId', v.game_id,
                  'extras', v.extras
                )
              ) as version
        FROM games g
        JOIN versions v ON g.id = v.game_id
        GROUP BY g.name;
      `).all()
    const parsedVersions = versions.map(v => {
      const parsedVersionArr = JSON.parse(v.version).map(ver => ({
        ...ver,
        extras: ver.extras ? JSON.parse(ver.extras) : []
      }));
      return {...v, version: parsedVersionArr};
    });
    res.json(parsedVersions)
  } catch (err) {
    console.error("Error getting versions: ", err)
    res.status(500).json({ error: err.message})
  }
})

// Get versions (game specific)
app.get('/api/versions/:gameId', (req, res) => {
  const gameId = req.params.gameId

  try {
    const versions = db.prepare(`
      SELECT * FROM versions WHERE game_id = ? GROUP BY id
      `).all(gameId)
    const parsedVersions = versions.map(v => ({...v, extras: JSON.parse(v.extras)}));
      res.json(parsedVersions)
    } catch (err) {
      console.error("Failed to fetch versions: ", err)
      res.status(500).json({ error: err.message })
    }
  });

  // Get specific version
  app.get('/api/versions/:versionId/ver', (req, res) => {
    const versionId = req.params.versionId

    try {
      const version = db.prepare(`
        SELECT v.*,
        g.name as gameName
        FROM versions v
        LEFT JOIN games g ON g.id = v.game_id
        WHERE v.id = ?
        `).get(versionId)
        res.json({...version, extras: JSON.parse(version.extras)})
    } catch (err) {
      console.error("Failed to fetch version: ", err)
      res.status(500).json({ error: err.message})
    }
  });

// Get all platforms
app.get('/api/platforms', (req, res) => {
  try {
    const platforms = db.prepare(`SELECT * FROM platforms`).all();
    res.json(platforms);
  } catch (err) {
    console.error("Error fetching platforms: ", err)
    res.status(500).json({ error: err.message })
  }
});

// Get platforms related to specific achievement
app.get('/api/platforms/:gameId', (req, res) => {
  const gameId = req.params.gameId

  try {
    const platforms = db.prepare(`
      SELECT p.*
      FROM platforms p
      LEFT JOIN game_platform gp ON p.id = gp.platform_id
      WHERE gp.game_id = ?
      `).all(gameId)
      res.json(platforms);
  } catch (err) {
    console.error('Error fetching platforms:', err);
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

    const parsedQuests = quests.map(q => ({...q, extras: JSON.parse(q.extras)}))
    res.json(parsedQuests);
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
      // Get quests
      const quests = db.prepare(`
            SELECT q.*,
                  CASE 
                    WHEN ? IS NULL THEN 0
                    ELSE IFNULL(uq.completed, 0)
                  END AS completed,
            json_group_array(
              json_object('id', v.id, 'name', v.name)
              ) as versions
            FROM quests q
            LEFT JOIN quest_version qv ON q.id = qv.quest_id
            LEFT JOIN versions v ON qv.version_id = v.id
            LEFT JOIN user_quests uq 
                  ON q.id = uq.quest_id AND uq.user_id = ?
            WHERE q.game_id = ?
            GROUP BY q.id
        `).all(userId, userId, gameId)
        const parsedQuests = quests.map(quest => ({ ...quest, versions: JSON.parse(quest.versions), extras: JSON.parse(quest.extras), completed: !!quest.completed}));
        res.json(parsedQuests);
  } catch (err) {
    console.error('Error fetching quests:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get specific quest data
app.get('/api/quests/:questId', (req, res) => {
  const questId = req.params.questId;
  
  try {
    // Get quest related info with versions
    const quest = db.prepare(`
      SELECT q.*,
      g.name as gameName,
      json_group_array(
        json_object('id', v.id, 'name', v.name)
        ) as versions
      FROM quests q
      LEFT JOIN quest_version qv ON q.id = qv.quest_id
      LEFT JOIN versions v ON qv.version_id = v.id
      LEFT JOIN games g ON q.game_id = g.id
      WHERE q.id = ?
      GROUP BY q.id
      `).get(questId)

    res.json({...quest, versions : JSON.parse(quest.versions), extras : quest.extras ? JSON.parse(quest.extras) : []});
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

app.get("/api/dummytest", (req, res) => {
  console.log("dummytest hit");
  res.json({ ok: true });
});

//Get specific achievement
app.get('/api/achievements/:achievementId', (req, res) => {
  const { achievementId } = req.params;
  
  try{
    const achievement = db.prepare(`
      SELECT a.*,
      json_group_array(
        json_object('id', p.id, 'name', p.name)
      ) as platforms
      FROM achievements a
      LEFT JOIN achievement_platform ap ON a.id = ap.achievement_id
      LEFT JOIN platforms p ON ap.platform_id = p.id
      WHERE a.id = ?
      GROUP BY a.id
      `).get(achievementId)

      res.json({...achievement, platforms : JSON.parse(achievement.platforms)});
  } catch(err) {
    console.error('Error fetching achievement', err)
    res.status(500).json({ error: err.message})
  }
});

//Get achievement (for specific game)
app.get('/api/games/:gameId/achievements', (req, res) => {
  let userId = null;
  const gameId = req.params.gameId;

  // User:
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded =jwt.verify(token, jwtSecret);
      userId = decoded.id
    } catch (err) {

    }
  };

  // Achievements:
  try {
    const achievements = db.prepare(`
    SELECT a.*,
    CASE 
      WHEN ? IS NULL THEN 0
      ELSE IFNULL(ua.achieved, 0)
    END AS achieved,
    json_group_array(
      json_object('id', p.id, 'name', p.name)
      ) as platforms
    FROM achievements a
    LEFT JOIN achievement_platform ap ON a.id = ap.achievement_id
    LEFT JOIN platforms p ON ap.platform_id = p.id
    LEFT JOIN user_achievement ua
          ON a.id = ua.achievement_id AND ua.user_id = ?
    WHERE a.game_id = ?
    GROUP BY a.id
      `).all(userId, userId, gameId);
      const parsedAchievements = achievements.map(achievement => ({
        ...achievement, platforms: JSON.parse(achievement.platforms), achieved: !!achievement.achieved 
      }));
      res.json(parsedAchievements);
  } catch (err) {
    console.error('Error fetching achievements: ', err);
    res.status(500).json({ error: err.message })
  }
});

// Add achievement
app.post('/api/achievements', authenticateToken, requireRole('admin'), (req, res) => {
  const { name, requires, description, warning, gameId, platforms } = req.body;

  if (!platforms || platforms.length === 0) {
    return res.status(400).json({ error: "At least one platform must be selected." });
    }

  try{
    const achievementStmt = db.prepare(`
      INSERT INTO achievements (name, requires, description, warning, game_id)
      VALUES (?, ?, ?, ?, ?)
      `);
    const achievement = achievementStmt.run(name, requires, description, warning, gameId);

    const apStmt = db.prepare(`
      INSERT INTO achievement_platform (achievement_id, platform_id)
      VALUES (?, ?)
      `);
      platforms.forEach(pid => apStmt.run(achievement.lastInsertRowid, pid))

      res.status(201).json({ id: achievement.lastInsertRowid, message: 'Achievement added succesfully '})

  } catch (err) {
    console.error('Error adding achievement: ', err);
    res.status(500).json({ error: err.message})
  }
});

// Achievement completed
app.post('/api/achievements/:id/achieved', authenticateToken, (req, res) => {
  const achievementId = req.params.id;
  const userId = req.user.id;
  const achieved = req.body.achieved ? 1 : 0;

  try {
    const stmt = db.prepare(`
      INSERT INTO user_achievement (user_id, achievement_id, achieved)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, achievement_id) DO UPDATE SET achieved = ?
    `);
    stmt.run(userId, achievementId, achieved, achieved);

    res.json({ message: `Achievement marked as ${achieved ? 'achieved' : 'not achieved'}` });
  } catch (err) {
    console.error('Error updating achievement:', err);
    res.status(400).json({ error: err.message });
  }
});

//Update Achievement
app.put('/api/achievements/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params
  const { name, requires, description, warning, gameId, platforms } = req.body;
  try{
    //Delete all connections of the game from game_platform table
    const platformDelStmt = db.prepare(`DELETE FROM achievement_platform WHERE achievement_id = ?`).run(id);

    const platformInsertStmt = db.prepare(`
      INSERT INTO achievement_platform (achievement_id, platform_id)
      VALUES (?, ?)
      `);
      platforms.forEach(pid => platformInsertStmt.run(id, pid));

    const updateStmt = db.prepare(`
      UPDATE achievements
      SET name = ?, requires = ?, description = ?, warning = ?, game_id = ?
      WHERE id = ?`).run(name, requires, description, warning, gameId, id)

    res.json({ message: `Achievement ${id} updated successfully`})
  } catch (err) {
    console.error("Error updating achievement: ", err)
    res.status(500).json({ error: err.message })
  }
});

// Get completed quests
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

// Add quest
app.post('/api/quests', authenticateToken, requireRole('admin'), (req, res) => {
  const { title, description, requirement, location, missable, gameId, hint, versions, extras } = req.body;

  if (!versions || versions.length === 0) {
    return res.status(400).json({ error: "At least one version must be selected." });
  }
  try {

      const questStmt = db.prepare(`
          INSERT INTO quests (game_id, title, description, requirement, location, missable, hint, extras)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
      const quest = questStmt.run(gameId, title, description, requirement, location, missable, hint, extras);

      const qpStmt = db.prepare(`
        INSERT INTO quest_version (quest_id, version_id)
        VALUES (?, ?)
        `);
      versions.forEach(vId => qpStmt.run(quest.lastInsertRowid, vId))

      res.status(201).json({ id: quest.lastInsertRowid, message: 'Quest added succesfully' });
    } catch (err) {
      console.error('Error adding quest: ', err);
      res.status(500).json({ error: err.message })
    }
  });

// Update quest
app.put('/api/quests/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  let { title, description, requirement, location, missable, hint, gameId, versions, extras } = req.body

  try {

    if (typeof missable === "boolean") {
      missable = missable ? 1: 0;
    }

    const VerDel = db.prepare(`
      DELETE FROM quest_version WHERE quest_id = ?
      `).run(id)

    const verInsertStmt = db.prepare(`
      INSERT INTO quest_version (quest_id, version_id)
      VALUES (?, ?)
      `);
      versions.forEach(vid => verInsertStmt.run(id, vid));
    
    const updateStmt = db.prepare(`
      UPDATE quests
      SET title = ?, description = ?, requirement = ?, location = ?, missable = ?, hint = ?, game_id = ?, extras = ?
      WHERE id = ?
      `);
      const info = updateStmt.run(title, description, requirement, location, missable, hint, gameId, extras, id)
      if (info.changes === 0) return res. status(404).json({error: 'Quest not found'});
      res.json({ message: `Quest ${id} ${info.title} updated successfully` });
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
  const { name, platforms } = req.body
  try {
    //Add game to database
    const gameStmt = db.prepare(`
      INSERT INTO games (name)
      VALUES (?)
      `);
      const games = gameStmt.run(name);
      res.status(201).json({id: games.lastInsertRowid, message: 'Game added successfully'});

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

// Get specific game data
app.get('/api/games/:gameId', (req, res) => {
  const { gameId } = req.params;
  
  try{
    const game = db.prepare(`
      SELECT g.*,
      json_group_array(
        json_object('id', p.id, 'name', p.name)
      ) as platforms
      FROM games g
      LEFT JOIN game_platform gp ON g.id = gp.game_id
      LEFT JOIN platforms p ON gp.platform_id = p.id
      WHERE g.id = ?
      GROUP BY g.id
      `).get(gameId)

      res.json({...game, platforms : JSON.parse(game.platforms)});
  } catch(err) {
    console.error('Error fetching game', err)
    res.status(500).json({ error: err.message})
  }
});

// Update game
app.put('/api/games/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params
  const { name, platforms } = req.body;
  try{
    //Delete all connections of the game from game_platform table
    const platformDelStmt = db.prepare(`DELETE FROM game_platform WHERE game_id = ?`).run(id);

    const platformInsertStmt = db.prepare(`
      INSERT INTO game_platform (game_id, platform_id)
      VALUES (?, ?)
      `);
      platforms.forEach(pid => platformInsertStmt.run(id, pid));

    const updateStmt = db.prepare(`
      UPDATE games
      SET name = ?
      WHERE id = ?`).run(name, id)

    res.json({ message: `Game ${id} updated successfully`})
  } catch (err) {
    console.error("Error updating game", err)
    res.status(500).json({ error: err.message })
  }
});

// Delete game
app.delete('/api/games/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { force } = req.query;
  try{

    const count = db.prepare(`SELECT COUNT(*) as questCount FROM quests WHERE game_id = ?`).get(id)
    if (count.questCount > 0 && !force) {
      return res.status(409).json({ requireConfirmation: true, questCount: count.questCount})
    }

    const deleteStmt = db.prepare(`DELETE FROM games WHERE id = ?`);
    const info = deleteStmt.run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Game not found'});
    res.json({ message: 'Game removed'});
  } catch (err) {
    res.status(500).json({ error: err.message})
    console.error(err)
  }
})

// Add Version
app.post('/api/versions', authenticateToken, requireRole('admin'), (req, res) => {
  const {name, publisher, year, gameId, extras} = req.body
  try {
    const addVer = db.prepare(`
      INSERT INTO versions (name, publisher, release_date, game_id, extras)
      VALUES (?, ?, ?, ?, ?)
      `).run(name, publisher, year, gameId, extras);
      res.status(201).json({id: addVer.lastInsertRowid, message: 'Version added successfully'});
  } catch (err) {
    console.error('Error adding game:', err);
    res.status(500).json({ error: err.message })
  }
})

// Delete version
app.delete('/api/versions/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { force } = req.query;

  try{
    const quests = db.prepare(`
      SELECT COUNT(*) as questCount
      FROM quests q
      LEFT JOIN quest_version qv ON q.id = qv.quest_id
      WHERE qv.version_id = ?`).get(id);
    if (quests.questCount > 0 && !force) {
      return res.status(409).json({ requireConfirmation: true, questCount: quests.questCount})
    }

    const deleteVer = db.prepare(`DELETE FROM versions WHERE id = ?`).run(id)
    if (deleteVer.changes === 0) return res.status(404).json({ error: 'Version not found'});
    res.json({ message: 'Version removed'});
  } catch (err) {
    res.status(500).json({ error: err.message})
    console.error(err)
  }
});

// Update version
app.put('/api/versions/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params
  const { name, developer, year, gameId, extras } = req.body;
  console.log("name: ", name, "dev: ", developer, "year: ", year, "gameId: ", gameId, "extras: ", extras)
  try{

    const updateStmt = db.prepare(`
      UPDATE versions
      SET name = ?, publisher = ?, release_date = ?, game_id = ?, extras = ?
      WHERE id = ?`).run(name, developer, year, gameId, extras, id)

    res.json({ message: `Game ${id} updated successfully`})
  } catch (err) {
    console.error("Error updating game", err)
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
      const platforms = platformStmt.run(name, manufacturer);
      res.status(201).json({id: platforms.lastInsertRowid, message: 'Platform added succesfully'});
  } catch (err) {
    console.error('Error adding platform:', err);
    res.status(500).json({ error: err.message })
  }
})

// Delete platform
app.delete('/api/platforms/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  try{
    const deleteStmt = db.prepare(`DELETE FROM platforms WHERE id = ?`);
    const info = deleteStmt.run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Platform not found'});
    res.json({ message: 'Platform removed'});
  } catch (err) {
    res.status(500).json({ error: err.message})
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

    // Create and send token
    console.log('JWT payload:', { id: user.id, username: user.username, role: user.role });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role},
      jwtSecret,
      { expiresIn: '6h' }
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

//Ping to check if token expired
app.get("/api/ping", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
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

