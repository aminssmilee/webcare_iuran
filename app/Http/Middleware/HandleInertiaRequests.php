<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [

            // ✅ Data user (admin/member) yang sedang login
            'auth' => [
                'user' => fn () => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'role' => $request->user()->role ?? null,
                        'avatar' => $request->user()->avatar ?? null,
                    ]
                    : null,
            ],

            // ✅ Flash message
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],

            // ✅ Validation errors
            'errors' => fn () => $request->session()->get('errors')
                ? $request->session()->get('errors')->getBag('default')->toArray()
                : [],

            // ✅ Data member (jika user punya relasi member)
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
                ]
                : null,
        ]);
    }
}
