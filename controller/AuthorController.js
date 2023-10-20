// AuthorController.js

const Author = require("../model/Author");

class AuthorController {
  async store(req, res) {
    try {
      const { firstName, lastName, biography, birthDate } = req.body;

      const author = new Author({
        firstName,
        lastName,
        biography,
        birthDate,
      });

      const savedAuthor = await author.save();

      res.status(200).json({
        success: true,
        message: "Author saved successfully",
        author: savedAuthor,
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
      const { firstName, lastName, biography, birthDate } = req.body;

      const updatedData = {};

      if (firstName !== undefined) {
        updatedData.firstName = firstName;
      }

      if (lastName !== undefined) {
        updatedData.lastName = lastName;
      }

      if (biography !== undefined) {
        updatedData.biography = biography;
      }

      if (birthDate !== undefined) {
        updatedData.birthDate = birthDate;
      }

      if (Object.keys(updatedData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update",
        });
      }

      const updatedAuthor = await Author.findOneAndUpdate(
        { _id: id },
        updatedData,
        { new: true }
      );

      if (updatedAuthor) {
        res.status(200).json({
          success: true,
          message: "Author updated successfully",
          author: updatedAuthor,
        });
      } else {
        res.status(404).json({ success: false, message: "Author not found" });
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

      const deletedAuthor = await Author.findOneAndDelete({ _id: id });

      if (deletedAuthor) {
        res
          .status(200)
          .json({ success: true, message: "Author deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Author not found" });
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

module.exports = new AuthorController();
