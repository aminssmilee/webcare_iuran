<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Announcement;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    // 🔹 Halaman daftar pengumuman (admin)
    public function index()
    {
        $announcements = Announcement::latest()->get();
        return Inertia::render('Announcements', [
            'announcements' => $announcements
        ]);
    }

    // 🔹 Simpan pengumuman baru
    public function store(Request $request)
    {
        $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
            'target'  => 'nullable|in:all,member,institution',
        ]);

        $announcement = Announcement::create([
            'title'        => $request->title,
            'content'      => $request->content,
            'target'       => $request->target ?? 'all',
            'publish_date' => now(),
        ]);

        // ✅ kembalikan data lengkap JSON agar frontend bisa langsung append
        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'message' => 'Pengumuman berhasil dibuat!',
                'announcement' => $announcement,
            ]);
        }

        return back()->with('success', 'Pengumuman berhasil dibuat!');
    }


    // 🔹 Hapus pengumuman
    public function destroy(Request $request, Announcement $announcement)
    {
        $announcement->delete();

        // Jika request dari axios (AJAX)
        if ($request->ajax()) {
            return response()->json([
                'message' => 'Pengumuman berhasil dihapus!',
                'status'  => 'success',
            ], 200);
        }

        // ✅ Jika dari browser biasa (Inertia)
        // return back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}


// End of file