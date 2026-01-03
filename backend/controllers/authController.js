const User = require("../models/user");
const Company = require("../models/company");
const Invite = require("../models/Invite");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const crypto = require("crypto");

//this function for registering the company and admin in database
exports.registerCompany = async (req, res) => {
  try {
    const data = req.body;

    if (!data.companyName || !data.name || !data.email || !data.password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const existingCompany = await Company.findOne({ name: data.companyName });
    if (existingCompany) {
      return res.status(409).json({ error: "Company already exists" });
    }


    const adminUser = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "ADMIN"
    });

    const company = await Company.create({
      name: data.companyName,
      createdBy: adminUser._id
    });

    adminUser.companyId = company._id;
    await adminUser.save();

    const payLoad = {
      userId: adminUser._id,
      companyId: company._id,
      role: adminUser.role
    }

    const token = jwt.sign(

      payLoad
      ,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Company registered successfully",
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        companyId: company._id
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


// this function for login of employee and admin 
exports.login = async (req, res) => {
  try {
    const loginData = req.body;

    if (!loginData.email || !loginData.password)
      return res.status(400).json({ error: "Email & password required" });


    const user = await User.findOne({ email: loginData.email }).select("+password");
    if (!user || !user.isActive)
      return res.status(401).json({ error: "Invalid credentials" });

    const company = await Company.findById(user.companyId);

    if (!company || !company.isActive) {
      return res.status(403).json({
        error: "Company is inactive"
      });
    }


    const isMatch = await bcrypt.compare(loginData.password, user.password);

    if (!isMatch)
      return res.status(401).json({ error: "Invalid credentials" });


    user.lastLoginAt = new Date();
    await user.save();

    const payLoad = {
      userId: user._id,
      companyId: user.companyId,
      role: user.role
    }

    const token = jwt.sign(

      payLoad
      ,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.inviteEmployee = async (req, res) => {
  try {
    const employeeData = req.body;
    const adminData = req.user; //protected route because only admin can access the route 


    if (!employeeData.email) {
      return res.status(400).json({ error: "Employee email required" });
    }

    const existingUser = await User.findOne({ email: employeeData.email, companyId: adminData.companyId });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists in company" });
    }

    // Generate secure one-time token - ye isliye taki token ke basis pai hi voh access kar sake hamara invite 
    const token = crypto.randomBytes(32).toString("hex");

    const existingInvite = await Invite.findOne({
      email: employeeData.email,
      companyId: adminData.companyId,
      status: "PENDING"
    });

    if (existingInvite) {
      return res.status(409).json({
        error: "Invite already sent"
      });
    }

    await Invite.create({
      email: employeeData.email,
      companyId: adminData.companyId,
      role: "EMPLOYEE",
      token: token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      invitedBy: adminData.userId
    });

    // TODO: send email using nodemailer
    // inviteLink = https://yourapp.com/invite/${token} - future approach

    res.status(201).json({
      message: "Invite sent successfully"
    });
  } catch (err) {
    console.error("Invite Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.verifyInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await Invite.findOne({
      token: token,
      status: "PENDING",
      expiresAt: { $gt: Date.now() }
    });

    if (!invite) {
      return res.status(400).json({
        error: "Invalid or expired invite"
      });
    }

    res.json({
      email: invite.email,

    });

  } catch (err) {
    console.error("Verify Invite Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



// now the real registering of the employee - the employee will click on link and from that link they can register succesfully 

exports.acceptInvite = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const invite = await Invite.findOne({ token: token, status: "PENDING", expiresAt: { $gt: Date.now() } });

    if (!invite || invite.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Invite is invalid or expired" });
    }

    const existingUser = await User.findOne({
      email: invite.email,
      companyId: invite.companyId
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Create employee user-here the employee succesfully registers 
    const user = await User.create({
      name: name,
      email: invite.email,
      password: password,
      role: invite.role,
      companyId: invite.companyId
    });

    invite.status = "ACCEPTED";
    await invite.save();

    const payload = {
      userId: user._id,
      companyId: user.companyId,
      role: user.role
    };

    const jwtToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });
  } catch (err) {
    console.error("Accept Invite Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


