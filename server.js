const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt'); // For hashing passwords
const session = require('express-session'); // For session handling

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // To handle URL-encoded form data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Configure session middleware
app.use(session({
  secret: 'yourSecretKey', // Use a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure to true if using HTTPS
}));

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pawmatch'
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API route to filter pets
app.post('/api/filterPets', (req, res) => {
  const { breed, size, age } = req.body;
  let sql = "SELECT * FROM pets WHERE 1=1";
  const params = [];

  if (breed) {
    sql += " AND breed = ?";
    params.push(breed);
  }
  if (size) {
    sql += " AND size = ?";
    params.push(size);
  }
  if (age) {
    sql += " AND age = ?";
    params.push(age);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching pets' });
    }
    res.json(results);
  });
});

// API route for user signup
app.post('/api/signup', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || password !== confirmPassword) {
    return res.status(400).json({ error: 'All fields are required and passwords must match' });
  }

  // Check if email already exists
  const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error checking email' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Insert user into the database with plain text password (not recommended, use bcrypt)
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, password], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error inserting user' });
      }
      res.status(200).json({ message: 'User registered successfully' });
    });
  });
});

// API route for user login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching user' });
    }

    if (results.length > 0) {
      const user = results[0];

      // Compare the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // Store user info in session
        req.session.user = { id: user.id, username: user.username, email: user.email };
        return res.status(200).json({ message: 'Login successful', user: req.session.user });
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// API route to check if a user is logged in (used to show user details in the navbar)
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    return res.status(200).json({ loggedIn: false });
  }
});

// API route for logging out
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});
// API route for adoption form submission
app.post('/api/adoption', (req, res) => {
  const { petName, userName, contactEmail, message } = req.body;

  // Basic validation
  if (!petName || !userName || !contactEmail || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  // Insert adoption request into the database (example table: adoption_requests)
  const sql = 'INSERT INTO adoption_requests (pet_name, user_name, contact_email, message, status) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [petName, userName, contactEmail, message, 'Submitted'], (err, result) => {
    if (err) {
      console.error('Error inserting adoption request:', err);
      return res.status(500).json({ success: false, error: 'Failed to submit the form' });
    }
    res.status(200).json({ success: true, message: 'Adoption request submitted successfully!' });
  });
});

// Start the server
app.listen(4000, () => {
  console.log('Server running on port 4000');
});
