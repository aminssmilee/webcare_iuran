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

        Announcement::create([
            'title'   => $request->title,
            'content' => $request->content,
            'target'  => $request->target ?? 'all',
            'publish_date' => now(),
        ]);

        return back()->with('success', 'Pengumuman berhasil dibuat!');
    }

    // 🔹 Hapus pengumuman
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}
