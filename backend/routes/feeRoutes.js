import { Router } from 'express';
import { createFee, feeSummary, listFees, updateFeeStatus } from '../controllers/feeController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateRequest.js';
import { feeRecordSchema, feeStatusSchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticate, requireRole('admin'));
router.get('/summary', feeSummary);
router.get('/', listFees);
router.post('/', validate(feeRecordSchema), createFee);
router.patch('/:id/status', validate(feeStatusSchema), updateFeeStatus);
export default router;
