const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const passport = require('passport');
const cookieSession = require('cookie-session');
require("./util/passport")
const isAdmin = require("./middleware/isAdmin");
const multer = require("multer");
const upload = require("./validation/file_upload_validation");
const app = express();
const DBserver = require('./DBserver');
const failure = require("./helpers/failed");
const isUser = require("./middleware/isUser");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const HTTP_STATUS = require("./constants/statusCodes");
const { sendResponse } = require("./util/common");
const cors = require('cors');



// log write
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);


// port define
const port = process.env.PORT || 8000;

// Enable CORS for all routes
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, 
};

app.use(cors(corsOptions));


// goggle Oauth handler
app.use(cookieSession({
  name: 'google-auth-session',
  keys: ['oAuth2']
}))


// goggle Oauth handler
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// log handler
app.use(morgan("combined", { stream: accessLogStream }));


// passport and other input like json handler
app.use(express.static("public"));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());


// invalid JSON handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendResponse(res, HTTP_STATUS.BAD_REQUEST, "Invalide JSON Format",true);
  }
  next();
});


// All routes
// app.post("/multer", upload.single("product_image"), (req, res) => {
//     console.log(req.file);
//   const { name } = req.body;
//   console.log(name);
//   res.send({ name });
// });
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/admin", isAdmin, require("./routes/adminRoutes"));
app.use("/api/v1/user",isUser, require("./routes/userRoutes"));
app.use("/api/v1/product", require("./routes/productRoutes"));





// app.use(errorHandler);

// Handle other requests
app.use((req, res) => {
  return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Resource does not exist", true);
});

// DB & express server connect 
DBserver.connect(()=>{
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})
