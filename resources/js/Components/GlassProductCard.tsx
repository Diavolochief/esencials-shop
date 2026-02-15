import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function GlassProductCard({ product }) {
    // Paleta Pantone simulada con Tailwind
    const pantoneAccent = "bg-rose-500 hover:bg-rose-600"; // Un coral vibrante

    return (
        <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            
            {/* --- EFECTO GLASSMORPHISM --- */}
            {/* bg-white/10: Fondo blanco al 10% de opacidad.
               backdrop-blur-lg: El truco mágico, desenfoca lo que hay detrás.
               border-white/20: Un borde sutil y translúcido.
            */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl z-0"></div>

            {/* --- CONTENIDO DE LA CARD (Encima del vidrio) --- */}
            <div className="relative z-10 p-5 h-full flex flex-col">
                
                {/* Imagen del producto */}
                <div className="relative h-52 w-full rounded-xl overflow-hidden mb-4 bg-black/20">
                     {/* Badge de "Nuevo" con color sólido */}
                    {product.isNew && (
                        <span className={`absolute top-3 left-3 ${pantoneAccent} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider z-20`}>
                            Nuevo
                        </span>
                    )}
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </div>

                {/* Info */}
                <div className="flex-grow flex flex-col justify-between">
                    <div>
                        {/* Categoría en color sólido suave */}
                        <p className="text-indigo-300 text-sm font-medium mb-1 uppercase tracking-wide">
                            {product.category}
                        </p>
                        {/* Título en blanco para contraste */}
                        <h3 className="text-white text-xl font-bold leading-tight mb-2 line-clamp-2">
                            {product.name}
                        </h3>
                    </div>

                    {/* Precio y Botón */}
                    <div className="flex items-center justify-between mt-4">
                         <span className="text-2xl font-extrabold text-white">
                            ${product.price}
                         </span>
                         
                         {/* Botón con color SÓLIDO Pantone para que resalte sobre el vidrio */}
                         <button className={`${pantoneAccent} text-white p-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center`}>
                            <ShoppingCart size={20} />
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
}