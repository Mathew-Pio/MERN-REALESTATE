import express from 'express'
import { createListing } from '../controllers/listing.js';
import { isAuth } from '../auth/verifyToken.js';
const router = express.Router();

router.post('/', isAuth, createListing);

export default router;