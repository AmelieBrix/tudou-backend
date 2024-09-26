const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require('../models/User.model');

const {isAuthenticated} = require('../middleware/jwt.middleware')
const router= express.Router();

router.post('/signup', async (req, res) => {
  const {first_Name, last_Name, username, email, password} = req.body;

  console.log(req.body);

  if (email === '' || password === '' || username === '') {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Provide a valid email address.' });
    return;
  } 

const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
    return;
  } 

  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }
     
    // then hash the password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    console.log(passwordHash);

    return User.create({ email, passwordHash: passwordHash, username, first_Name,last_Name });
    })
    .then((createdUser) => {
    
      const { email, username, first_Name,last_Name, _id } = createdUser;

      const user = { email, username, first_Name,last_Name, _id };

      res.status(201).json({ user: user });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" })
    });
});

router.post('/login', (req, res, next) => {
    const { email, password } = req.body; // here maybe?
    console.log(req.body);

    if (email === '' || password === '') {
        res.status(400).json({ message: "Provide email and password." });
        return;
      }

      User.findOne({ email })
    .then((foundUser) => {
    console.log(foundUser);
      if (!foundUser) {
        res.status(401).json({ message: "User not found." })
        return;
      }

      const passwordCorrect = bcrypt.compareSync(password, foundUser.passwordHash);
      console.log(passwordCorrect);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, username } = foundUser;
        console.log('this is the username', username)
        
        // Create an object that will be set as the token payload
        const payload = { _id, email, username };
 
        const authToken = jwt.sign( 
          payload,
          process.env.JWT_SECRET,
          { algorithm: 'HS256', expiresIn: "2h" }
        );
 
        res.status(200).json({ authToken: authToken });
      }
      else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
 
    })
    .catch(err => res.status(500).json({ message: "Internal Server Error" }));
});

router.get('/verify', isAuthenticated, (req, res, next) => {   
 
// If JWT token is valid the payload gets decoded by the
// isAuthenticated middleware and made available on `req.payload`
    console.log(`req.payload`, req.payload);
   
// Send back the object with user data
// previously set as the token payload
    res.status(200).json(req.payload);
  });

router.post('/logout', isAuthenticated, (req, res, next) => {
  // You can simply send a success response, as logging out is handled client-side
  res.status(200).json({ message: "Logout successful" });
});

module.exports = router;

