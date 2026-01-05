const router = require("express").Router();

const {
  registerCompany,
  login,
  inviteEmployee,
  verifyInvite,
  acceptInvite
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");


router.post("/register-company", registerCompany);


router.post("/login", login);

// Invite employee (ADMIN only)
router.post(
  "/invite",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  inviteEmployee
);

// Verify invite token (public)
router.get("/invite/:token", verifyInvite);

// Accept invite (public)
router.post("/accept-invite", acceptInvite);

module.exports = router;
