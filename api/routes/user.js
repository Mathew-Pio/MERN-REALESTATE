import express from 'express';
import { updateUser, deleteUser, getUserListings, getUser } from '../controllers/user.js';
import { isUser, isAuth } from '../auth/verifyToken.js';

const router = express.Router();

router.put('/:id',isUser, updateUser);

router.delete('/:id', isUser, deleteUser);

router.get('/listing/:id', isUser, getUserListings);

router.get('/:id', isAuth, getUser)


export default router;