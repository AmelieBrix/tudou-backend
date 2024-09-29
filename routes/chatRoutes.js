const router = require("express").Router();
const Conversation = require('../models/Conversation.model')
const Message = require('../models/Message.model')

// this route returns the converstaion id between two participants if it already exists
// or create a new converstaion, when users chat for the first time
router.post('/chat', (req, res, next) => {
    //The user will send an array of participant ids in the chat (usually just two)
    // eg. participants = ['609b63324f3c1632c8ff35f4', '609b63644f3c1632c8ff35f5']
    const {participants} = req.body
    Conversation.findOne({ participants: { $all: participants} }) // $all? lookup!
      .then((foundParticipants) => {
        if (foundParticipants) {
          //Conversation between those participants already exists
          res.status(200).json(foundParticipants)
        }
        else { //foundParticipants have not ever  been together in a conversation i.e. its false, then a new one is created. 
          //Create a conversation between them if not present
          Conversation.create({participants})
            .then((response) => {
              res.status(200).json(response)
            })
        }
      })
      .catch((err) => {
          next(err)       
      })
})

// A route to get all messages of a certain converstaion 
router.get('/messages/:chatId', (req, res, next) => {
  const {chatId} = req.params
  Message.find({chatId})
    .populate('sender')
    .then((messages) => {
      res.status(200).json(messages)
    })
    .catch((err) => {
      next(err)       
  })
})

module.exports = router;