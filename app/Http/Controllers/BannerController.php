<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BannerController extends Controller
{
    // Función auxiliar para verificar si es admin
    private function checkAdmin() 
    {
        if (auth()->id() !== 1) {
            abort(403, 'Acceso denegado. Solo el administrador puede configurar el sitio.');
        }
    }

    public function index()
    {
        $this->checkAdmin(); // <--- PROTECCIÓN

        return Inertia::render('Admin/Banners', [
            'banners' => Banner::orderBy('order')->get()
        ]);
    }

    public function store(Request $request)
    {
        $this->checkAdmin(); // <--- PROTECCIÓN

        $request->validate([
            'image' => 'required|image|max:4096', 
            'title' => 'nullable|string|max:100',
        ]);

        $path = $request->file('image')->store('banners', 'public');

        Banner::create([
            'image_url' => asset('storage/' . $path),
            'title' => $request->title,
            'is_active' => true
        ]);

        return back()->with('success', 'Banner agregado.');
    }

    public function destroy($id)
    {
        $this->checkAdmin(); // <--- PROTECCIÓN

        $banner = Banner::findOrFail($id);
        
        // Borrar archivo del disco
        $path = str_replace(asset('storage/'), '', $banner->image_url);
        Storage::disk('public')->delete($path);
        
        $banner->delete();
        return back()->with('success', 'Banner eliminado.');
    }
}