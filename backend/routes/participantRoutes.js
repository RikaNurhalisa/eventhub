const express = require("express");
const router = express.Router();

const participantController = require("../controllers/participantController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Protected route — harus login untuk mendaftar event
router.post("/", authenticate, participantController.createParticipant);

// Protected routes — hanya admin
router.get("/", authenticate, requireAdmin, participantController.getAllParticipants);
router.get("/my", authenticate, participantController.getMyRegistrations);
router.get("/event/:eventId", authenticate, requireAdmin, participantController.getByEventId);
router.get("/:id", authenticate, requireAdmin, participantController.getParticipantById);
router.put("/:id", authenticate, requireAdmin, participantController.updateParticipant);
router.patch("/:id/status", authenticate, requireAdmin, participantController.updateStatus);
router.delete("/:id", authenticate, requireAdmin, participantController.deleteParticipant);

module.exports = router;