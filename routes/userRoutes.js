// get userprofile
// edit userprofile

// delete userprofile

const express = require('express');
const router = express.Router();
const User = require('../models/User.model');  
const { isAuthenticated } = require('../middleware/jwt.middleware');  // Assuming you have this middleware

router.get('/:username', isAuthenticated, (req, res) => {
  // Use the username from the URL parameters to find the user
  User.findOne({ username: req.params.username }) 
    .select('-password')  // without the password !!
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);  
    })
    .catch(err => res.status(500).json({ message: 'Error fetching profile', error: err.message }));
});

router.put('/:username/edit', isAuthenticated, (req, res) => {
    console.log("this is the params and the payload")
    console.log(req.params.username, req.payload.username)
    if (req.params.username !== req.payload.username) {
      return res.status(403).json({ message: 'You are not authorized to edit this profile' });
    }
    console.log("this is the req.body")
    console.log(req.body)
    const { first_Name, last_Name, email, username } = req.body;
  
    User.findOne({username: req.params.username})
      .then(user => {
        console.log("please I AM THE USER THAS WAS FOUND")
        console.log(user)
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        // Update profile fields
        user.first_Name = first_Name || user.first_Name;
        user.last_Name = last_Name || user.last_Name;
        user.email = email || user.email;
        user.username = username || user.username;
        console.log("i passed the update part of the code!!")
        return user.save();
      })
      .then(updatedUser => res.json({ message: 'Profile updated successfully', updatedUser }))
      .catch(err => res.status(500).json({ message: 'Failed to update profile', error: err.message }));
  });
  
  
router.delete('/delete/:id', isAuthenticated, (req, res) => {
    if (req.params.id !== req.payload._id) {
      return res.status(403).json({ message: 'You are not authorized to delete this profile' });
    }
  
    User.findByIdAndDelete(req.params.id)
      .then(deletedUser => {
        if (!deletedUser) {
          return res.status(404).json({ message: 'User not found' });
        }  
        res.json({ message: 'User profile deleted successfully' });
      })
      .catch(err => res.status(500).json({ message: 'Failed to delete profile', error: err.message }));
  });
  

  module.exports = router;
