const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  listDocuments,
  deleteDocument,
  reindexDocument
} = require("../controllers/documentController");

router.get("/documents", auth, role(["ADMIN"]), listDocuments);
router.delete("/documents/:id", auth, role(["ADMIN"]), deleteDocument);
router.post("/documents/:id/reindex", auth, role(["ADMIN"]), reindexDocument);

module.exports = router;
