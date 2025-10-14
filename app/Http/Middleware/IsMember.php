<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class IsMember
{
    public function handle($request, Closure $next)
    {
        if (!Auth::check()) {
            return redirect()->route('member.login');
        }

        $role = Auth::user()->role;

        // ✅ perbolehkan member & institution
        if (!in_array($role, ['member', 'institution'])) {
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
