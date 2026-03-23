import { useEffect } from 'react';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex w-full bg-white">
            <Head title="Acceder" />

            {/* SECCIÓN IZQUIERDA: IMAGEN EDITORIAL (Oculta en celular, visible desde lg) */}
            <div className="hidden lg:block lg:w-1/2 bg-[#F5F5F7] relative">
                {/* Imagen genérica de e-commerce de lujo (puedes cambiar la URL) */}
                <img 
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop" 
                    alt="Colección Editorial"
                    className="absolute inset-0 w-full h-full object-cover" 
                />
                {/* Capa sutil de marca opcional */}
                <div className="absolute inset-0 bg-black/5 flex items-end p-16">
                    <p className="text-white text-[10px] uppercase tracking-[0.3em] font-medium opacity-80">
                        Essentials Collection © 2026
                    </p>
                </div>
            </div>

            {/* SECCIÓN DERECHA: FORMULARIO (Ancho completo en celular, 1/2 en lg) */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 md:px-20 lg:px-24 py-12 relative">
                
                {/* Enlace de cierre o volver (opcional, arriba a la derecha) */}
                <Link href="/" className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </Link>

                <div className="w-full max-w-[360px] space-y-12">
                    
                    {/* CABECERA: Logo Genérico */}
                    <div className="text-center">
                        <Link href="/" className="text-2xl font-black tracking-[0.2em] uppercase text-black">
                            Essentials.
                        </Link>
                        <p className="mt-4 text-[11px] uppercase tracking-[0.15em] text-gray-500 font-medium">
                            Ingresa tus credenciales
                        </p>
                    </div>

                    {status && (
                        <div className="text-center text-xs tracking-wide text-gray-600 italic bg-gray-50 p-3 border border-gray-100">
                            {status}
                        </div>
                    )}

                    {/* FORMULARIO ESTILO LÍNEA INFERIOR */}
                    <form onSubmit={submit} className="space-y-10">
                        <div className="space-y-7">
                            
                            {/* EMAIL */}
                            <div className="relative border-b border-gray-200 focus-within:border-black transition-colors duration-400">
                                <label className="text-[10px] uppercase tracking-[0.15em] text-gray-400 block mb-1 font-medium">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    className="w-full py-2 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-300 transition-all px-0 text-black"
                                    placeholder="cliente@email.com"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                                <InputError message={errors.email} className="absolute -bottom-5 left-0 text-[10px] uppercase tracking-wider" />
                            </div>

                            {/* PASSWORD */}
                            <div className="relative border-b border-gray-200 focus-within:border-black transition-colors duration-400">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] uppercase tracking-[0.15em] text-gray-400 block mb-1 font-medium">
                                        Contraseña
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-[10px] uppercase tracking-wider text-gray-300 hover:text-black transition-colors mb-1"
                                        >
                                            ¿Olvidaste?
                                        </Link>
                                    )}
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    className="w-full py-2 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-300 transition-all px-0 text-black"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <InputError message={errors.password} className="absolute -bottom-5 left-0 text-[10px] uppercase tracking-wider" />
                            </div>
                        </div>

                        {/* BOTÓN NEGRO PURO */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-black text-white py-4 text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-zinc-800 transition-all duration-500 disabled:bg-gray-100 disabled:text-gray-400 shadow-sm"
                            >
                                {processing ? "Validando..." : "Acceder"}
                            </button>
                        </div>
                    </form>

                    {/* PIE DE PÁGINA: Registro */}
                    <div className="text-center pt-8 border-t border-gray-100">
                        <p className="text-[11px] text-gray-500 uppercase tracking-widest">
                            ¿No tienes cuenta?{' '}
                        </p>
                        <Link
                            href={route('register')}
                            className="inline-block mt-3 text-[11px] uppercase tracking-wider text-black font-bold border-b border-black pb-1 hover:border-gray-400 hover:text-gray-600 transition-all"
                        >
                            Crear cuenta nueva
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}