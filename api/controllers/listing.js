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

export const deleteListing = async (req, res) => {
    const id = req.params.id;
    const listing = await Listing.findById(id);

    if(!listing){
        return res.status(404).json({message:'no listing found'})
    }

    if(req.userId !== listing.userRef){
        return res.status(404).json({message:'You can only delete your own listings!'})
    }

    try{
        await Listing.findByIdAndDelete(id);
        return res.status(200).json({success: true, message:'Listing deleted'})
    }catch(error){
        return res.status(500).json({error, success:false, message: 'Failed to delete listing'});
    }
}