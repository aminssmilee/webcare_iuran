<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Email</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #f9fafb;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      color: #333;
    }
    .card {
      background: white;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      width: 90%;
      max-width: 420px;
      text-align: center;
    }
    button {
      background: #2563eb;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    button:hover {
      background: #1d4ed8;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Verifikasi Email Kamu</h2>
    <p>Kami telah mengirimkan link verifikasi ke email kamu. Silakan cek inbox atau folder spam.</p>

    @if (session('success'))
      <p style="color: green;">{{ session('success') }}</p>
    @endif

    <form method="POST" action="{{ route('verification.send') }}">
      @csrf
      <button type="submit">Kirim Ulang Email Verifikasi</button>
    </form>

    <p style="margin-top: 16px;">
      Sudah verifikasi? <a href="{{ route('member.login') }}">Kembali ke Login</a>
    </p>
  </div>
</body>
</html>
