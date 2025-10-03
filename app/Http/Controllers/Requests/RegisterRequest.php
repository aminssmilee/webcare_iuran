<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        // true = siapa saja bisa akses (guest)
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:8|confirmed',
            'nik'           => 'required|string|min:8|max:16|unique:members,nik',
            'tgl_lahir'     => 'required|date',
            'jenis_kelamin' => 'required|in:L,P',
            'alamat'        => 'required|string|max:255',
            'hp'            => 'required|string|max:20',
            'pendidikan'    => 'nullable|string|max:100',
            'pekerjaan'     => 'nullable|string|max:100',
            'dokumen'       => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'      => 'Nama lengkap wajib diisi.',
            'email.required'     => 'Email wajib diisi.',
            'email.unique'       => 'Email sudah terdaftar.',
            'password.required'  => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            'nik.required'       => 'NIK wajib diisi.',
            'nik.unique'         => 'NIK sudah terdaftar.',
            'dokumen.mimes'      => 'Dokumen harus berupa pdf, doc, docx, jpg, jpeg, atau png.',
            'dokumen.max'        => 'Ukuran dokumen maksimal 2MB.',
        ];
    }
}
