import { Router } from 'express';
import { listResults, createResult, importResults, deleteResult } from '../controllers/resultController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateRequest.js';
import { resultSchema, resultImportSchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/', listResults);
router.post('/import', requireRole('admin', 'teacher'), validate(resultImportSchema), importResults);
router.post('/', requireRole('admin', 'teacher'), validate(resultSchema), createResult);
router.delete('/:id', requireRole('admin', 'teacher'), deleteResult);
export default router;

