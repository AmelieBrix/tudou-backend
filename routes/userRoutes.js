const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const { isAuthenticated } = require('../middleware/jwt.middleware');  // Assuming you have this middleware
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fileUploader = require('../config/cloudinary.config'); // Cloudinary config
const profilePictureUrl = 'https://res.cloudinary.com/dfrhg0iqs/image/upload/v1727612051/defaultImage_qicau9.jpg';



router.get('/:userId', isAuthenticated, (req, res) => {
  // Use the username from the URL parameters to find the user
  User.findById(req.params.userId)
    .select('-password')  // without the password !!
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (!user.profilePicture) {
        user.profilePicture = profilePictureUrl;
      }

      res.json(user);
    })
    .catch(err => res.status(500).json({ message: 'Error fetching profile', error: err.message }));
});

router.put('/:userId/edit', isAuthenticated, fileUploader.single('profilePicture'), (req, res) => {
  const { first_Name, last_Name, email, username, currentPassword, newPassword } = req.body;
  console.log("checking body:", req.body);
  console.log("User payload from token:", req.payload);

  if (req.params.userId !== req.payload._id) {
    return res.status(403).json({ message: 'You are not authorized to edit this profile' });
  }

  User.findById(req.params.userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // If the user wants to change the password, verify the current password
      if (newPassword && currentPassword) {
        const passwordCorrect = bcrypt.compareSync(currentPassword, user.passwordHash);
        if (!passwordCorrect) {
          return res.status(403).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password if the current password is correct
        return bcrypt.hash(newPassword, 10).then(hashedPassword => {
          user.passwordHash = hashedPassword;
          return updateUserFields(user, req.body);
        }) .catch(err => {
          console.error("Error hashing the new password:", err);
          return res.status(500).json({ message: 'Error hashing the new password', error: err.message });
        });
      } else {
        return updateUserFields(user, req.body);  // Update other fields if password is not changed
      }
    })
    .then(updatedUser => {
      // Check if a new profile picture was uploaded, else use the default one if not set
      if (req.file) {
        updatedUser.profilePicture = req.file.path; // Use Cloudinary URL from req.file.path
      } else if (!updatedUser.profilePicture) {
        updatedUser.profilePicture = defaultProfilePicture; // Use default profile picture
      }

      return updatedUser.save();
    })
    .then(updatedUser => {
      const payload = { _id: updatedUser._id, email: updatedUser.email, username: updatedUser.username };
      const authToken = jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '2h' });

      res.json({ message: 'Profile updated successfully', updatedUser, authToken });
    })
    .catch(err => res.status(500).json({ message: 'Failed to update profile', error: err.message }));

  // Helper function to update profile fields
  function updateUserFields(user, updatedFields) {
    console.log("this is the user");
    console.log(user);
    console.log("this is the data.body => updatedFields");
    console.log(updatedFields);
    // Only update fields that are present in the request body
    if (typeof updatedFields.first_Name !== 'undefined') {
      user.first_Name = updatedFields.first_Name;
    }
    if (typeof updatedFields.last_Name !== 'undefined') {
      user.last_Name = updatedFields.last_Name;
    }
    if (typeof updatedFields.email !== 'undefined') {
      user.email = updatedFields.email;
    }
    if (typeof updatedFields.username !== 'undefined') {
      user.username = updatedFields.username;
    }
    console.log("new User is =>");
    console.log(user);
    // Save the updated user to the database
    return user.save();
  }
});


router.delete('/:userId/delete', isAuthenticated, (req, res) => {
  if (req.params.userId !== req.payload._id) {
    return res.status(403).json({ message: 'You are not authorized to delete this profile' });
  }

  User.findByIdAndDelete( req.params.userId)
    .then(deletedUser => {
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User profile deleted successfully' });
    })
    .catch(err => res.status(500).json({ message: 'Failed to delete profile', error: err.message }));
});


module.exports = router;
