const Crop = require("../models/Crop");

//  Add new crop
exports.addCrop = async (req, res) => {
  try {
    const { name, quantity, price, description, location } = req.body;
    const farmerId = req.user.id; // from auth middleware

    const newCrop = await Crop.create({
      name,
      quantity,
      price,
      description,
      location,
      farmer: farmerId,
    });

    res.status(201).json({
          message: "Crop added successfully",
          crop: newCrop 
        });
  } catch (error) {
    res.status(500).json({
         message: "Server error",
          error });
  }
};

//  Get all crops (with search, sort, pagination)
exports.getAllCrops = async (req, res) => {
  try {
    const { search, sortBy, order } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const sort = {};
    if (sortBy) sort[sortBy] = order === "asc" ? 1 : -1;

    const crops = await Crop.find(filter)
      .populate("farmer", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Crop.countDocuments(filter);

    res.status(200).json({
      totalCrops: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      crops,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//  Update crop
exports.updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await Crop.findById(id);

    if (!crop) return res.status(404).json({ message: "Crop not found" });
    if (crop.farmer.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Crop.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Crop updated", crop: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//  Delete crop
exports.deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await Crop.findById(id);

    if (!crop) return res.status(404).json({ message: "Crop not found" });
    if (crop.farmer.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await Crop.findByIdAndDelete(id);
    res.status(200).json({ message: "Crop deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
