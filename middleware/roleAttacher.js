
const roleAttacher = (req, res, next) => {
    console.log(req.url);
  if(req.url === '/admin/registration'){
    req.role = "a";
    next();
  }else if (req.url === "/user/registration") {
    req.role = "u";
    next();
  }

};

module.exports = roleAttacher;
