// ✅ 'axios' is now imported to call your Python service
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Use createPool for better connection management
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Nakka@123',
  database: 'userdetails',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 🟢 Default Route
app.get('/', (req, res) => {
  res.send('Server running');
});

// 🔐 Register User (rewritten with modern async/await)
app.post('/add-item', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: 'Invalid email' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password too short' });

    let [users] = await db.query('SELECT id FROM userslist WHERE name = ?', [name]);
    if (users.length > 0) return res.status(409).json({ success: false, message: 'Username exists' });

    let [emails] = await db.query('SELECT id FROM userslist WHERE email = ?', [email]);
    if (emails.length > 0) return res.status(409).json({ success: false, message: 'Email exists' });

    const [result] = await db.query('INSERT INTO userslist (name, email, password, created_at) VALUES (?, ?, ?, NOW())', [name, email, password]);
    res.status(201).json({ success: true, message: 'User registered!', userId: result.insertId });

  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// 🔐 Login Check
app.post('/login-check', async (req, res) => {
  try {
    const { name, password } = req.body;
    const sql = 'SELECT * FROM userslist WHERE name = ? AND password = ?';
    const [results] = await db.query(sql, [name, password]);

    if (results.length > 0) {
      res.status(200).json({ success: true, message: 'Login successful', userId: results[0].id });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('❌ Login DB error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ✨📝 '/save-feed' ROUTE IS UPDATED TO USE THE AI MICROSERVICE
app.post('/save-feed', async (req, res) => {
  const { user_id, title, content, emoji } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({ success: false, message: "Missing user_id or content" });
  }

  let prediction = null;

  try {
    const textToAnalyze = `${title || ''}. ${content}`;

    // --- Step 1: Call the Python AI Service ---
    try {
      const aiResponse = await axios.post('http://127.0.0.1:8000/analyze', {
        text: textToAnalyze
      });
      
      const genericLabel = aiResponse.data.prediction;

      // --- Step 2: Map the generic labels to meaningful names ---
      const labelMap = {
        'LABEL_0': 'stressed',
        'LABEL_1': 'normal',
        'LABEL_2': 'depressed'
      };
      prediction = labelMap[genericLabel] || 'unknown';

    } catch (aiError) {
      console.error("❌ Error calling AI service:", aiError.message);
      prediction = 'analysis_failed';
    }

    // --- Step 3: Save the final data to the database ---
    // ✨ FIX: Rewrote the SQL query as a single line to prevent hidden character/syntax errors.
    const sql = `INSERT INTO userfeeds (user_id, title, content, emoji, prediction) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [user_id, title, content, emoji, prediction]);
    res.status(200).json({ success: true, message: "Feed saved with prediction", feedId: result.insertId });

  } catch (dbError) {
    console.error('❌ Error saving feed to DB:', dbError);
    res.status(500).json({ success: false, message: 'Database error during feed save' });
  }
});

// 📥 Get All Feeds for User
app.post('/get-feed', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }
    const sql = `SELECT * FROM userfeeds WHERE user_id = ? ORDER BY created_at DESC`;
    const [results] = await db.query(sql, [userId]);
    res.status(200).json({ success: true, feeds: results });
  } catch (err) {
    console.error('❌ Error fetching feeds:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ✨ ADDED: Get a single feed by its ID
app.get('/get-feed/:id', async (req, res) => {
  try {
    const feedId = req.params.id;
    const sql = 'SELECT * FROM userfeeds WHERE id = ?';
    const [result] = await db.query(sql, [feedId]);
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Feed not found' });
    }
    res.status(200).json({ success: true, feed: result[0] });
  } catch (err) {
    console.error('❌ Error fetching single feed:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ✨ ADDED: Update a feed
app.put('/update-feed/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, emoji } = req.body;
    const sql = `UPDATE userfeeds SET title = ?, content = ?, emoji = ? WHERE id = ?`;
    await db.query(sql, [title, content, emoji, id]);
    res.json({ success: true, message: 'Feed updated successfully' });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "DB update failed" });
  }
});

// ✨ ADDED: Delete a feed
app.delete('/delete-feed/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `DELETE FROM userfeeds WHERE id = ?`;
    await db.query(sql, [id]);
    res.json({ success: true, message: 'Feed deleted successfully' });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "DB delete failed" });
  }
});


// ✨ ADDED: Other API routes for different pages/features
app.get("/api/feeds/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [feeds] = await db.query(
      "SELECT id, created_at, prediction FROM userfeeds WHERE user_id = ?",
      [userId]
    );
    res.json({ success: true, feeds: feeds });
  } catch (err) {
    console.error("Error fetching user feeds:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/api/feeds/calendar/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const sql = `SELECT DATE(created_at) AS date, emoji FROM userfeeds WHERE user_id = ? ORDER BY created_at ASC`;
    const [rows] = await db.query(sql, [userId]);
    res.json({ success: true, feeds: rows });
  } catch (err) {
    console.error("Error fetching calendar feeds:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✨ NEW: API endpoint to get mood counts for a specific month
app.post('/get-mood-counts', async (req, res) => {
    const { userId, year, month } = req.body;

    if (!userId || !year || !month) {
        return res.status(400).json({ success: false, message: "Missing required fields: userId, year, month" });
    }

    try {
        const sql = `
            SELECT prediction, COUNT(*) as count 
            FROM userfeeds 
            WHERE user_id = ? AND YEAR(created_at) = ? AND MONTH(created_at) = ?
            GROUP BY prediction
        `;
        const [results] = await db.query(sql, [userId, year, month]);

        // Initialize counts to 0
        const counts = { normal: 0, stressed: 0, depressed: 0 };
        
        // Populate counts from the database results
        results.forEach(row => {
            if (counts.hasOwnProperty(row.prediction)) {
                counts[row.prediction] = row.count;
            }
        });

        res.status(200).json({ success: true, counts });

    } catch (err) {
        console.error("❌ Error fetching mood counts:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// ✨ NEW: API endpoint for the Analysis Page
app.post('/get-analysis-data', async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ success: false, message: "Missing userId" });
    }

    try {
        // Query 1: Get overall mood distribution (for a pie chart)
        const distributionSql = `
            SELECT prediction, COUNT(*) as count 
            FROM userfeeds 
            WHERE user_id = ? AND prediction IN ('normal', 'stressed', 'depressed')
            GROUP BY prediction
        `;
        const [distributionResults] = await db.query(distributionSql, [userId]);

        const moodDistribution = { normal: 0, stressed: 0, depressed: 0 };
        distributionResults.forEach(row => {
            if (moodDistribution.hasOwnProperty(row.prediction)) {
                moodDistribution[row.prediction] = row.count;
            }
        });

        // Query 2: Get mood timeline (for a line chart)
        const timelineSql = `
            SELECT created_at, prediction 
            FROM userfeeds 
            WHERE user_id = ? AND prediction IN ('normal', 'stressed', 'depressed')
            ORDER BY created_at ASC
        `;
        const [moodTimeline] = await db.query(timelineSql, [userId]);

        res.status(200).json({
            success: true,
            data: {
                moodDistribution,
                moodTimeline
            }
        });

    } catch (err) {
        console.error("❌ Error fetching analysis data:", err);
        res.status(500).json({ success: false, message: "Database error while fetching analysis data" });
    }
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server started on port: ${port}`);
});

