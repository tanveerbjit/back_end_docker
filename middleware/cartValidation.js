const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// Custom middleware to validate the order items
function validateOrderItems(req, res, next) {
  const orderItems = req.body;

  if (!Array.isArray(orderItems)) {
    return res.status(400).json({ message: "Order items should be an array" });
  }

  for (const item of orderItems) {
    if (
      typeof item !== "object" ||
      !item.hasOwnProperty("id") ||
      !item.hasOwnProperty("quantity")
    ) {
      return res
        .status(400)
        .json({
          message:
            'Each order item should be an object with "id" and "quantity" fields',
        });
    }

    if (typeof item.id !== "string" || typeof item.quantity !== "number") {
      return res
        .status(400)
        .json({ message: "Type mismatch in order item fields" });
    }
  }

  next();
}

app.post("/place-order", validateOrderItems, (req, res) => {
  const orderItems = req.body.orderItems;
  // Process the orderItems further as needed
  res.json({ message: "Order placed successfully", orderItems });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
