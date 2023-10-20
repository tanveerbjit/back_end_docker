// PublisherController.js

const Publisher = require("../model/Publisher");

class PublisherController {

  async store(req, res) {
    try {
      const { name, location, foundingYear } = req.body;

      const publisher = new Publisher({
        name,
        location,
        foundingYear,
      });

      const savedPublisher = await publisher.save();

      res.status(200).json({
        success: true,
        message: "Publisher saved successfully",
        publisher: savedPublisher,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, location, foundingYear } = req.body;

      const updatedData = {};

      if (name !== undefined) {
        updatedData.name = name;
      }

      if (location !== undefined) {
        updatedData.location = location;
      }

      if (foundingYear !== undefined) {
        updatedData.foundingYear = foundingYear;
      }

      if (Object.keys(updatedData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update",
        });
      }

      const updatedPublisher = await Publisher.findOneAndUpdate(
        { _id: id },
        updatedData,
        { new: true }
      );

      if (updatedPublisher) {
        res.status(200).json({
          success: true,
          message: "Publisher updated successfully",
          publisher: updatedPublisher,
        });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Publisher not found" });
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;

      const deletedPublisher = await Publisher.findOneAndDelete({ _id: id });

      if (deletedPublisher) {
        res
          .status(200)
          .json({ success: true, message: "Publisher deleted successfully" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Publisher not found" });
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
  
}

module.exports = new PublisherController();
