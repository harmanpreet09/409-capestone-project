import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cron from 'node-cron';

// Set up __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors({
  origin: 'https://four09-capestone-project-u9y7.onrender.com', // Replace with your frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(
  session({ 
    secret: 'yourSecretKey', // Use a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// MySQL connection pool setup
const dbConfig = {
  connectionLimit: 10, // Set a reasonable pool limit
  host: '62.72.28.154',
  user: 'u619996120_demo_root',
  password: '$4MS7m0]!9u',
  database: 'u619996120_pawmatch',
};

const pool = mysql.createPool(dbConfig);

// Helper function to query the database
const queryDatabase = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      connection.query(sql, params, (queryErr, results) => {
        connection.release();
        if (queryErr) {
          return reject(queryErr);
        }
        resolve(results);
      });
    });
  });
};

// Middleware to check if the user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ success: false, error: 'You must be logged in to access this resource' });
  }
};

// Endpoints

// API to check adoption status
app.post('/api/checkStatus', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  try {
    const statuses = await queryDatabase(
      'SELECT pet_name, status, created_at FROM adoption_requests WHERE contact_email = ?',
      [email]
    );

    if (statuses.length > 0) {
      res.status(200).json({ success: true, applications: statuses });
    } else {
      res.status(200).json({ success: true, applications: [] }); // No requests found
    }
  } catch (error) {
    console.error('Error fetching adoption status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch adoption status' });
  }
});


// Save form data in session
app.post('/api/saveFormData', (req, res) => {
  const { pet_name, user_name, contact_email, message } = req.body;

  if (!pet_name || !user_name || !contact_email || !message) {
    return res.status(400).json({ success: false, message: 'Form data is incomplete.' });
  }

  req.session.formData = { pet_name, user_name, contact_email, message };
  res.status(200).json({ success: true, message: 'Form data saved successfully!' });
});

// Get form data from session
app.get('/api/getFormData', (req, res) => {
  if (req.session.formData) {
    res.status(200).json({ success: true, formData: req.session.formData });
  } else {
    res.status(200).json({ success: false, message: 'No form data found.' });
  }
});

// Submit adoption form
app.post('/api/adoption', async (req, res) => {
  const { pet_name, user_name, contact_email, message } = req.body;

  if (!pet_name || !user_name || !contact_email) {
    return res.status(400).json({ success: false, error: 'Pet name, user name, and contact email are required' });
  }

  const sql = 'INSERT INTO adoption_requests (pet_name, user_name, contact_email, message, status) VALUES (?, ?, ?, ?, ?)';

  try {
    await queryDatabase(sql, [pet_name, user_name, contact_email, message, 'Pending']);
    req.session.formData = null; // Clear form data after submission
    res.status(200).json({ success: true, message: 'Adoption request submitted successfully!' });
  } catch (error) {
    console.error('Error submitting adoption request:', error);
    res.status(500).json({ success: false, error: 'Failed to submit adoption request' });
  }
});

// Check user session
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(200).json({ loggedIn: false });
  }
});

// Fetch locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await queryDatabase('SELECT id, name FROM locations');
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Filter pets
app.post('/api/filterPets', async (req, res) => {
  const { breed, size, age, location_id, type, sortBy = 'name', sortOrder = 'ASC' } = req.body;

  let sql = `
    SELECT pets.*
    FROM pets
    LEFT JOIN adoption_requests ON pets.id = adoption_requests.pet_id
    WHERE (adoption_requests.status != 'Completed' OR adoption_requests.status IS NULL)
  `;
  const params = [];

  if (type) {
    sql += ' AND pets.type = ?';
    params.push(type);
  }
  if (breed) {
    sql += ' AND pets.breed = ?';
    params.push(breed);
  }
  if (size) {
    sql += ' AND pets.size = ?';
    params.push(size);
  }
  if (age) {
    sql += ' AND pets.age = ?';
    params.push(age);
  }
  if (location_id) {
    sql += ' AND pets.location_id = ?';
    params.push(location_id);
  }

  sql += ` ORDER BY pets.${sortBy} ${sortOrder}`;

  try {
    const pets = await queryDatabase(sql, params);
    res.json(pets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ error: 'Error fetching pets' });
  }
});

// Cron job for updating statuses
cron.schedule('* * * * *', async () => {
  console.log('Running status update job...');
  
  try {
    // Update 'Pending' requests to 'Under Process'
    const updateToUnderProcessSql = `
      UPDATE adoption_requests 
      SET status = 'Under Process' 
      WHERE status = 'Pending' 
      AND created_at <= NOW() - INTERVAL 30 SECOND
    `;
    const underProcessResult = await queryDatabase(updateToUnderProcessSql);
    console.log(`Updated to 'Under Process': ${underProcessResult.affectedRows || 0} records`);

    // Update 'Under Process' requests to 'Completed'
    const updateToCompletedSql = `
      UPDATE adoption_requests 
      SET status = 'Completed' 
      WHERE status = 'Under Process' 
      AND created_at <= NOW() - INTERVAL 1 MINUTE
    `;
    const completedResult = await queryDatabase(updateToCompletedSql);
    console.log(`Updated to 'Completed': ${completedResult.affectedRows || 0} records`);
  } catch (error) {
    console.error('Error during cron job:', error);
  }
});




app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await queryDatabase('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    res.status(200).json({ success: true, message: 'Signup successful!' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ success: false, error: 'Failed to sign up' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const users = await queryDatabase('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    req.session.user = { id: user.id, username: user.username, email: user.email };
    res.status(200).json({ success: true, message: 'Login successful!', user: req.session.user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Failed to log in' });
  }
});

// User logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ success: false, error: 'Failed to log out' });
    }
    res.status(200).json({ success: true, message: 'Logout successful!' });
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
