const express = require("express");

const router = express.Router();

const cropSchema = require("../validation/cropValidation")

const { addCrop, getAllCrops, updateCrop, deleteCrop } = require("../controllers/crop");
const  validate  = require("../middlewares/validate");
const {auth} = require("../middlewares/auth");

router.post("/add", auth, validate(cropSchema), addCrop);
router.get("/", getAllCrops);
router.put("/:id", auth, updateCrop);
router.delete("/:id", auth, deleteCrop);

module.exports = router;
