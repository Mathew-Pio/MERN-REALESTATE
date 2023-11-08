import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const generateToken = user => {
    return jwt.sign(
        {id:user._id},
        process.env.JWT_SECRET_KEY,
        { expiresIn: '4d' }
    )
}

export const signup = async (req, res) => {
    const { username, email, password } = req.body;
    let user;
    try{
       user = await User.findOne({email});
       if(user){ 
        return res.status(404).json({success:false, message:'User with this email already exists'})
       }
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(password, salt)
       const newUser = new User({
            username,
            email,
            password: hashedPassword
       })
       await newUser.save();
       return res.status(201).json({success:true, message:'User created successfully', data: newUser})
    }catch(err){
        return res.status(500).json({success:false, message:"Failed to create user"})
    }
}

export const login = async(req, res) => {
    const { email } = req.body;
    let user;
    try{
        user = await User.findOne({email});
        if(!user){
            return res.status(404).json({success:false, message:'No user with this email found'})
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if(!isPasswordMatch){
            return res.status(404).json({success:false, message:'wrong password inputed'})
        }
        const token = generateToken(user);
        const { password, ...rest } = user._doc;
        return res.status(200).json({success:true, message:'login successful', token: token, data:user._doc});
    }catch(err){
        return res.status(500).json({success:false, message:'login failed'})
    }
}