// ✅ 'pg' is now imported for PostgreSQL
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const allowedOrigins = [
  'https://daily-mood-analyser-frontend.onrender.com',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json({ limit: '10mb' }));

// ✅ Connection string is correctly using an environment variable
const supabaseConnectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
    connectionString: supabaseConnectionString,
    ssl: {
      rejectUnauthorized: false
    }
});


// ... (all other routes like register, login, save-feed, etc., remain the same) ...

// 🟢 Default Route
app.get('/', (req, res) => {
    res.send('Server running');
});

// 🔐 Register User (updated for PostgreSQL)
app.post('/add-item', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ success: false, message: 'Invalid email' });
        if (password.length < 6) return res.status(400).json({ success: false, message: 'Password too short' });
        
        let { rows: users } = await pool.query('SELECT id FROM userslist WHERE name = $1', [name]);
        if (users.length > 0) return res.status(409).json({ success: false, message: 'Username exists' });

        let { rows: emails } = await pool.query('SELECT id FROM userslist WHERE email = $1', [email]);
        if (emails.length > 0) return res.status(409).json({ success: false, message: 'Email exists' });
        
        const sql = 'INSERT INTO userslist (name, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id';
        const { rows } = await pool.query(sql, [name, email, password]);
        
        res.status(201).json({ success: true, message: 'User registered!', userId: rows[0].id });

    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

