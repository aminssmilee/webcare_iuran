<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Kode OTP Verifikasi Akun</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 30px; color: #333;">
  <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h2 style="text-align: center; color: #2563eb;">Verifikasi Akun Anda</h2>
    <p>Masukkan kode berikut untuk memverifikasi akun Anda di <strong>{{ $appName }}</strong>:</p>

    <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; margin: 20px 0;">
      {{ $otpCode }}
    </div>

    <p style="text-align:center;">Kode ini berlaku selama <strong>{{ $validMinutes }} menit</strong>.</p>

    <p style="font-size: 13px; color: #6b7280;">
      Jika Anda tidak meminta kode ini, abaikan email ini. Demi keamanan, jangan berikan kode OTP ini kepada siapa pun.
    </p>

    <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;" />

    <p style="text-align: center; font-size: 13px; color: #9ca3af;">© {{ date('Y') }} {{ $appName }} — Semua hak dilindungi.</p>
  </div>
</body>
</html>
