import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcrypt'; // For hashing passwords
import session from 'express-session'; // For session handling
import fetch from 'node-fetch'; // To use fetch with Node.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
app.use(session({
  secret: 'yourSecretKey', // Use a strong secret key
  resave: false,
  saveUninitialized: false, // Don't save uninitialized sessions
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

// Pexels API key and function to fetch images based on breed
const pexelsApiKey = 'QrZvUr5AdpJfXQSZqgD9BbHLNUbPlfAcfrvYdMKfcjQeHNBCfwGV2pXZ';

async function getPetImage(breed) {
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${breed}&per_page=1`, {
      headers: {
        Authorization: pexelsApiKey
      }
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
    res.status(401).json({ success: false, error: 'You must be logged in to submit an adoption request' });
  }
}

// API route to filter pets
app.post('/api/filterPets', (req, res) => {
  const { breed, size, age, sortBy = 'name', sortOrder = 'ASC' } = req.body;
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

  sql += ` ORDER BY ${sortBy} ${sortOrder}`;

  db.query(sql, params, async (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching pets' });
    }

    // Fetch images from Pexels if not present in the database
    for (let pet of results) {
      if (!pet.image || pet.image === '') {
        pet.image = await getPetImage(pet.breed);

        // Optionally update the database with the new image URL
        const updateSql = "UPDATE pets SET image = ? WHERE id = ?";
        db.query(updateSql, [pet.image, pet.id], (updateErr) => {
          if (updateErr) console.error('Error updating pet image:', updateErr);
        });
      }
    }

    res.json(results);
  });
});

// API route for user signup
app.post('/api/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || password !== confirmPassword) {
    res.status(400).json({ error: 'All fields are required and passwords must match' });
    return;
  }

  const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailSql, [email], async (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error checking email' });
      return;
    }

    if (results.length > 0) {
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err) => {
      if (err) {
        res.status(500).json({ error: 'Error inserting user' });
        return;
      }
      res.status(200).json({ message: 'User registered successfully' });
    });
  });
});

// API route for user login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching user' });
      return;
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
      res.status(500).json({ error: 'Failed to logout' });
      return;
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Apply the isAuthenticated middleware to the adoption route
app.post('/api/adoption', isAuthenticated, (req, res) => {
  const { petName, userName, contactEmail, message } = req.body;

  if (!petName || !userName || !contactEmail || !message) {
    res.status(400).json({ success: false, error: 'All fields are required' });
    return;
  }

  const sql = 'INSERT INTO adoption_requests (pet_name, user_name, contact_email, message, status) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [petName, userName, contactEmail, message, 'Submitted'], (err) => {
    if (err) {
      console.error('Error inserting adoption request:', err);
      res.status(500).json({ success: false, error: 'Failed to submit the form' });
      return;
    }
    res.status(200).json({ success: true, message: 'Adoption request submitted successfully!' });
  });
});

// Start the server
app.listen(4000, () => {
  console.log('Server running on port 4000');
});
