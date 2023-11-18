import Listing from "../models/Listing.js"

export const createListing = async (req, res) => {
    try{
        const listing = new Listing({...req.body})
        await listing.save();
        return res.status(200).json({success: true, message:'Listing created', data: listing})
    }catch(error){
        return res.status(500).json({error, success:false, message: 'Failed to create listing'});
    }
}