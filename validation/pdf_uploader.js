const multer = require("multer");
const path = require("path");


// File upload folder
const UPLOADS_FOLDER = "./public/uploads/books/";

// Define the storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName =
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now();

    cb(null, fileName + fileExt);
  },
});

// Create the Multer upload object
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2000000, // 2MB
  },
  fileFilter: (req, file, cb) => {

    console.log(file)

    if (
      file.mimetype === 'application/pdf'
    ) {
      

  
      cb(null, true);
    } 
    else {
      cb(new Error("Only .jpg, .png, or .jpeg format allowed!"));
    }
  },
});

module.exports = upload;
