import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cron from 'node-cron';

// Manually set up __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(
  session({
    secret: 'yourSecretKey', // Use a strong secret key
    resave: false,
    saveUninitialized: false, // Don't save uninitialized sessions
    cookie: { secure: false }, // Set secure to true if using HTTPS
  })
);

// MySQL connection setup
const db = mysql.createConnection({
  host: "62.72.28.154",
  user: "u619996120_demo_root",
  password: "$4MS7m0]!9u",
  database: "u619996120_pawmatch",
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

cron.schedule('* * * * *', () => {
  console.log('Running status update job...');

  // Move "Pending" to "Under Process" after 30 seconds
  const updateToUnderProcessSql = `
    UPDATE adoption_requests 
    SET status = 'Under Process' 
    WHERE status = 'Pending' 
    AND created_at <= NOW() - INTERVAL 30 SECOND
  `;
  db.query(updateToUnderProcessSql, (err, result) => {
    if (err) {
      console.error('Error updating status to Under Process:', err);
    } else {
      console.log(`Updated ${result.affectedRows} records to Under Process`);
    }
  });

  // Move "Under Process" to "Completed" after 1 minute
  const updateToCompletedSql = `
    UPDATE adoption_requests 
    SET status = 'Completed' 
    WHERE status = 'Under Process' 
    AND created_at <= NOW() - INTERVAL 1 MINUTE
  `;
  db.query(updateToCompletedSql, (err, result) => {
    if (err) {
      console.error('Error updating status to Completed:', err);
    } else {
      console.log(`Updated ${result.affectedRows} records to Completed`);
    }
  });
});

// Pexels API key and function to fetch images based on breed
const pexelsApiKey = 'QrZvUr5AdpJfXQSZqgD9BbHLNUbPlfAcfrvYdMKfcjQeHNBCfwGV2pXZ';

async function getPetImage(breed) {
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${breed}&per_page=1`, {
      headers: {
        Authorization: pexelsApiKey,
      },
    });

    if (!response.ok) {
      console.error('Error fetching image:', response.status, response.statusText);
      return '/images/default-pet-image.jpg'; // Return fallback image on error
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.medium; // Return the first image URL
    } else {
      console.warn('No photos found for breed:', breed);
      return '/images/default-pet-image.jpg'; // Return fallback image if no photos found
    }
  } catch (error) {
    console.error('Error fetching image from Pexels:', error);
    return '/images/default-pet-image.jpg'; // Return fallback image on error
  }
}

// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next(); // User is logged in, proceed to the next middleware/route
  } else {
    res.status(401).json({ success: false, error: 'You must be logged in to access this resource' });
  }
}

app.get('/api/locations', (req, res) => {
  const sql = 'SELECT id, name FROM locations';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching locations' });
    }
    res.json(results);
  });
});

// Define the /api/filterPets route
app.post('/api/filterPets', (req, res) => {
  const { breed, size, age, location_id, type, sortBy = 'name', sortOrder = 'ASC' } = req.body;
  let sql = 'SELECT * FROM pets WHERE 1=1'; // Base query
  const params = [];

  // Add conditions based on the received filters
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  if (breed) {
    sql += ' AND breed = ?';
    params.push(breed);
  }
  if (size) {
    sql += ' AND size = ?';
    params.push(size);
  }
  if (age) {
    sql += ' AND age = ?';
    params.push(age);
  }
  if (location_id) {
    sql += ' AND location_id = ?';
    params.push(location_id);
  }

  // Add sorting
  sql += ` ORDER BY ${sortBy} ${sortOrder}`;

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching pets' });
    }
    res.json(results);
  });
});



// API route for user signup
app.post('/api/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || password !== confirmPassword) {
    return res.status(400).json({ error: 'All fields are required and passwords must match' });
  }

  const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailSql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error checking email' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err) => {
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

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        req.session.user = { id: user.id, username: user.username, email: user.email };
        res.status(200).json({ message: 'Login successful', user: req.session.user });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// API route to check if a user is logged in
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(200).json({ loggedIn: false });
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

// POST route to handle adoption form submission
app.post('/api/adoption', (req, res) => {
  const { pet_name, user_name, contact_email, message } = req.body;

  console.log('Received request:', req.body); // Log request data for debugging

  if (!pet_name || !user_name || !contact_email) {
    return res.status(400).json({ success: false, error: 'Pet name, user name, and contact email are required' });
  }

  const sql = 'INSERT INTO adoption_requests (pet_name, user_name, contact_email, message, status) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [pet_name, user_name, contact_email, message, 'Pending'], (err) => {
    if (err) {
      console.error('Error submitting adoption request:', err);
      return res.status(500).json({ success: false, error: 'Failed to submit adoption request' });
    }
    res.status(200).json({ success: true, message: 'Adoption request submitted successfully!' });
  });
});

// API route to check application status
app.post('/api/checkStatus', isAuthenticated, (req, res) => {
  const email = req.session.user.email;

  const sql = 'SELECT pet_name, status, message FROM adoption_requests WHERE contact_email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Error fetching application status' });
    }
    res.status(200).json({ success: true, applications: results });
  });
});
app.post('/api/contact', (req, res) => {
  const { userName, userEmail, userMessage } = req.body;

  // Insert the contact form data into your database
  const sql = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';
  db.query(sql, [userName, userEmail, userMessage], (err, result) => {
    if (err) {
      console.error('Error saving contact form data:', err);
      return res.status(500).json({ success: false, message: 'Failed to submit form' });
    }
    res.json({ success: true, message: 'Form submitted successfully!' });
  });
});

// Start the server
app.listen(4000, () => {
  console.log('Server running on port 4000');
});
