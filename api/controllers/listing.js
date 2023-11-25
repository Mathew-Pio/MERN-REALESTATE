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

export const updateListing = async (req, res) => {
    const id = req.params.id;
    const listing = await Listing.findById(id);
    if(!listing){
        res.status(404).json({messgae:'No listing found'});
    }

    if(req.userId !== listing.userRef){
        return res.status(401).json({message:'You can only update your own list'})
    }

    try{
        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            req.body,
            {new: true}
        );
        return res.status(200).json(updatedListing);
    }catch(err){
        return res.status(500).json({err, success:false, message: 'Failed to update listing'});
    }
}

export const getListing = async (req, res) => {
    const id = req.params.id;
    try{
        const listing = await Listing.findById(id);
        if(!listing){
            return res.status(404).status({message:'Listing not found'})
        }
        return res.status(200).json(listing)
    }catch(err){
        return res.status(500).json({err, success:false, message: 'Failed to get listing'});
    }
}

export const getListings = async(req, res) => {
    try{
        const limit = parseInt(req.query.limit) || 9;
        const startIndex = parseInt(req.query.startIndex) || 0;
        let offer = req.query.offer;

        if(offer === undefined || offer === 'false'){
            offer = { $in: [false, true ] };
        }

        let furnished = req.query.furnished;
        if(furnished === undefined || furnished === 'false'){
            furnished = { $in: [false, true] };
        }

        let parking = req.query.parking;
        if(parking === undefined || parking === 'false'){
            parking = { $in: [false, true] };
        }

        let type = req.query.type;
        if(type === undefined || type === 'all'){
            type = { $in: ['sale', 'rent'] };
        }

        const searchTerm = req.query.searchTerm || '';

        const sort = req.query.sort || 'createdAt';

        const order = req.query.order || 'desc';

        const listings = await Listing.find({
            name: {$regex: searchTerm, $options: 'i'},
            offer,
            furnished,
            parking,
            type,
        }).sort(
            {[sort]: order}
        ).limit(limit).skip(startIndex);

        return res.status(200).json(listings);

    }catch(err){
        return res.status(500).json({err, success:false, message: 'Failed to get listing'});
    }
}













