const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

exports.register = async (req, res) => {
  try {
    const Data = req.body;

    // Basic validation
    if (!Data.name || !Data.email || !Data.password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: Data.email});
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const userData = new User(Data)
    const response = await userData.save()


     const payLoad = {
        id : response._id, role : response.role
    }
    
    const token = jwt.sign(payLoad, process.env.JWT_SECRET, {expiresIn : "1d"})

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: response._id,
        name: response.name,
        email: response.email
      }
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const loginData = req.body;

    // Validation
    if (!loginData.email || !loginData.password) {
      return res.status(400).json({ error: "Email & password required" });
    }

    const user = await User.findOne({ email: loginData.email}).select("+password");

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(loginData.password, user.password); // compare passsword 

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

     const payLoad = {
        id : user._id , role: user.role
    }
    
    const token = jwt.sign(payLoad, process.env.JWT_SECRET, {expiresIn : "1d"})

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
