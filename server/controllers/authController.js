const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. UPDATED: Accept 'role' and add it to the token payload
const generateToken = (id, role) => {
  return jwt.sign(
    { 
      user: { 
        id, 
        role // <--- THIS WAS MISSING! Now the token carries the role.
      } 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (default role is 'user')
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user' 
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        // 2. UPDATED: Pass the role to the token generator
        token: generateToken(user.id, user.role), 
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        // 3. UPDATED: Pass the role to the token generator
        token: generateToken(user.id, user.role), 
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { register, login };