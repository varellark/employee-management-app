import { Hono } from 'hono';

import { UserController } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const userRoute = new Hono();

userRoute.use('*', authMiddleware);
userRoute.get('/', UserController.index);
userRoute.get('/me', UserController.me);
userRoute.get('/search-pegawai', UserController.searchPegawai);
userRoute.get('/:id', UserController.show);
userRoute.post('/', UserController.create);
userRoute.put('/me', UserController.updateMe);
userRoute.put('/:id', UserController.update);
userRoute.delete('/:id', UserController.delete);
userRoute.patch('/:id/toggle-status', UserController.toggleStatus);

export default userRoute;