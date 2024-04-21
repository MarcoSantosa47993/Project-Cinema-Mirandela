
const { response } = require("express"); // Import response object from Express
const jwt = require("jsonwebtoken"); // Import jsonwebtoken for handling JWT

// Middleware function to verify JWT token
module.exports = function (req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Extract token from Authorization header
        const decoded = jwt.verify(token, process.env.jwt_secret); // Verify and decode the token
        req.body.userId = decoded.userId; // Attach decoded user ID to the request body
        next(); // Move to the next middleware or route handler
    } catch (error) {
        res.status(401).send({ success: false, message: "invalid token" })
    }
}
