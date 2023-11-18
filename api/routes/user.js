import express from 'express';
import { updateUser, deleteUser } from '../controllers/user.js';
import { isUser } from '../auth/verifyToken.js';

const router = express.Router();

router.put('/:id',isUser, updateUser);

router.delete('/:id', isUser, deleteUser);

export default router;