const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists!' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found!' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password!' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful study assistant. Answer clearly.' },
          { role: 'user', content: message }
        ]
      })
    });
    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));
    if(data.choices && data.choices[0]) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.json({ reply: 'Sorry I could not answer that!' });
    }
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: 'AI error!' });
  }
});

module.exports = router;