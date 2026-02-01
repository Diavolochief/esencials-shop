import React from 'react';
import { Head, Link, router } from '@inertiajs/react'; // <--- IMPORTANTE: router
import MainLayout from '@/Layouts/MainLayout';
import HeroCarousel from '@/Components/HeroCarousel'; 
import {
  Box, Container, Typography, Grid, Card, CardMedia, CardContent,
  Rating, Pagination, Chip, Stack, IconButton, Tooltip
} from '@mui/material';
import { Trophy, TrendingUp, ShoppingCart } from 'lucide-react';

export default function Home({ products, banners, bestSellerCount }) {
  
  const handlePageChange = (event, value) => {
    router.get(route('home'), { page: value }, { preserveState: true });
  };

  // Función para agregar al carrito sin entrar al producto
  const addToCart = (e, productId) => {
    e.preventDefault(); // <--- EVITA QUE TE LLEVE AL DETALLE
    router.post(route('cart.add', productId), {}, {
        preserveScroll: true
    });
  };

  return (
    <MainLayout>
      <Head title="Inicio" />
      <Container maxWidth="lg">
        
        {/* CARRUSEL */}
        <HeroCarousel banners={banners} /> 

        {/* Banner Texto */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="800" gutterBottom>
            Los Favoritos de la Temporada
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Descubre lo que todos están comprando
          </Typography>
        </Box>

        {/* GRID DE PRODUCTOS (3x1) */}
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