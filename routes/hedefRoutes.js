const express = require("express");
const router = express.Router();

const hedefController = require("../controllers/hedefController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/sehirler", authMiddleware, hedefController.getSehirler);
router.get("/universiteler", authMiddleware, hedefController.getUniversiteler);
router.get("/bolumler", authMiddleware, hedefController.getBolumler);
router.post("/kaydet", authMiddleware, hedefController.saveHedef);
router.get("/getir", authMiddleware, hedefController.getHedef);

module.exports = router;

