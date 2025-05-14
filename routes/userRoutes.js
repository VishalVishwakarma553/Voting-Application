const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

const existadmin = async() => {
  const adminData = await User.findOne({role: "admin"})
  if(adminData){
    return adminData.role
  }else{
    return "voter"
  }
}
//route to add a new user
router.route("/signup").post(async (req, res) => {
  try {
    if((await existadmin()) === (req.body.role)){
      return res.status(403).json({message: 'multiple admins are not allowed'})
    }
    const data = req.body;
    console.log(data)
    const newUser = new User(data);
    const response = await newUser.save();
    const payload = {
      id: response.id,
    };
    const token = generateToken(payload);
    res.status(200).json({ response, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
//route to login user
router.post("/login", async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    if (!user || !(await user.comparePassword(password))) {
      res.status(404).json({ error: "Invalid username or password" });
    }

    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);
    res.status(200).json({ user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//Profile Route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//Update the user password
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password Updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
