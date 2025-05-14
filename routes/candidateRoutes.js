const express = require("express");
const Candidate = require("../models/candidate");
const { jwtAuthMiddleware } = require("../jwt");
const User = require("../models/user");
const router = express.Router();

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === "admin";
  } catch (err) {
    return false;
  }
};

router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "user has not admin role" });
    }
    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    res.status(200).json({ response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "user has not admin role" });
    }
    const candidateId = req.params.candidateId;
    const updatedcandidateData = req.body;
    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedcandidateData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/:candidateId', jwtAuthMiddleware, async(req, res) => {
    try{
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: "user has not admin role" });
        }
        const candidateId = req.params.candidateId
        const response = await Candidate.findByIdAndDelete(candidateId)
        if(!response){
            return res.status(404).json({error: "Candidate not found"})
        }
        res.status(200).json({message: 'candidate deleted'}, response)
    }catch(err){
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
})

//let's start voting
router.post('/vote/:candidateId', jwtAuthMiddleware, async(req, res) => {
    const candidateId = req.params.candidateId
    const userId = req.user.id
    try{
        const candidate = await Candidate.findById(candidateId)
        if(!candidate){
            return res.status(404).json({message: 'Candidate not found'})
        }
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: 'user not found'})
        }
        if(user.isVoted){
            return res.status(404).json({message: 'You have already voted'})
        }
        if(user.role == 'admin'){
            return res.status(403).json({message: 'admin is not allowed'})
        }
        //update user document
        user.isVoted = true
        await user.save()

        //update cadidate document
        candidate.votes.push({user: userId})
        candidate.voteCount++
        await candidate.save()

        res.status(200).json({message: 'vote recorded successfully'})
    }catch(err){
        console.log(err);
        res.status(500).json({ error: "Internal server error" }); 
    }
})

router.get('/vote/count', async(req, res) => {
    try{
        //Find all candidates and sort them by votecount in descending order
    const candidate = await Candidate.find().sort({voteCount: 'desc'})

    //Map the candidates to only return their name and votecount
    const voteRecord = candidate.map((data) => {
        return {
            party: data.party,
            count: data.voteCount
        }
    })
    return res.status(200).json(voteRecord)
    }catch(err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.get('/listCandidate', async(req, res) =>{
    try{
        const candidate = await Candidate.find()
        res.status(200).json(candidate)
    }catch(err){
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
})
module.exports = router;
