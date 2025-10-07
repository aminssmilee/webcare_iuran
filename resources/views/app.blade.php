<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Sinergi</title>

    {{-- ✅ AUTO SWITCH: Dev vs Production --}}
    @if (app()->environment('local') && file_exists(base_path('vite.config.js')))
        {{-- Mode Development (npm run dev) --}}
        @viteReactRefresh
        @vite('resources/js/app.jsx')
    @elseif (file_exists(public_path('build/manifest.json')))
        {{-- Mode Production (npm run build) --}}
        @vite('resources/js/app.jsx')
    @else
        {{-- Fallback (kalau build hilang) --}}
        <script>alert('Vite manifest.json tidak ditemukan. Jalankan "npm run build".');</script>
    @endif
</head>
<body>
    @inertia
</body>
</html>
