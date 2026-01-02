const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true
    },

    password: {
      type: String,
      required: true,
      select: false // never return password by default
    },

    role: {
      type: String,
      enum: ["ADMIN", "EMPLOYEE"],
      default: "EMPLOYEE"
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    lastLoginAt: {
      type: Date
    }
  },
  { timestamps: true }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

module.exports = mongoose.model("User", userSchema);
