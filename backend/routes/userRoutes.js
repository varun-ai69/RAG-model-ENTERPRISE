const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const {
    listUsers,
    disableUser,
    enableUser,
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/userController");

// Profile routes (authenticated users)
router.get("/me", auth, getProfile);
router.patch("/me", auth, updateProfile);
router.post("/change-password", auth, changePassword);

// User management routes (admin only)
router.get("/users", auth, role(["ADMIN"]), listUsers);
router.patch("/users/:id/disable", auth, role(["ADMIN"]), disableUser);
router.patch("/users/:id/enable", auth, role(["ADMIN"]), enableUser);

module.exports = router;
