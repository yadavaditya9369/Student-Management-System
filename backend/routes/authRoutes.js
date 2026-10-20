import { Router } from 'express';
import { login, logout, me, register } from '../controllers/authController.js';
import { finishOAuth, oauthProviders, startOAuth } from '../controllers/oauthController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateRequest.js';
import { loginSchema, registerSchema } from '../validators/schemas.js';

const router = Router();
router.get('/oauth/providers', oauthProviders);
router.get('/oauth/:provider/callback', finishOAuth);
router.get('/oauth/:provider', startOAuth);
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, me);
export default router;
