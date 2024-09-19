const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
// test comment
const postSchema = new Schema({
    category: {
      type: String,
      trim: true,
      required: true,
      enum: ['gallery', 'searchandfind', 'recommendation'], // 'searchandfind' should be a single string
    },
  
    title: {
      type: String,
      required: true,
    },
  
    content: {
      type: String,
      required: true,
    },
  
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment', // Corrected the ref to 'Comment' and cleaned the syntax
      },
    ],
  
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  
    tags: [
      {
        type: String,
      },
    ],
  
    status: {
      type: String,
      default: 'active', // This is for Search & Find
    },
  
    imageUrl: {
      type: String,
    },
    
  }, { timestamps: true }); // Enabled timestamps for createdAt and updatedAt


const Post = model("Post", postSchema);

module.exports = Post;