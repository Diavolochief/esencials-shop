import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
// import HeroCarousel from '@/Components/HeroCarousel'; // <--- YA NO LO NECESITAMOS
import {
  Box, Container, Typography, Grid, Card, CardMedia, CardContent,
  Rating, Pagination, Chip, Stack, IconButton, Tooltip, Button
} from '@mui/material';
import { Trophy, TrendingUp, ShoppingCart, ArrowRight } from 'lucide-react';

// --- IMPORTACIONES DE SWIPER (CARRUSEL NUEVO) ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as SwiperPagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function Home({ products, banners, bestSellerCount }) {
  
  // --- DATOS PARA EL CARRUSEL VISUAL (Puedes usar 'banners' si prefieres) ---
  const slides = banners
  const handlePageChange = (event, value) => {
    router.get(route('home'), { page: value }, { preserveState: true });
  };

  // Función para agregar al carrito sin entrar al producto
  const addToCart = (e, productId) => {
    e.preventDefault();
    router.post(route('cart.add', productId), {}, {
        preserveScroll: true
    });
  };

  return (
    <MainLayout>
      <Head title="Inicio" />
      
      {/* CARRUSEL FULL WIDTH (PANTALLA COMPLETA) 
         Nota: Lo ponemos fuera del Container principal para que ocupe todo el ancho,
         o usamos un Box con width: 100vw si estamos obligados a estar dentro.
         En este caso, renderizamos ANTES del Container de productos.
      */}
      <Box sx={{ 
          width: '100%', 
          height: '85vh', 
          position: 'relative', 
          bgcolor: '#0f172a', 
          overflow: 'hidden',
          mb: 6 // Margen inferior para separar de los productos
      }}>
        <Swiper
            modules={[Navigation, SwiperPagination, Autoplay, EffectFade]}
            effect={'fade'}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            style={{ width: '100%', height: '100%' }}
        >
            {/* Si prefieres usar tus 'banners' de la BD, cambia 'slides' por 'banners' abajo */}
            {slides.map((slide) => (
                <SwiperSlide key={slide.id}>
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        {/* IMAGEN DE FONDO */}
                        <Box 
                            component="img"
                            src={slide.img} // Si usas banners: banner.image_url
                            alt={slide.title}
                            sx={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                                filter: 'brightness(0.5)' // Oscurecer para leer texto
                            }} 
                        />
                        
                        {/* TEXTO SOBRE LA IMAGEN */}
                        <Box sx={{ 
                            position: 'absolute', 
                            inset: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            textAlign: 'center',
                            px: 2
                        }}>
                            <Box sx={{ maxWidth: 'md' }}>
                                <Typography 
                                    variant="h2" 
                                    component="h1" 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 900, 
                                        mb: 2,
                                        fontSize: { xs: '2.5rem', md: '4.5rem' },
                                        textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    {slide.title}
                                </Typography>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        color: 'grey.300', 
                                        mb: 4,
                                        fontWeight: 300 
                                    }}
                                >
                                    {slide.subtitle}
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    color="error" // O el color que prefieras (secondary/primary)
                                    endIcon={<ArrowRight size={20}/>}
                                    sx={{ 
                                        borderRadius: 50, 
                                        px: 5, 
                                        py: 1.5, 
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    Ver Colección
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </SwiperSlide>
            ))}
        </Swiper>
      </Box>

      {/* CONTENEDOR PARA EL RESTO DE LA PÁGINA (Grid de productos) */}
      <Container maxWidth="lg">
        
        {/* Banner Texto */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="800" gutterBottom>
            Los Favoritos de la Temporada
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Descubre lo que todos están comprando
          </Typography>
        </Box>

        {/* GRID DE PRODUCTOS (3x1) - ESTO SIGUE IGUAL */}
        <Grid container spacing={4} justifyContent="center">
          {products.data.map((product) => {
            
            const isBestSeller = bestSellerCount > 0 && product.sold_count === bestSellerCount;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                {/* Enlace al detalle */}
                <Link href={route('product.show', product.id)} style={{ textDecoration: 'none' }}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%', 
                      border: isBestSeller ? '2px solid #eab308' : '1px solid #e2e8f0', 
                      borderRadius: 4,
                      position: 'relative',
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }
                    }}
                  >
                    {/* BADGE DE MÁS VENDIDO */}
                    {isBestSeller && (
                        <Chip 
                            icon={<Trophy size={14} color="white" />}
                            label="MÁS VENDIDO" 
                            sx={{ 
                                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                                bgcolor: '#eab308', color: 'white', fontWeight: 'bold', zIndex: 10,
                                boxShadow: '0 4px 6px rgba(234, 179, 8, 0.4)'
                            }} 
                        />
                    )}

                    {/* IMAGEN */}
                    <Box sx={{ position: 'relative', height: 260, bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        image={product.image_url}
                        alt={product.name}
                        sx={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }}
                      />
                      
                      {/* BOTÓN RÁPIDO AGREGAR CARRITO (FLOTANTE) */}
                      <Tooltip title="Agregar al Carrito">
                          <IconButton 
                            onClick={(e) => addToCart(e, product.id)}
                            sx={{ 
                                position: 'absolute', 
                                bottom: 12, 
                                right: 12, 
                                bgcolor: 'primary.main', 
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' } 
                            }}
                          >
                            <ShoppingCart size={20} />
                          </IconButton>
                      </Tooltip>

                      {/* Chip de Condición */}
                      <Chip 
                          label={product.condition} 
                          size="small"
                          variant="outlined"
                          sx={{ position: 'absolute', top: 12, left: 12, textTransform: 'capitalize', bgcolor: 'rgba(255,255,255,0.9)' }} 
                      />
                    </Box>

                    {/* CONTENIDO */}
                    <CardContent sx={{ pb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold" noWrap color="text.primary" sx={{ maxWidth: '70%' }}>
                            {product.name}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                            ${product.price}
                        </Typography>
                      </Box>
                      
                      {/* RATING + VENTAS */}
                      <Stack spacing={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Rating 
                                value={Math.round(product.reviews_avg_rating || 0)} 
                                readOnly 
                                size="small" 
                                precision={0.5}
                            />
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mt: 0.2 }}>
                                ({product.reviews_count})
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUp size={16} color="#64748b" />
                            <Typography variant="body2" color="text.secondary" fontWeight="500">
                                {product.sold_count} vendidos
                            </Typography>
                          </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>

        {/* PAGINACIÓN */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
            <Pagination 
                count={products.last_page} 
                page={products.current_page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
                shape="rounded"
            />
        </Box>

      </Container>
    </MainLayout>
  );
}