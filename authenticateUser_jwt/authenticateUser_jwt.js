import jwt from 'jsonwebtoken';

// A authentication middleware that user jwt auth
export const authenticateUser = async (req, res, next) => {
    // get token from HttpOnly cookie
    const token = req.cookies.authToken; 

    // if there's no token return an unautherized error
    if (!token) {
        // Clear the token if one was partially set or expired in the client
        res.clearCookie('authToken');
        return res.status(401).json({message: 'Autherization Token is missing. Please log in.'});
    }

    // verify the token using secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Clear the expired Cookie
            res.clearCookie('authToken');
            // if verfication failed, return a forbiden error
            console.error('JWT verification failed', err)
            return res.status(403).json({message: 'Invalid or expired token'})
        }
        // if verification is successful, attach the user's id to header
        req.userId = user.id
        // process it to the route handler
        next();
    });
}