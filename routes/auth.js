const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// Signup
router.post('/signup', async (req, res) => {
  console.log('Signup request received:', req.body);
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        if (row.email === email) {
          return res.status(400).json({ error: 'Email is already in use' });
        } else {
          return res.status(400).json({ error: 'Username is already in use' });
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Create user
      const id = uuidv4();
      db.run('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)', [id, username, email, password_hash], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'User created successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Signin
router.post('/signin', async (req, res) => {
  console.log('Signin request received:', req.body);
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, userId: user.id });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;