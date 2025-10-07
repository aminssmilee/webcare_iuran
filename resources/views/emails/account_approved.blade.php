@component('mail::message')
# Akun Anda Telah Disetujui ✅

Halo {{ $userName }},

Akun Anda di **Sinergi** telah disetujui oleh admin.  
Sekarang Anda bisa login ke sistem menggunakan email yang Anda daftarkan.

@component('mail::button', ['url' => $loginUrl])
Login Sekarang
@endcomponent

Terima kasih,<br>
**Tim Sinergi**
@endcomponent
