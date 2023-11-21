import express from 'express'
import { createListing, deleteListing } from '../controllers/listing.js';
import { isAuth } from '../auth/verifyToken.js';
const router = express.Router();

router.post('/', isAuth, createListing);

router.delete('/:id', isAuth, deleteListing)
export default router;