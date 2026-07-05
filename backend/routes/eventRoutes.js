const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const { authenticate, requireAdmin } = require("../middleware/auth");

// Public routes — semua orang bisa lihat event
router.get("/", eventController.getAllEvents);
router.get("/stats", authenticate, requireAdmin, eventController.getStats);
router.get("/:id", eventController.getEventById);

// Protected routes — hanya admin
router.post("/", authenticate, requireAdmin, eventController.createEvent);
router.put("/:id", authenticate, requireAdmin, eventController.updateEvent);
router.delete("/:id", authenticate, requireAdmin, eventController.deleteEvent);

module.exports = router;