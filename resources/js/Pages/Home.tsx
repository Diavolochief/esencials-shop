import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { 
    Grid, Typography, Card, CardMedia, CardContent, 
    Box, Paper, Container, Button, Chip 
} from '@mui/material';
import { Heart, ShoppingCart, ArrowRight } from 'lucide-react';

// --- IMPORTACIONES DEL CARRUSEL (SWIPER) ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function Home({ products }) {

    // 1. DEFINIMOS LOS SLIDES AQUÍ (DATOS ESTÁTICOS)
    // Esto soluciona el error "slides is undefined".
    const localSlides = [
        { 
            id: 1, 
            title: "Nueva Colección 2026", 
            subtitle: "Tecnología y Estilo.", 
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop" 
        },
        { 
            id: 2, 
            title: "Ofertas de Temporada", 
            subtitle: "Hasta 50% de descuento.", 
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop" 
        },
    ];

    return (
        <MainLayout>
            <Head title="Inicio" />

            {/* --- SECCIÓN 1: CARRUSEL (Hero) --- */}
            <Box sx={{ width: '100%', height: { xs: '50vh', md: '70vh' }, mb: 6, position: 'relative' }}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay, EffectFade]}
                    effect={'fade'}
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000 }}
                    style={{ width: '100%', height: '100%' }}
                >
                    {localSlides.map((slide) => (
                        <SwiperSlide key={slide.id}>
                            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                                {/* Imagen de Fondo Oscurecida */}
                                <Box 
                                    component="img"
                                    src={slide.image}
                                    alt={slide.title}
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
                                />
                                {/* Texto sobre la imagen */}
                                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 2 }}>
                                    <Box>
                                        <Typography variant="h2" component="h1" sx={{ color: 'white', fontWeight: 900, mb: 2, fontSize: { xs: '2.5rem', md: '4rem' } }}>
                                            {slide.title}
                                        </Typography>
                                        <Typography variant="h5" sx={{ color: 'grey.300', mb: 4 }}>
                                            {slide.subtitle}
                                        </Typography>
                                        <Button variant="contained" size="large" endIcon={<ArrowRight />} sx={{ borderRadius: 50, px: 4, py: 1.5, fontWeight: 'bold' }}>
                                            Ver Catálogo
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>

            {/* --- SECCIÓN 2: GRID DE PRODUCTOS --- */}
            <Container maxWidth="xl" sx={{ mb: 8 }}>
                <Typography variant="h4" gutterBottom fontWeight={800} sx={{ mb: 4 }}>
                    Explorar Productos
                </Typography>
                
                <Grid container spacing={3}>
                    {/* Verificamos que existan productos antes de mapear para evitar errores */}
                    {products && products.data && products.data.length > 0 ? (
                        products.data.map((product) => (
                            <Grid item xs={12} sm={6} md={3} key={product.id}>
                                <Link href={route('product.show', product.id)} style={{ textDecoration: 'none' }}>
                                    <Card sx={{ 
                                        height: '100%', 
                                        position: 'relative', 
                                        borderRadius: 4, 
                                        boxShadow: 'none', 
                                        border: '1px solid #e2e8f0',
                                        transition: 'all 0.3s ease',
                                        '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }
                                    }}>
                                        {/* Badge de Estado/Nuevo */}
                                        {product.status && (
                                            <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
                                                <Chip label={product.status} size="small" color="primary" sx={{ fontWeight: 700 }} />
                                            </Box>
                                        )}
                                        
                                        <CardMedia 
                                            component="img" 
                                            height="280" 
                                            image={product.image || product.image_url || 'https://via.placeholder.com/300'} 
                                            alt={product.name}
                                            sx={{ bgcolor: '#f1f5f9' }} 
                                        />
                                        
                                        <CardContent>
                                            <Typography variant="body1" fontWeight={700} noWrap sx={{ mb: 1 }}>
                                                {product.name}
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="h6" fontWeight={800} color="primary.main">
                                                    ${product.price}
                                                </Typography>
                                                
                                                {/* Botón visual de Like (sin funcionalidad por ahora) */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 0.5 }}>
                                                    <Heart size={18} />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                                <Typography color="text.secondary">No hay productos disponibles por el momento.</Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>

        </MainLayout>
    );
}