const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());  // To parse JSON request bodies

// Middleware to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Your MySQL username
  password: '',  // Your MySQL password
  database: 'pawmatch'  // Your database name
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// API to filter pets
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
      console.error('Error fetching filtered pets:', err);
      return res.status(500).send('Error fetching pets');
    }
    res.json(results);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