//  Login Check (updated for PostgreSQL)
app.post('/login-check', async (req, res) => {
    try {
        const { name, password } = req.body;
        const sql = 'SELECT * FROM userslist WHERE name = $1 AND password = $2';
        const { rows: results } = await pool.query(sql, [name, password]);

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


// 📝 Save Feed with AI Analysis (updated for PostgreSQL)
app.post('/save-feed', async (req, res) => {
    const { user_id, title, content, emoji } = req.body;
    if (!user_id || !content) {
        return res.status(400).json({ success: false, message: "Missing user_id or content" });
    }
    let prediction = null;
    try {
        const textToAnalyze = `${title || ''}. ${content}`;
        try {
            const aiServiceUrl = `${process.env.AI_SERVICE_URL}/analyze`;
            const aiResponse = await axios.post(aiServiceUrl, { text: textToAnalyze });
            
            const genericLabel = aiResponse.data.prediction;
            const labelMap = {
              'sadness':  'depressed',
              'anger':    'stressed',
              'fear':     'stressed',
              'disgust':  'stressed',
              'neutral':  'normal',
              'joy':      'normal',
              'surprise': 'normal'
            };
            prediction = labelMap[genericLabel] || 'unknown';
        } catch (aiError) {
            console.error("❌ Error calling AI service:", aiError.message);
            prediction = 'analysis_failed';
        }

        const sql = `INSERT INTO userfeeds (user_id, title, content, emoji, prediction) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
        const { rows } = await pool.query(sql, [user_id, title, content, emoji, prediction]);
        res.status(200).json({ success: true, message: "Feed saved with prediction", feedId: rows[0].id });

    } catch (dbError) {
        console.error('❌ Error saving feed to DB:', dbError);
        res.status(500).json({ success: false, message: 'Database error during feed save' });
    }
});

// ✅ NEW: Route specifically for the main feed page to get ALL entries
app.post('/get-all-feeds', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "Missing userId" });
        }

        const sql = `
            SELECT id, title, content, emoji, prediction, created_at 
            FROM userfeeds 
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const { rows: results } = await pool.query(sql, [userId]);
        res.status(200).json({ success: true, feeds: results });
    } catch (err) {
        console.error('❌ Error fetching all feeds:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// 📥 Get All Feeds for User (updated for PostgreSQL)
app.post('/get-feed', async (req, res) => {
    try {
        // ✅ Now accepts a 'days' parameter for filtering
        const { userId, days } = req.body;
        if (!userId || !days) {
            return res.status(400).json({ success: false, message: "Missing userId or days" });
        }

        // ✅ SQL query now filters by the last N days
        const sql = `
            SELECT id, title, content, emoji, prediction, created_at 
            FROM userfeeds 
            WHERE user_id = $1 
            AND created_at >= DATE_TRUNC('day', NOW() - ($2 - 1) * INTERVAL '1 day')
            ORDER BY created_at DESC
        `;
        const { rows: results } = await pool.query(sql, [userId, days]);
        res.status(200).json({ success: true, feeds: results });
    } catch (err) {
        console.error('❌ Error fetching feeds:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// 📄 Get a single feed by its ID (updated for PostgreSQL)
app.get('/get-feed/:id', async (req, res) => {
    try {
        const feedId = req.params.id;
        const sql = 'SELECT * FROM userfeeds WHERE id = $1';
        const { rows: result } = await pool.query(sql, [feedId]);
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Feed not found' });
        }
        res.status(200).json({ success: true, feed: result[0] });
    } catch (err) {
        console.error('❌ Error fetching single feed:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// ✏️ Update a feed (updated for PostgreSQL)
app.put('/update-feed/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, emoji } = req.body;
        const sql = `UPDATE userfeeds SET title = $1, content = $2, emoji = $3 WHERE id = $4`;
        await pool.query(sql, [title, content, emoji, id]);
        res.json({ success: true, message: 'Feed updated successfully' });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ success: false, message: "DB update failed" });
    }
});

// 🗑️ Delete a feed (updated for PostgreSQL)
app.delete('/delete-feed/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `DELETE FROM userfeeds WHERE id = $1`;
        await pool.query(sql, [id]);
        res.json({ success: true, message: 'Feed deleted successfully' });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ success: false, message: "DB delete failed" });
    }
});

// 📅 Get Calendar Feeds (updated for PostgreSQL)
app.get("/api/feeds/calendar/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const sql = `SELECT DATE(created_at) AS date, emoji FROM userfeeds WHERE user_id = $1 ORDER BY created_at ASC`;
        const { rows } = await pool.query(sql, [userId]);
        res.json({ success: true, feeds: rows });
    } catch (err) {
        console.error("Error fetching calendar feeds:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 📊 Get Mood Counts for a specific month (updated for PostgreSQL)
app.post('/get-mood-counts', async (req, res) => {
    const { userId, year, month } = req.body;
    if (!userId || !year || !month) return res.status(400).json({ success: false, message: "Missing required fields" });
    try {
        const sql = `
            SELECT prediction, COUNT(*) as count 
            FROM userfeeds 
            WHERE user_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND EXTRACT(MONTH FROM created_at) = $3
            GROUP BY prediction
        `;
        const { rows: results } = await pool.query(sql, [userId, year, month]);

        const counts = { normal: 0, stressed: 0, depressed: 0 };
        results.forEach(row => {
            if (counts.hasOwnProperty(row.prediction)) {
                counts[row.prediction] = parseInt(row.count, 10);
            }
        });
        res.status(200).json({ success: true, counts });
    } catch (err) {
        console.error("❌ Error fetching mood counts:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// 📈 Get Analysis Data (updated for PostgreSQL)
app.post('/get-analysis-data', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });
    try {
        const distributionSql = `
            SELECT prediction, COUNT(*) as count 
            FROM userfeeds 
            WHERE user_id = $1 AND prediction IN ('normal', 'stressed', 'depressed')
            GROUP BY prediction
        `;
        const { rows: distributionResults } = await pool.query(distributionSql, [userId]);
        const moodDistribution = { normal: 0, stressed: 0, depressed: 0 };
        distributionResults.forEach(row => {
            if (moodDistribution.hasOwnProperty(row.prediction)) {
                moodDistribution[row.prediction] = parseInt(row.count, 10);
            }
        });

        const timelineSql = `
            SELECT created_at, prediction 
            FROM userfeeds 
            WHERE user_id = $1 AND prediction IN ('normal', 'stressed', 'depressed')
            ORDER BY created_at ASC
        `;
        const { rows: moodTimeline } = await pool.query(timelineSql, [userId]);
        res.status(200).json({ success: true, data: { moodDistribution, moodTimeline } });
    } catch (err) {
        console.error("❌ Error fetching analysis data:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// 😊 Get Emoji Counts by Days (✅ THIS IS THE CORRECTED VERSION)
app.post('/get-emoji-counts', async (req, res) => {
    const { userId, days } = req.body;
    if (!userId || !days) return res.status(400).json({ success: false, message: "Missing required fields" });
    try {
        // ✅ FIX: Use DATE_TRUNC to get data from the start of the day, N days ago. This is more reliable.
        const sql = `
            SELECT emoji, COUNT(*) as count 
            FROM userfeeds 
            WHERE user_id = $1 AND created_at >= DATE_TRUNC('day', NOW() - ($2 - 1) * INTERVAL '1 day')
            GROUP BY emoji
            HAVING emoji IS NOT NULL AND emoji != ''
        `;
        const { rows: results } = await pool.query(sql, [userId, days]);
        res.status(200).json({ success: true, emojiCounts: results });
    } catch (err) {
        console.error("❌ Error fetching emoji counts:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// 📊 Get Mood Counts by Days (✅ THIS IS THE CORRECTED VERSION)
app.post('/get-mood-counts-by-days', async (req, res) => {
    const { userId, days } = req.body;
    if (!userId || !days) return res.status(400).json({ success: false, message: "Missing required fields" });
    try {
        // ✅ FIX: Use DATE_TRUNC here as well for consistent logic.
        const sql = `
            SELECT prediction, COUNT(*) as count 
            FROM userfeeds 
            WHERE user_id = $1 
            AND created_at >= DATE_TRUNC('day', NOW() - ($2 - 1) * INTERVAL '1 day')
            AND prediction IN ('normal', 'stressed', 'depressed')
            GROUP BY prediction
        `;
        const { rows: results } = await pool.query(sql, [userId, days]);
        const counts = { normal: 0, stressed: 0, depressed: 0 };
        results.forEach(row => {
            if (counts.hasOwnProperty(row.prediction)) {
                counts[row.prediction] = parseInt(row.count, 10);
            }
        });
        res.status(200).json({ success: true, counts });
    } catch (err) {
        console.error("❌ Error fetching mood counts by days:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// ... (processUnanalyzedFeeds and app.listen can remain the same) ...
async function processUnanalyzedFeeds() {
  console.log('🔍 Checking for any unanalyzed feeds...');
  try {
    const { rows: feedsToProcess } = await pool.query(
      "SELECT id, title, content FROM userfeeds WHERE prediction = 'analysis_failed'"
    );

    if (feedsToProcess.length === 0) {
      console.log('✅ No unanalyzed feeds found. All good!');
      return;
    }

    console.log(`❗️ Found ${feedsToProcess.length} feeds to analyze. Starting process...`);

    for (const feed of feedsToProcess) {
      try {
        const textToAnalyze = `${feed.title || ''}. ${feed.content}`;
        const aiServiceUrl = `${process.env.AI_SERVICE_URL}/analyze`;
        const aiResponse = await axios.post(aiServiceUrl, { text: textToAnalyze });
        
        const genericLabel = aiResponse.data.prediction;
        const labelMap = {
          'sadness':  'depressed',
          'anger':    'stressed',
          'fear':     'stressed',
          'disgust':  'stressed',
          'neutral':  'normal',
          'joy':      'normal',
          'surprise': 'normal'
        };
        const newPrediction = labelMap[genericLabel] || 'unknown';

        await pool.query(
          'UPDATE userfeeds SET prediction = $1 WHERE id = $2',
          [newPrediction, feed.id]
        );

        console.log(`- Updated feed ID ${feed.id} with prediction: ${newPrediction}`);

      } catch (error) {
        console.error(`- Could not analyze feed ID ${feed.id}: ${error.message}. Will try again on next server restart.`);
      }
    }
    
    console.log('✅ Catch-up process complete.');

  } catch (dbError) {
    console.error("❌ Database error during catch-up process:", dbError);
  }
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`🚀 Server started on port: ${port}`);
    
    setTimeout(processUnanalyzedFeeds, 5000);
});
