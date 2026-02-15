import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox'; // Si usas Breeze, si no, usa un input normal
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
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
        <div className="min-h-screen flex w-full">
            
            <Head title="Iniciar Sesión - Sonidec" />

            {/* SECCIÓN IZQUIERDA: IMAGEN DE MARCA (Visible solo en pantallas medianas y grandes) */}
            <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
                {/* Capa oscura para que el texto resalte si decides poner algo encima */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10" />
                
                {/* IMAGEN DE FONDO: Cambia esta URL por una foto real de productos Sonidec */}
                <img 
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop" 
                    alt="Sonidec Audio Experience"
                    className="absolute inset-0 w-full h-full object-cover animate-pulse-slow" 
                />
                
                <div className="relative z-20 text-white p-12 text-center">
                    <h2 className="text-4xl font-bold mb-4 tracking-tight">Sonido que define tu espacio.</h2>
                    <p className="text-gray-300 text-lg">Bienvenido al panel de control de Sonidec.</p>
                </div>
            </div>

            {/* SECCIÓN DERECHA: FORMULARIO */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white p-8 sm:p-12 lg:p-24">
                <div className="w-full max-w-md space-y-8">
                    
                    {/* ENCABEZADO DEL FORMULARIO */}
                    <div className="text-center">
                        {/* Aquí iría tu logo */}
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                        </div>
                        <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
                            ¡Hola de nuevo!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Ingresa a tu cuenta para gestionar la tienda.
                        </p>
                    </div>

                    {status && <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 text-center">{status}</div>}

                    <form onSubmit={submit} className="mt-8 space-y-6">
                        <div className="rounded-md shadow-sm space-y-4">
                            
                            {/* CAMPO EMAIL */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Correo Electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
                                    placeholder="admin@sonidec.com"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* CAMPO PASSWORD */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>
                        </div>

                        {/* RECORDAR Y OLVIDÉ CONTRASEÑA */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <label className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-600 cursor-pointer">Recordarme</span>
                                </label>
                            </div>

                            {canResetPassword && (
                                <div className="text-sm">
                                    <Link
                                        href={route('password.request')}
                                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* BOTÓN SUBMIT */}
                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </span>
                                ) : (
                                    "Ingresar al Dashboard"
                                )}
                            </button>
                        </div>
                    </form>
                    
                    {/* FOOTER */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            © 2026 Sonidec. Sistema de Gestión Interna.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}