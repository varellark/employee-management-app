import nodemailer from 'nodemailer';

interface SendOtpEmailParams {
  to: string;
  name: string;
  otp: string;
}

interface SendAccountEmailParams {
  to: string;
  name: string;
  username: string;
  password: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const CURRENT_YEAR = new Date().getFullYear();

const baseStyles = `
  body { margin:0; padding:0; background-color:#eef2f7; font-family:'Segoe UI',Arial,sans-serif; }
  .wrapper { padding:40px 16px; }
  .card { max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  .header { background:linear-gradient(135deg,#1a237e 0%,#283593 60%,#1565c0 100%); padding:48px 40px; text-align:center; }
  .header-badge { display:inline-block; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:10px 24px; margin-bottom:20px; }
  .header-badge span { color:rgba(255,255,255,0.9); font-size:13px; letter-spacing:3px; text-transform:uppercase; font-weight:600; }
  .header h1 { margin:0; color:#ffffff; font-size:26px; font-weight:700; letter-spacing:0.5px; }
  .header p { margin:10px 0 0; color:rgba(255,255,255,0.65); font-size:14px; }
  .body { padding:40px 48px; }
  .greeting-label { margin:0 0 8px; color:#555; font-size:15px; }
  .greeting-name { margin:0 0 28px; color:#1a237e; font-size:22px; font-weight:700; }
  .body-text { margin:0 0 28px; color:#666; font-size:15px; line-height:1.7; }
  .otp-box { background:linear-gradient(135deg,#f0f4ff,#e8eeff); border:2px solid #c5cef7; border-radius:16px; padding:28px 48px; text-align:center; margin-bottom:28px; }
  .otp-label { margin:0 0 6px; color:#888; font-size:12px; letter-spacing:2px; text-transform:uppercase; }
  .otp-code { margin:0; font-size:42px; font-weight:800; letter-spacing:12px; color:#1a237e; }
  .alert-warning { background:#fff8e1; border-left:4px solid #f59e0b; border-radius:0 8px 8px 0; padding:14px 18px; margin-bottom:28px; }
  .alert-warning p { margin:0; color:#92610a; font-size:14px; line-height:1.6; }
  .alert-success { background:#e8f5e9; border-left:4px solid #43a047; border-radius:0 8px 8px 0; padding:14px 18px; margin-bottom:28px; }
  .alert-success p { margin:0; color:#2e7d32; font-size:14px; line-height:1.6; }
  .note { margin:0; color:#aaa; font-size:13px; line-height:1.6; }
  .credentials-box { background:linear-gradient(135deg,#f0f4ff,#e8eeff); border:1px solid #c5cef7; border-radius:16px; padding:28px 32px; margin-bottom:28px; }
  .credential-item { padding-bottom:16px; margin-bottom:16px; border-bottom:1px solid #d0d9f5; }
  .credential-item:last-child { padding-bottom:0; margin-bottom:0; border-bottom:none; }
  .credential-label { margin:0 0 4px; color:#888; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; }
  .credential-value { margin:0; color:#1a237e; font-size:18px; font-weight:700; }
  .footer { background:#f7f9fc; border-top:1px solid #eee; padding:24px 48px; text-align:center; }
  .footer p { margin:0 0 4px; color:#999; font-size:13px; }
  .footer p:last-child { margin:0; color:#bbb; font-size:12px; }
`;

const otpTemplate = (name: string, otp: string) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Kode OTP Login</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="card">

      <div class="header">
        <div class="header-badge"><span>HRM System</span></div>
        <h1>Verifikasi Login</h1>
        <p>One-Time Password (OTP)</p>
      </div>

      <div class="body">
        <p class="greeting-label">Halo,</p>
        <p class="greeting-name">${name}</p>

        <p class="body-text">
          Gunakan kode OTP berikut untuk menyelesaikan proses login Anda. Demi keamanan, kode ini hanya berlaku selama
          <strong style="color:#1a237e;">${process.env.OTP_EXPIRED_SECONDS} detik</strong>.
        </p>

        <div class="otp-box">
          <p class="otp-label">Kode OTP Anda</p>
          <p class="otp-code">${otp}</p>
        </div>

        <div class="alert-warning">
          <p>⚠️ <strong>Jangan bagikan kode ini kepada siapapun</strong>, termasuk pihak yang mengaku sebagai tim HRM.</p>
        </div>

        <p class="note">Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini. Akun Anda tetap aman.</p>
      </div>

      <div class="footer">
        <p>&copy; ${CURRENT_YEAR} HRM System. All rights reserved.</p>
        <p>Email ini dikirim secara otomatis, mohon tidak membalas.</p>
      </div>

    </div>
  </div>
</body>
</html>
`;

const accountCreatedTemplate = (
  name: string,
  username: string,
  password: string
) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Akun Berhasil Dibuat</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="card">

      <div class="header">
        <div class="header-badge"><span>HRM System</span></div>
        <h1>Akun Anda Telah Dibuat</h1>
        <p>Selamat bergabung di sistem HRM</p>
      </div>

      <div class="body">
        <p class="greeting-label">Halo,</p>
        <p class="greeting-name">${name}</p>

        <p class="body-text">
          Akun Anda telah berhasil dibuat di sistem HRM. Berikut adalah informasi login Anda:
        </p>

        <div class="credentials-box">
          <div class="credential-item">
            <p class="credential-label">Username</p>
            <p class="credential-value">${username}</p>
          </div>
          <div class="credential-item">
            <p class="credential-label">Password</p>
            <p class="credential-value" style="letter-spacing:2px;">${password}</p>
          </div>
        </div>

        <div class="alert-success">
          <p>🔐 <strong>Segera ubah password Anda</strong> setelah login pertama untuk menjaga keamanan akun.</p>
        </div>

        <p class="note">Jika Anda merasa tidak mendaftarkan akun ini, segera hubungi administrator sistem.</p>
      </div>

      <div class="footer">
        <p>&copy; ${CURRENT_YEAR} HRM System. All rights reserved.</p>
        <p>Email ini dikirim secara otomatis, mohon tidak membalas.</p>
      </div>

    </div>
  </div>
</body>
</html>
`;

export class MailService {
  static async sendOtpEmail({ to, name, otp }: SendOtpEmailParams) {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Dashboard : Verifikasi Login',
      html: otpTemplate(name, otp),
    });
  }

  static async sendAccountCreatedEmail({
    to,
    name,
    username,
    password,
  }: SendAccountEmailParams) {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Akun User Berhasil Dibuat',
      html: accountCreatedTemplate(name, username, password),
    });
  }
}
