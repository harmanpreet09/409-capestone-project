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
  origin: ['https://four09-capestone-project-u9y7.onrender.com'], // Include your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(
  session({
    secret: 'yourSecretKey', // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Set to true for HTTPS
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// MySQL connection pool setup
const dbConfig = {
  connectionLimit: 10,
  host: "62.72.28.154",
  user: "u619996120_demo_root",
  password: "$4MS7m0]!9u",
  database: "u619996120_pawmatch",
};

const pool = mysql.createPool(dbConfig);

// Helper function to query the database
function queryDatabase(sql, params, callback) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return callback(err, null);
    }
    connection.query(sql, params, (queryErr, results) => {
      connection.release();
      if (queryErr) {
        console.error('Database query error:', queryErr);
        return callback(queryErr, null);
      }
      callback(null, results);
    });
  });
}

// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ success: false, error: 'You must be logged in to access this resource' });
  }
}

// Route to filter pets based on criteria
app.post('/api/filterPets', (req, res) => {
  const { breed, size, age, location_id, type, sortBy = 'name', sortOrder = 'ASC' } = req.body;
  let sql = 'SELECT * FROM pets WHERE 1=1';
  const params = [];

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

  sql += ` ORDER BY ${sortBy} ${sortOrder}`;

  queryDatabase(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching pets:', err.message);
      return res.status(500).json({ error: `Error fetching pets: ${err.message}` });
    }
    res.json(Array.isArray(results) ? results : []);
  });
});

// Route to fetch locations
app.get('/api/locations', (req, res) => {
  const sql = 'SELECT * FROM locations';
  queryDatabase(sql, [], (err, results) => {
    if (err) {
      console.error('Error fetching locations:', err.message);
      return res.status(500).json({ error: `Error fetching locations: ${err.message}` });
    }
    res.json(Array.isArray(results) ? results : []);
  });
});

// Route to handle user signup
app.post('/api/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || password !== confirmPassword) {
    return res.status(400).json({ error: 'All fields are required and passwords must match' });
  }

  const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
  queryDatabase(checkEmailSql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error checking email' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    queryDatabase(sql, [username, email, hashedPassword], (insertErr) => {
      if (insertErr) {
        return res.status(500).json({ error: 'Error inserting user' });
      }
      res.status(200).json({ message: 'User registered successfully' });
    });
  });
});

// Route to handle user logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Route to handle user login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';

  queryDatabase(sql, [email], async (err, results) => {
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

// Route to check session
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(200).json({ loggedIn: false });
  }
});

// Cron job for updating adoption request statuses
cron.schedule('* * * * *', () => {
  console.log('Running status update job...');
  const updateToUnderProcessSql = `
    UPDATE adoption_requests 
    SET status = 'Under Process' 
    WHERE status = 'Pending' 
    AND created_at <= NOW() - INTERVAL 30 SECOND
  `;
  queryDatabase(updateToUnderProcessSql, [], (err, result) => {
    if (err) {
      console.error('Error updating status to Under Process:', err);
    } else {
      console.log(`Updated ${result.affectedRows} records to Under Process`);
    }
  });

  const updateToCompletedSql = `
    UPDATE adoption_requests 
    SET status = 'Completed' 
    WHERE status = 'Under Process' 
    AND created_at <= NOW() - INTERVAL 1 MINUTE
  `;
  queryDatabase(updateToCompletedSql, [], (err, result) => {
    if (err) {
      console.error('Error updating status to Completed:', err);
    } else {
      console.log(`Updated ${result.affectedRows} records to Completed`);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
