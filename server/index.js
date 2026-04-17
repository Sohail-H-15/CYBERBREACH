require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite Database');
    db.serialize(() => {
      // Create Teams Table
      db.run(`CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teamName TEXT UNIQUE NOT NULL,
        score INTEGER DEFAULT 0,
        solvedQuestions TEXT DEFAULT '[]',
        lettersCollected TEXT DEFAULT '[]',
        tabSwitchCount INTEGER DEFAULT 0,
        isFinished INTEGER DEFAULT 0,
        startTime TEXT,
        endTime TEXT
      )`);

      // Create Submissions Table
      db.run(`CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teamName TEXT NOT NULL,
        questionId INTEGER NOT NULL,
        answer TEXT NOT NULL,
        isCorrect INTEGER NOT NULL,
        timestamp TEXT NOT NULL
      )`);
    });
  }
});

// Helper for db operations returning Promise
const dbGet = (query, params = []) => new Promise((resolve, reject) => db.get(query, params, (err, row) => err ? reject(err) : resolve(row)));
const dbAll = (query, params = []) => new Promise((resolve, reject) => db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows)));
const dbRun = (query, params = []) => new Promise((resolve, reject) => db.run(query, params, function(err) { if (err) reject(err); else resolve(this); }));

const QUESTIONS = {
  1: { answer: 'password', letter: 'E' },
  2: { answer: 'decrypt', letter: 'R' },
  3: { answer: '66', letter: 'Y' },
  4: { answer: 'x9k7', letter: 'CH' },
  5: { answer: 'token', letter: 'C' },
  6: { answer: 'secure', letter: 'B' },
  7: { answer: 'access', letter: 'A' },
  8: { answer: 'key', letter: 'E' },
  9: { answer: '93', letter: 'B' },
  10: { answer: 'encryption', letter: 'R' },
};

const TOTAL_QUESTIONS = Object.keys(QUESTIONS).length;
const TOTAL_TIME_MS = 35 * 60 * 1000;

// ─── Player APIs ─────────────────────────────────────────────────────────────

