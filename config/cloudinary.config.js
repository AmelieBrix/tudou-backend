const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Multer configuration with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'your-project-folder', // Replace with the desired folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Define the allowed file formats
  },
});

const upload = multer({ storage });

module.exports = upload;