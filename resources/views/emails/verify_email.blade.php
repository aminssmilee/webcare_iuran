<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Verifikasi Email Anda - Sinergi Inovasi</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
    <tr>
      <td style="background:#004aad;padding:20px;text-align:center;">
        <img src="https://yourdomain.com/logo.png" alt="Sinergi Inovasi" width="80">
      </td>
    </tr>
    <tr>
      <td style="padding:40px 30px;">
        <h2 style="color:#333;text-align:center;">Verifikasi Email Kamu</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;">
          Hai <strong>{{ $user->name ?? 'Pengguna Baru' }}</strong>,<br><br>
          Terima kasih telah mendaftar di <strong>Sinergi Inovasi</strong>.  
          Klik tombol di bawah ini untuk memverifikasi alamat email kamu dan mengaktifkan akun.
        </p>

        <div style="text-align:center;margin:40px 0;">
          <a href="{{ $actionUrl }}" style="background-color:#004aad;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">
            Verifikasi Email Sekarang
          </a>
        </div>

        <p style="color:#777;font-size:13px;text-align:center;">
          Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser kamu:<br>
          <a href="{{ $actionUrl }}" style="color:#004aad;word-break:break-all;">{{ $actionUrl }}</a>
        </p>

        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
        <p style="color:#999;font-size:12px;text-align:center;">
          Email ini dikirim otomatis oleh sistem. Mohon tidak membalas pesan ini.<br>
          © {{ date('Y') }} Sinergi Inovasi. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
