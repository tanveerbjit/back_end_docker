module.exports  = (req, res, next) => {
    console.log(req.user)
    if (req.user) {
        next();
    } else {
        res.status(401);
        throw new Error("User is not authorized");
    }
}