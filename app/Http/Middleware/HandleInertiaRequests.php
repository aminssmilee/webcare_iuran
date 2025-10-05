<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            // Flash messages available at page.props.flash.success / .error
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            // Validation errors available at page.props.errors
            'errors' => fn () => $request->session()->get('errors')
                ? $request->session()->get('errors')->getBag('default')->toArray()
                : [],


                'member' => fn () => $request->user()?->loadMissing('member')->member
            ? [
                'id'            => $request->user()->member->id,
                'nik'           => $request->user()->member->nik,
                'tgl_lahir'     => optional($request->user()->member->tgl_lahir)->format('Y-m-d'),
                'jenis_kelamin' => $request->user()->member->jenis_kelamin,
                'alamat'        => $request->user()->member->alamat,
                'no_wa'         => $request->user()->member->no_wa,
                'pendidikan'    => $request->user()->member->pendidikan,
                'pekerjaan'     => $request->user()->member->pekerjaan,
                'status'        => $request->user()->member->status,
            ] : null,
        ]);
    }

    
}
