import User from '../models/User.js';
import Listing from '../models/Listing.js';
import bcrypt from 'bcrypt';

export const updateUser = async (req, res) => {
    const id = req.params.id;
    if(req.body.password){
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt)
    }
    try{
        const updatedUser = await User.findByIdAndUpdate(id, {
            $set: req.body
        }, {new:true} );
        if(!updatedUser){
            return res.status(404).json({success:false, message: 'No user found'})
        }
        const {password, ...rest} = updatedUser._doc;
        return res.status(200).json({success: true, message:'User updated', data:rest})
    }catch(err){
        return res.status(500).json({error: err, success: false, message:'Internal server error'})
    }
}

export const deleteUser = async (req, res) => {
    const id = req.params.id;
    try{
        await User.findByIdAndDelete(id);
        return res.status(200).json({success: true, message:'User deleted successfully'})
    }catch(err){
        return res.status(500).json({err, success: false, message:'Failed to delete user'})
    }
}

export const getUserListings = async (req, res) => {
    const id = req.params.id;
    try{
        const listings = await Listing.find({ userRef:id });
        return res.status(200).json({success:true, message:'User listings found', data:listings})
    }catch(err){
        return res.status(500).json({err, success: false, message:'Failed to find user listings'})
    }
} 

export const getUser = async(req, res) => {
    const id = req.params.id;
    try{
    const user = await User.findById(id);
    if(!user){
        return res.status(404).json({message:'user not found'});
    }
    const {password, ...rest} = user._doc;
    return res.status(200).json(rest);
    }
    catch(err){
        return res.status(500).json({err, success: false, message:'Failed to find user'})
    }
}




