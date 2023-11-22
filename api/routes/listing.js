import express from 'express'
import { createListing, deleteListing, updateListing, getListing } from '../controllers/listing.js';
import { isAuth } from '../auth/verifyToken.js';
const router = express.Router();

router.post('/', isAuth, createListing);

router.delete('/:id', isAuth, deleteListing)

router.put('/:id', isAuth, updateListing);

router.get('/:id', getListing);

export default router;