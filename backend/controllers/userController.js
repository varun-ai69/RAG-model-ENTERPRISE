const User = require("../models/user");
const bcrypt = require("bcrypt");

// List all users in the company
exports.listUsers = async (req, res) => {
    try {
        const users = await User.find({ companyId: req.user.companyId });
        res.json(users);
    } catch (err) {
        console.error("LIST USERS ERROR:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// Disable a user
exports.disableUser = async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.params.id, companyId: req.user.companyId },
            { isActive: false }
        );
        res.json({ message: "User disabled" });
    } catch (err) {
        console.error("DISABLE USER ERROR:", err);
        res.status(500).json({ error: "Failed to disable user" });
    }
};

// Enable a user
exports.enableUser = async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.params.id, companyId: req.user.companyId },
            { isActive: true }
        );
        res.json({ message: "User enabled" });
    } catch (err) {
        console.error("ENABLE USER ERROR:", err);
        res.status(500).json({ error: "Failed to enable user" });
    }
};


// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (err) {
        console.error("GET PROFILE ERROR:", err);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};


// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Profile updated", user });
    } catch (err) {
        console.error("UPDATE PROFILE ERROR:", err);
        res.status(500).json({ error: "Failed to update profile" });
    }
};


// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: "New password must be at least 6 characters"
            });
        }

        // Fetch user with password
        const user = await User.findById(req.user.userId).select("+password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (err) {
        console.error("CHANGE PASSWORD ERROR:", err);
        res.status(500).json({ error: "Failed to change password" });
    }
};
