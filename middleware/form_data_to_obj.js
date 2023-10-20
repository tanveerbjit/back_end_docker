module.exports = function(req, res, next) {
    console.log(req.body);
    const obj = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      stock: req.body.stock,
    };
    req.separate_body = obj
    console.log(req.separate_body);
    // next();
  
}