app.post('/api/login', async (req, res) => {
  try {
    let { teamName } = req.body;
    if (!teamName || typeof teamName !== 'string') return res.status(400).json({ error: 'Valid teamName is required' });
    teamName = teamName.trim();

    let team = await dbGet('SELECT * FROM teams WHERE teamName = ?', [teamName]);
    
    if (!team) {
      await dbRun('INSERT INTO teams (teamName, startTime) VALUES (?, ?)', [teamName, new Date().toISOString()]);
      team = await dbGet('SELECT * FROM teams WHERE teamName = ?', [teamName]);
    }

    return res.json({ teamName: team.teamName, message: 'Session created' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/submit', async (req, res) => {
  try {
    const { teamName, questionId, answer } = req.body;
    if (!teamName || !questionId || answer === undefined) return res.status(400).json({ error: 'Missing required fields' });

    let team = await dbGet('SELECT * FROM teams WHERE teamName = ?', [teamName]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.isFinished === 1) return res.status(403).json({ error: 'Team has finished the game' });

    const solvedQs = JSON.parse(team.solvedQuestions);
    const colLetters = JSON.parse(team.lettersCollected);

    if (solvedQs.includes(Number(questionId))) {
      return res.status(400).json({ error: 'Question already solved' });
    }

    const questionData = QUESTIONS[questionId];
    if (!questionData) return res.status(400).json({ error: 'Invalid question ID' });

    const isCorrect = String(answer).toLowerCase().trim() === questionData.answer.toLowerCase();

    await dbRun('INSERT INTO submissions (teamName, questionId, answer, isCorrect, timestamp) VALUES (?, ?, ?, ?, ?)', [
      teamName, questionId, answer, isCorrect ? 1 : 0, new Date().toISOString()
    ]);

    if (isCorrect) {
      team.score += 10;
      solvedQs.push(Number(questionId));
      colLetters.push(questionData.letter);
      
      let isFinished = team.isFinished;
      let endTime = team.endTime;
      if (solvedQs.length >= TOTAL_QUESTIONS) {
        isFinished = 1;
        endTime = new Date().toISOString();
      }

      await dbRun(
        'UPDATE teams SET score = ?, solvedQuestions = ?, lettersCollected = ?, isFinished = ?, endTime = ? WHERE id = ?',
        [team.score, JSON.stringify(solvedQs), JSON.stringify(colLetters), isFinished, endTime, team.id]
      );

      return res.json({ ok: true, correct: true, addedScore: 10, letter: questionData.letter, totalScore: team.score, isFinished: isFinished === 1 });
    } else {
      return res.json({ ok: true, correct: false, addedScore: 0, totalScore: team.score });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/tab-switch', async (req, res) => {
  try {
    const { teamName } = req.body;
    if (!teamName) return res.status(400).json({ error: 'teamName required' });

    let team = await dbGet('SELECT * FROM teams WHERE teamName = ?', [teamName]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.isFinished === 1) return res.json({ ok: true });

    let newCount = team.tabSwitchCount + 1;
    let newScore = Math.max(0, team.score - 5);

    await dbRun('UPDATE teams SET tabSwitchCount = ?, score = ? WHERE id = ?', [newCount, newScore, team.id]);
    
    return res.json({ ok: true, score: newScore, tabSwitchCount: newCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/team/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;
    const team = await dbGet('SELECT * FROM teams WHERE teamName = ?', [teamName]);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    let remainingTime = 0;
    if (team.startTime) {
      const elapsed = Date.now() - new Date(team.startTime).getTime();
      remainingTime = Math.max(0, TOTAL_TIME_MS - elapsed);
      
      if (remainingTime === 0 && team.isFinished === 0) {
        team.isFinished = 1;
        await dbRun('UPDATE teams SET isFinished = 1, endTime = ? WHERE id = ?', [new Date().toISOString(), team.id]);
      }
    }

    return res.json({
      teamName: team.teamName,
      score: team.score,
      solvedQuestions: JSON.parse(team.solvedQuestions),
      lettersCollected: JSON.parse(team.lettersCollected),
      tabSwitchCount: team.tabSwitchCount,
      isFinished: team.isFinished === 1,
      remainingTime: remainingTime
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/finish', async (req, res) => {
  try {
    const { teamName } = req.body;
    const team = await dbGet('SELECT * FROM teams WHERE teamName = ?', [teamName]);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    if (team.isFinished === 0) {
      await dbRun('UPDATE teams SET isFinished = 1, endTime = ? WHERE id = ?', [new Date().toISOString(), team.id]);
    }
    return res.json({ ok: true, status: 'secured' });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── Admin APIs ──────────────────────────────────────────────────────────────

const ADMIN_ID = process.env.ADMIN_ID || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'cybersecret';

// Middleware to protect admin routes
app.use('/api/admin', (req, res, next) => {
  // Check auth headers
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const decoded = Buffer.from(token, 'base64').toString('utf8');
  const [userid, password] = decoded.split(':');

  if (userid === ADMIN_ID && password === ADMIN_PASS) {
    next();
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/admin/verify', (req, res) => {
  return res.json({ ok: true }); // if it goes through middleware, it's ok
});

app.get('/api/admin/teams', async (req, res) => {
  try {
    const teams = await dbAll('SELECT * FROM teams ORDER BY score DESC, startTime ASC');
    // Format JSON array columns before sending
    const formatted = teams.map(t => ({
      ...t,
      solvedQuestions: JSON.parse(t.solvedQuestions),
      lettersCollected: JSON.parse(t.lettersCollected),
      isFinished: t.isFinished === 1
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/adjust-score', async (req, res) => {
  try {
    const { teamName, score } = req.body;
    let newScore = Math.max(0, Number(score));
    await dbRun('UPDATE teams SET score = ? WHERE teamName = ?', [newScore, teamName]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/disqualify', async (req, res) => {
  try {
    const { teamName } = req.body;
    await dbRun('UPDATE teams SET isFinished = 1, score = 0 WHERE teamName = ?', [teamName]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/reset', async (req, res) => {
  try {
    const { teamName } = req.body;
    await dbRun(`UPDATE teams SET 
      score = 0, 
      solvedQuestions = '[]', 
      lettersCollected = '[]', 
      tabSwitchCount = 0, 
      isFinished = 0, 
      startTime = ?, 
      endTime = NULL 
      WHERE teamName = ?`, [new Date().toISOString(), teamName]
    );
    await dbRun('DELETE FROM submissions WHERE teamName = ?', [teamName]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});


// ─── Production Deployment Static Serving ───────────────────────────────
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route to serve React app for standard frontend router logic
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║  CyberBreach SQLite Backend · Port ${PORT}   ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);
  console.log(`Admin ID: ${ADMIN_ID}  |  Admin Pass: ${ADMIN_PASS}`);
});
