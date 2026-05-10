import { Hono } from 'hono';

import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const authRoute = new Hono();

authRoute.post('/login', AuthController.login);
authRoute.post('/verify-otp', AuthController.verifyOtp);
authRoute.post('/logout', authMiddleware, AuthController.logout);

export default authRoute;
