<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Status Pendaftaran Ditolak</title>
</head>
<body style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
  <div style="background:white; border-radius:8px; padding:20px; max-width:600px; margin:auto; border:1px solid #eee;">
    <h2 style="color:#d32f2f;">❌ Pendaftaran Anda Ditolak</h2>
    <p>Halo <strong>{{ $name }}</strong>,</p>
    <p>Terima kasih telah mendaftar. Setelah proses verifikasi, kami mohon maaf bahwa pendaftaran Anda <strong>belum dapat kami terima</strong> dengan alasan berikut:</p>

    <blockquote style="border-left:4px solid #d32f2f; padding-left:10px; color:#444;">
      {{ $reason }}
    </blockquote>

    <p>Anda dapat memperbaiki data Anda dan mencoba mendaftar kembali.</p>

    <p style="margin-top:30px;">Salam hangat,<br><strong>Tim Administrator</strong></p>
  </div>
</body>
</html>
