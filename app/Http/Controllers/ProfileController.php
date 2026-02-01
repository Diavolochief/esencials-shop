<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
  public function update(Request $request): RedirectResponse
{
    $user = $request->user();

    $request->validate([
        'name'         => 'required|string|max:255',
        'email'        => 'required|string|lowercase|email|max:255|unique:users,email,'.$user->id,
        'phone'        => 'nullable|string|max:20',
        'address'      => 'nullable|string|max:255',
        'neighborhood' => 'nullable|string|max:255',
        'city'         => 'nullable|string|max:255',
        'zip_code'     => 'nullable|string|max:10',
        'avatar'       => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // Validación de imagen
    ]);

    // Manejo del Avatar
    if ($request->hasFile('avatar')) {
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar = '/storage/' . $path;
    }

    $user->fill($request->except('avatar'));

    if ($user->isDirty('email')) {
        $user->email_verified_at = null;
    }

    $user->save();

    return Redirect::route('profile.edit')->with('success', 'Perfil actualizado.');
}

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
