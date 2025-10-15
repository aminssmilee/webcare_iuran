<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
</head>
<body>
  <h2>Hai, {{ $user->name }} 👋</h2>
  <p>Password akun Anda baru saja diubah pada {{ now()->format('d M Y H:i') }}.</p>
  <p>Jika Anda tidak melakukan perubahan ini, segera hubungi admin kami.</p>
  <p>Terima kasih,<br>Tim Keamanan Sistem</p>
</body>
</html>
