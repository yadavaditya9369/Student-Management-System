import { Router } from 'express';
import { circulateBook, createBook, listBooks } from '../controllers/libraryController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateRequest.js';
import { libraryBookSchema, libraryCirculationSchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticate, requireRole('admin'));
router.get('/', listBooks);
router.post('/', validate(libraryBookSchema), createBook);
router.patch('/:id/circulation', validate(libraryCirculationSchema), circulateBook);
export default router;
