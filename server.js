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

// CORS configuration
const allowedOrigins = [
  'https://four09-capestone-project-u9y7.onrender.com', // Live domain
  'http://localhost:4000', // Local development
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Handle preflight `OPTIONS` requests
app.options('*', cors());

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(
  session({
    secret: 'yourSecureSecretKey', // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Secure cookies in production
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// MySQL connection pool setup
const dbConfig = {
  connectionLimit: 10,
  host: '62.72.28.154',
  user: 'u619996120_demo_root',
  password: '$4MS7m0]!9u',
  database: 'u619996120_pawmatch',
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

// API endpoints
app.get('/api/locations', (req, res) => {
  const sql = 'SELECT id, name FROM locations';
  queryDatabase(sql, [], (err, results) => {
    if (err) {
      console.error('Error fetching locations:', err);
      return res.status(500).json({ error: 'Failed to fetch locations' });
    }
    res.json(results);
  });
});

app.post('/api/filterPets', (req, res) => {
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
  console.log('Executing SQL:', sql, 'with params:', params);

  queryDatabase(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching pets:', err);
      return res.status(500).json({ error: 'Error fetching pets' });
    }
    res.json(Array.isArray(results) ? results : []);
  });
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

// Check user session
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(200).json({ loggedIn: false });
  }
});

// Cron job for updating adoption statuses
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

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
