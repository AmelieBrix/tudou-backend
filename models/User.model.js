const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    first_Name: {
      type: String,
      trim: true,
      required: true,
      unique: false
    },
    last_Name: {
      type: String,
      trim: true,
      required: true,
      unique: false
    },
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String,
      required: false,
      default: 'https://res.cloudinary.com/dfrhg0iqs/image/upload/v1727612051/defaultImage_qicau9.jpg'
      //default: '../public/images/default.jpg'
    }
  },
  { 
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;