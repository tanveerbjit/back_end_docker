const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "b1bb931b54d2aa",
    pass: "769fd848dec90b",
  },
});

// Export the function to send an email
exports.sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "development@bjit.com",
    to,
    subject,
    html: text,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.log("Error:", error);
    throw error; // Re-throw the error so that it can be caught by the calling function
  }
};
