import { Hono } from 'hono';
import { WilayahController } from './wilayah.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const wilayahRoute = new Hono();

wilayahRoute.use('*', authMiddleware);
wilayahRoute.get('/provinsi', WilayahController.getProvinsi);
wilayahRoute.get('/kabupaten', WilayahController.getKabupaten);
wilayahRoute.get('/kecamatan', WilayahController.getKecamatan);
wilayahRoute.get('/kalurahan', WilayahController.getKalurahan);
wilayahRoute.get('/kabupaten/search', WilayahController.searchKabupaten);

export default wilayahRoute;
