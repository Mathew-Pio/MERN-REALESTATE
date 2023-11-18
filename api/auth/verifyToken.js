import jwt from 'jsonwebtoken';

export const isAuth = (req, res, next) => {
    const authToken = req.headers.authorization;

    // check if the token exists
    if(!authToken || !authToken.startsWith('Bearer ')){
        return res.status(401).json({success:false, message:'No token, authorization needed'})
    }

    try{
        const token = authToken.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.userId = decodedToken.id;
        req.user = decodedToken.user;
        next();
    }catch(err){
        if(err.name === 'TokenExpiredError'){
            return res.status(401).json({message: 'Token expired'})
        }
        return res.status(401).json({success: false, message:'Invalid Token'})
    }
}

export const isUser = (req, res, next) => {
    isAuth(req, res, () => {
        if(req.userId === req.params.id){
            next();
        }else{
            return res.status(403).json({sucess:false, message:'you are not authorized'});
        }
    })
}