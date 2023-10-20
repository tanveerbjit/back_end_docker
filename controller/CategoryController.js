const Category = require("../model/Category"); // Import the Category model


class CategoryController{



async store(req, res) {
  try {
    const { name, description } = req.body;

    // Create a new category instance
    const category = new Category({
      name,
      description,
    });

    // Save the category to the database
    const savedCategory = await category.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Category saved successfully",
        category: savedCategory,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}



async update(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Create an empty object for updatedData
    const updatedData = {};

    // Check if name exists in the request body, and if so, update it
    if (name !== undefined) {
      updatedData.name = name;
    }

    // Check if description exists in the request body, and if so, update it
    if (description !== undefined) {
      updatedData.description = description;
    }

    // Check if neither name nor description is provided
    if (Object.keys(updatedData).length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No valid fields provided for update",
        });
    }

    // Find and update the category by its ID
    const updatedCategory = await Category.findOneAndUpdate({ _id: id }, updatedData, { new: true });

    if (updatedCategory) {
      res.status(200).json({ success: true, message: "Category updated successfully", category: updatedCategory });
    } else {
      res.status(404).json({ success: false, message: "Category not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}



async destroy(req, res) {
  try {
    const { id } = req.params;

    // Find and delete the category by its ID
    const deletedCategory = await Category.findOneAndDelete({ _id: id });

    if (deletedCategory) {
      res.status(200).json({ success: true, message: "Category deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Category not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}



}

module.exports = new CategoryController();
