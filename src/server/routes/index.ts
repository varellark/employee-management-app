import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { openApiSpec } from '../api-docs/openapi';

import authRoute from '../modules/auth/auth.route';
import userRoute from '../modules/user/user.route';
import pegawaiRoute from '../modules/pegawai/pegawai.route';
import wilayahRoute from '../modules/wilayah/wilayah.route';
import dashboardRoute from '../modules/dashboard/dashboard.route';
import tunjanganRoute from '../modules/tunjangan/tunjangan.route';
import settingTunjanganRoute from '../modules/settingTunjangan/settingTunjangan.route';
import logRoute from '../modules/log/log.route';
import presensiRoute from '../modules/presensi/presensi.route';

const app = new Hono().basePath('/api');

app.get('/', (c) => {
  return c.json({ message: 'Welcome to Employee Management API' });
});

app.get('/healthcheck', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/docs', swaggerUI({ url: '/api/openapi' }));

app.get('/openapi', (c) => c.json(openApiSpec));

app.route('/auth', authRoute);
app.route('/users', userRoute);
app.route('/pegawai', pegawaiRoute);
app.route('/wilayah', wilayahRoute);
app.route('/dashboard', dashboardRoute);
app.route('/tunjangan', tunjanganRoute);
app.route('/setting-tunjangan', settingTunjanganRoute);
app.route('/log', logRoute);
app.route('/presensi', presensiRoute);

export default app;
