import express from 'express';
import { createComment, getComments, deleteComment } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';
import { validateCommentListQuery, validateCreateComment } from '../middleware/commentValidation';
import { requireJsonObjectBody } from '../middleware/validation';

const router = express.Router();

router.get('/', authenticate, validateCommentListQuery, getComments);
router.post('/', authenticate, requireJsonObjectBody, validateCreateComment, createComment);
router.delete('/:id', authenticate, deleteComment);

export default router;
