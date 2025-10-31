const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next)=>{
    if(process.env.BYPASS_AUTH === 'true'){
        req.user = { id: 1, name: 'dev'}; // just to simulate logged in user
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) return res.status(401).json({error:'Authentication token missing'});

    jwt.verify(token, JWT_SECRET, (err, user)=>{
        if(err) return res.status(403).json({error : 'Invalid or expired token' });
        req.user = { id: parseInt(user.id, 10), username: user.username };
        next();
    })
}

module.exports = authenticateToken;