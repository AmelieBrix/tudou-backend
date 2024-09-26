const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Post = require('../models/Post.model');  
const { isAuthenticated } = require('../middleware/jwt.middleware');  
const Comment = require('../models/Comment.model')


// Create a new post 
router.post('/createpost', isAuthenticated,  (req, res) => {
    console.log("Payload:", req.payload);  

    if (!req.payload || !req.payload._id) {
      return res.status(401).json({ message: 'Unauthorized: No user ID found in token' });
    }
  
  const { title, content, category, imageUrl } = req.body;
  console.log("HOLA");
  const newPost = new Post({
    title,
    content,
    category,
    imageUrl,
    author: req.payload._id,  
  });

  newPost
    .save()
    .then(savedPost => res.status(201).json(savedPost))
    .catch(err => res.status(500).json({ message: 'Failed to create post', error: err.message }));
});
/*
router.get('/', (req, res) => {
  Post.find()
    .populate('author', 'username profilePicture')
    .then(posts => res.json(posts))
    .catch(err => res.status(500).json({ message: 'Failed to retrieve posts', error: err.message }));
});
*/
/*router.get('/', (req, res) => {
    // Extract query parameters from req.query
    const filter = { ...req.query };  // This will dynamically copy all query parameters into the filter
  
    Post.find(filter)  // Use the filter object to query the database
      .populate('author', 'username profilePicture')  // Populate author details
      .then(posts => res.json(posts))  // Return the filtered or full list of posts
      .catch(err => res.status(500).json({ message: 'Failed to retrieve posts', error: err.message }));
  });
  */

  router.get('/', (req, res) => {
    const category = req.query.category;
  
    Post.find({ category })
      .populate('author', 'username profilePicture')  
      .then(posts => {
        if (!posts.length) {
          return res.status(404).json({ message: 'No posts found' });
        }
        res.json(posts);
      })
      .catch(err => res.status(500).json({ message: 'Failed to fetch posts', error: err.message }));
  });

/*
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .populate('author', 'username profilePicture')
    .then(post => {
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json(post);
    })
    .catch(err => res.status(500).json({ message: 'Failed to retrieve post', error: err.message }));
});
*/

router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .populate('author', 'username profilePicture')  // Populate the post author
    .populate({
      path: 'comments',
      populate: {
        path: 'user',  
        select: 'username profilePicture',  // Select only necessary fields from the user
      }
    })
    .then(post => {
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json(post); 
    })
    .catch(err => res.status(500).json({ message: 'Failed to retrieve post', error: err.message }));
});

router.put('/edit/:id', isAuthenticated, (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
        console.log(post)
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.author.toString() !== req.payload._id) {
        return res.status(403).json({ message: 'You are not authorized to edit this post' });
      }
     
      const { title, content, category, imageUrl } = req.body;
      post.title = title;
      post.content = content;
      post.category = category;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then(updatedPost => res.json(updatedPost))
    .catch(err => res.status(500).json({ message: 'Failed to update post', error: err.message }));
});

// Delete a post )
router.delete('/delete/:id', isAuthenticated, (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Check if the user deleting the post is the author
      if (post.author.toString() !== req.payload._id) {
        return res.status(403).json({ message: 'You are not authorized to delete this post' });
      }

      return post.deleteOne();
    })
    .then(() => res.json({ message: 'Post deleted successfully' }))
    .catch(err => res.status(500).json({ message: 'Failed to delete post', error: err.message }));
});

router.post('/:id/createComments', isAuthenticated, (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  const userId = req.payload._id;

  // Check if postId is a valid MongoDB ObjectId
  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ message: 'Invalid post ID format' });
  }

  const newComment = new Comment({
    content,
    user: userId,
    post: postId, 
  });

  newComment
    .save()
    .then(savedComment => {
      return Post.findByIdAndUpdate(
        postId,
        { $push: { comments: savedComment._id } }, // Add the comment to the post's comments array
        { new: true }  // Return the updated post
      ).then(() => savedComment);  // Return the saved comment after updating the post
    })
    .then(savedComment => savedComment.populate('user', 'username profilePicture'))
    .then(() => {
      res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    })
    .catch(error => {
      res.status(500).json({ message: 'Error adding comment', error: error.message });
    });
});

router.get('/:id/comments', (req, res) => {
  const postId = req.params.id;  

  // Find the post by ID and populate the comments
  Post.findById(postId)
    .populate({
      path: 'comments',
      populate: {
        path: 'user',  // Populate the user information for each comment
        select: 'username profilePicture',  // Select only necessary fields from the user
      }
    })
    .then(post => {
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Return the comments for the post
      res.json(post.comments);
    })
    .catch(err => {
      res.status(500).json({ message: 'Failed to retrieve comments', error: err.message });
    });
});

// Delete a comment
router.delete('/comments/:commentId', isAuthenticated, (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.payload._id;

  Comment.findById(commentId)
    .populate('user')
    .then(comment => {
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (comment.user._id.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this comment' });
      }

      return Comment.findByIdAndDelete(commentId).then(() => {
        return Post.findByIdAndUpdate(comment.post, { $pull: { comments: commentId } });
      });
    })
    .then(() => {
      res.json({ message: 'Comment deleted successfully' });
    })
    .catch(error => {
      res.status(500).json({ message: 'Error deleting comment', error: error.message });
    });
});

router.post('/:id/like', isAuthenticated, (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }
  
        // Check if user already liked the post
        if (post.likes.includes(req.payload._id)) {
          return res.status(400).json({ message: 'You already liked this post' });
        }
  
        // Add user's ID to the likes array
        post.likes.push(req.payload._id);
  
        return post.save();
      })
      .then(updatedPost => res.json(updatedPost))
      .catch(err => res.status(500).json({ message: 'Failed to like post', error: err.message }));
  });
  
  // Unlike a post
  router.post('/:id/unlike', isAuthenticated, (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }
  
        // checkiing if user already liked the post
        if (!post.likes.includes(req.payload._id)) {
          return res.status(400).json({ message: 'You havent liked this post yet' });
        }
  
        // Remove user's ID from the likes array
        post.likes = post.likes.filter(like => like.toString() !== req.payload._id);
  
        return post.save();
      })
      .then(updatedPost => res.json(updatedPost))
      .catch(err => res.status(500).json({ message: 'Failed to unlike post', error: err.message }));
  });


module.exports = router;
