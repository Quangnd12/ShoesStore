const express = require("express");
const router = express.Router();
const returnExchangeController = require("../controllers/returnExchangeController");
const { auth, isAdmin } = require("../middlewares/auth");

// Admin routes
router.post("/", auth, isAdmin, returnExchangeController.createReturnExchange);
router.get("/", auth, isAdmin, returnExchangeController.getAllReturnExchanges);
router.get("/:id", auth, isAdmin, returnExchangeController.getReturnExchangeById);

module.exports = router;

