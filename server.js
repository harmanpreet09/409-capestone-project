const express = require('express');
const mysql = require('mysql');
const app = express();

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pawmatch'
});

// Middleware to parse JSON request bodies
app.use(express.json());

// API route to filter pets
app.post('/api/filterPets', (req, res) => {
  const { breed, size, age } = req.body;

  let sql = "SELECT * FROM pets WHERE 1=1";
  let queryParams = [];

  if (breed) {
    sql += " AND breed = ?";
    queryParams.push(breed);
  }
  if (size) {
    sql += " AND size = ?";
    queryParams.push(size);
  }
  if (age) {
    sql += " AND age = ?";
    queryParams.push(age);
  }

  db.query(sql, queryParams, (err, result) => {
    if (err) {
      return res.status(500).send('Error occurred');
    }
    res.json(result);
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
