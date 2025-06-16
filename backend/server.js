const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Nakka@123',
  database: 'userdetails'
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

// 🟢 Default Route
app.get('/', (req, res) => {
  res.send('Server running');
});

// 🔐 Register User
app.post('/add-item', (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ message: 'Missing name or password' });
  }

  const sql = 'INSERT INTO userslist (name, password) VALUES (?, ?)';
  db.query(sql, [name, password], (err, result) => {
    if (err) {
      console.error('❌ Error inserting data:', err.sqlMessage);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({ message: 'User registered successfully' });
  });
});

// 🔐 Login Check
app.post('/login-check', (req, res) => {
  const { name, password } = req.body;

  const sql = 'SELECT * FROM userslist WHERE name = ? AND password = ?';
  db.query(sql, [name, password], (err, results) => {
    if (err) {
      console.error('❌ Login DB error:', err.sqlMessage);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

    if (results.length > 0) {
      res.status(200).json({ success: true, message: 'Login successful', userId: results[0].id });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// 📝 Save Feed
app.post('/save-feed', (req, res) => {
  const { user_id, title, content, image_url, emoji } = req.body;

  if (!user_id || !emoji) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO userfeeds (user_id, title, content, image_url, emoji)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [user_id, title, content, image_url, emoji], (err, result) => {
    if (err) {
      console.error('❌ Error saving feed:', err.sqlMessage);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.status(200).json({ success: true, message: "Feed saved" });
  });
});

// 📥 Corrected: Get Feeds for User
app.post('/get-feed', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Missing userId" });
  }

  const sql = `SELECT * FROM userfeeds WHERE user_id = ? ORDER BY created_at DESC`;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching feeds:', err.sqlMessage);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.status(200).json({ success: true, feeds: results });
  });
});



// view for particular feed

app.get('/get-feed/:id', (req, res) => {
  const feedId = req.params.id;

  const sql = 'SELECT * FROM userfeeds WHERE id = ?';
  db.query(sql, [feedId], (err, result) => {
    if (err) {
      console.error('❌ Error fetching feed:', err.sqlMessage);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Feed not found' });
    }

    res.status(200).json({ success: true, feed: result[0] });
  });
});


// Update feed
app.put('/update-feed/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, emoji, image_url } = req.body;

  const sql = `
    UPDATE userfeeds 
    SET title = ?, content = ?, emoji = ?, image_url = ?
    WHERE id = ?
  `;

  db.query(sql, [title, content, emoji, image_url, id], (err, result) => {
    if (err) {
      console.error("Update error:", err.sqlMessage);
      return res.status(500).json({ success: false, message: "DB update failed" });
    }
    res.json({ success: true });
  });
});

// Delete feed
app.delete('/delete-feed/:id', (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM userfeeds WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete error:", err.sqlMessage);
      return res.status(500).json({ success: false, message: "DB delete failed" });
    }
    res.json({ success: true });
  });
});



// GET emojis & dates from userfeeds
app.get('/api/userfeeds', (req, res) => {
  const sql = `
    SELECT emoji, created_at
    FROM userfeeds
    WHERE emoji IS NOT NULL
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send("DB error");
    res.json(results); // array of { emoji, created_at }
  });
});


app.post('/api/userfeeds', (req, res) => {
  const { user_id, emoji, date } = req.body;
  const query = 'INSERT INTO userfeeds (user_id, emoji, created_at) VALUES (?, ?, ?)';
  db.query(query, [user_id, emoji, date], (err, result) => {
    if (err) {
      console.error("Insert error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: result.insertId });
  });
});




//google authentication part
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID"); // Replace with your actual client ID

app.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "YOUR_GOOGLE_CLIENT_ID", // Replace this too
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if user exists in MySQL by email
    const findQuery = 'SELECT * FROM userslist WHERE email = ?';
    db.query(findQuery, [email], (findErr, results) => {
      if (findErr) {
        console.error('❌ DB error (Google login find):', findErr.message);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (results.length > 0) {
        // ✅ Existing user, login successful
        return res.status(200).json({ success: true, userId: results[0].id, name: results[0].name });
      } else {
        // 👤 New user → Register with Google info
        const insertQuery = 'INSERT INTO userslist (name, email, google_id) VALUES (?, ?, ?)';
        db.query(insertQuery, [name, email, googleId], (insertErr, insertResult) => {
          if (insertErr) {
            console.error('❌ DB error (Google login insert):', insertErr.message);
            return res.status(500).json({ success: false, message: "Database error" });
          }

          return res.status(200).json({ success: true, userId: insertResult.insertId, name });
        });
      }
    });
  } catch (err) {
    console.error("❌ Google token verification failed:", err.message);
    return res.status(401).json({ success: false, message: "Invalid Google token" });
  }
});


const port=process.env.PORT || 3000;

// 🌐 Start Server
app.listen(port, () => {
  console.log("🚀 Server started on port:",port);
});
