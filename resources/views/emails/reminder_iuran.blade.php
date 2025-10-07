@component('mail::message')
# Pengingat Pembayaran

Halo {{ $nama }},

Kami ingin mengingatkan bahwa pembayaran Anda untuk periode **{{ $periode }}**
sebesar **{{ $jumlah }}** belum kami terima hingga saat ini.

Silakan segera melakukan pembayaran sebelum tanggal **{{ $dueDate }}** agar status keanggotaan Anda tetap aktif.

@component('mail::button', ['url' => $linkBayar])
Lihat Pembayaran
@endcomponent

Terima kasih atas perhatian dan kerja samanya.

Salam hangat,  
**Tim Sinergi**
@endcomponent
