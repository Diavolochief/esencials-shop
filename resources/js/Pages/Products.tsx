import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Grid, Typography, Card, CardMedia, CardContent, 
    Box, Paper, Button, Chip, Container, useTheme, useMediaQuery,
    Rating // <-- Importamos Rating
} from '@mui/material';
import { X, ShoppingBag, Search } from 'lucide-react';

export default function Products({ products, categories, filters }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const searchTerm = filters?.search;
  const currentCategory = filters?.category_id; 

  const handleCategoryFilter = (categoryId) => {
      router.get(route('catalogo.index'), { search: searchTerm, category_id: categoryId }, { preserveState: true, preserveScroll: true });
  };

  const clearFilters = () => router.get(route('catalogo.index'));

  return (
    <MainLayout>
      <Head title="Catálogo" />
      
      {/* Envoltorio estricto de 350px en móvil, centrado, sin overflow */}
      <Box sx={{ 
          width: '100%', 
          maxWidth: { xs: '350px', sm: '100%' }, 
          mx: 'auto', 
          overflowX: 'hidden' 
      }}>
          <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 3, lg: 4 }, py: 4 }}>
              
              {/* Header y Filtros */}
              <Box sx={{ mb: { xs: 3, md: 4 } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, gap: 1 }}>
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} sx={{ color: '#1e293b' }}>
                        {searchTerm ? `Buscando: "${searchTerm}"` : 'Colección Completa'}
                    </Typography>
                    {(searchTerm || currentCategory) && (
                        <Button startIcon={<X size={16}/>} color="error" variant="outlined" onClick={clearFilters} size={isMobile ? "small" : "medium"} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                            Limpiar Filtros
                        </Button>
                    )}
                </Box>

                {/* Chips de Categorías */}
                <Box sx={{ overflowX: 'auto', display: 'flex', gap: 1, pb: 1, '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
                    <Chip label="Todas" clickable color={!currentCategory ? "primary" : "default"} variant={!currentCategory ? "filled" : "outlined"} onClick={() => handleCategoryFilter(null)} sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
                    {categories.map((cat) => (
                        <Chip key={cat.id} label={cat.name} clickable color={Number(currentCategory) === cat.id ? "primary" : "default"} variant={Number(currentCategory) === cat.id ? "filled" : "outlined"} onClick={() => handleCategoryFilter(cat.id)} sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
                    ))}
                </Box>
              </Box>
              
              {/* GRID DE PRODUCTOS */}
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                {products.data && products.data.length > 0 ? (
                    products.data.map((product) => (
                    <Grid item xs={6} sm={4} md={3} key={product.id}>
                        <Link href={route('product.show', product.id)} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                            <Card sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                position: 'relative', 
                                borderRadius: { xs: 2, sm: 3 }, 
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.2s ease',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)', borderColor: 'transparent' }
                            }}>
                                
                                {/* Etiqueta de condición */}
                                <Box sx={{ position: 'absolute', top: { xs: 6, sm: 12 }, left: { xs: 6, sm: 12 }, zIndex: 10 }}>
                                    <Paper sx={{ px: { xs: 1, sm: 1.5 }, py: { xs: 0.2, sm: 0.5 }, borderRadius: 4, fontWeight: 800, fontSize: { xs: '0.6rem', sm: '0.75rem' }, bgcolor: 'rgba(255,255,255,0.95)', color: 'primary.main', textTransform: 'uppercase' }}>
                                        {product.condition}
                                    </Paper>
                                </Box>
                                
                                {/* Imagen del producto */}
                                <Box sx={{ 
                                    bgcolor: '#f8fafc', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    p: { xs: 1, sm: 1.5 },
                                    height: { xs: '130px', sm: '180px', md: '220px' },
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}>
                                    <CardMedia 
                                        component="img" 
                                        sx={{ 
                                            height: '100%', 
                                            width: '100%', 
                                            objectFit: 'contain', 
                                            mixBlendMode: 'multiply' 
                                        }} 
                                        image={product.image_url || 'https://via.placeholder.com/300'} 
                                        alt={product.name} 
                                    />
                                </Box>

                                {/* Contenido y Textos */}
                                <CardContent sx={{ 
                                    p: { xs: 1.5, sm: 2 }, 
                                    flexGrow: 1, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'space-between', 
                                    '&:last-child': { pb: { xs: 1.5, sm: 2 } } 
                                }}>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ display: 'block', lineHeight: 1.1, mb: 0.5, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                                            {product.category ? product.category.name : 'General'}
                                        </Typography>
                                        
                                        <Typography variant="body2" fontWeight={800} sx={{ mb: 0.5, color: '#1e293b', fontSize: { xs: '0.8rem', sm: '1rem' }, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {product.name}
                                        </Typography>

                                        {/* 👉 ESTRELLAS DE CALIFICACIÓN */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                            <Rating 
                                                value={Number(product.reviews_avg_rating) || 0} 
                                                precision={0.5} 
                                                readOnly 
                                                sx={{ fontSize: { xs: '0.9rem', sm: '1.2rem' } }} 
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.8rem' }, mt: 0.3 }}>
                                                ({product.reviews_count || 0})
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                        <Typography variant="subtitle2" color="primary.main" fontWeight={900} sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                                            ${Number(product.price).toLocaleString()}
                                        </Typography>
                                        <Box sx={{ bgcolor: '#f1f5f9', borderRadius: '50%', p: { xs: 0.5, sm: 0.8 }, color: '#64748b', display: 'flex' }}>
                                            <ShoppingBag size={isMobile ? 14 : 18} />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 4 }}>
                            <Search size={isMobile ? 32 : 48} className="mx-auto text-gray-300 mb-2" />
                            <Typography variant={isMobile ? "subtitle1" : "h6"} color="text.secondary" fontWeight="bold">No hay productos con estos filtros.</Typography>
                            <Button variant="contained" sx={{ mt: 3, borderRadius: 2, fontWeight: 'bold' }} onClick={clearFilters}>
                                Ver todo el catálogo
                            </Button>
                        </Paper>
                    </Grid>
                )}
              </Grid>
          </Container>
      </Box>
    </MainLayout>
  );
}