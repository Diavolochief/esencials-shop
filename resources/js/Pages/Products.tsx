import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react'; // Importar router
import { Grid, Typography, Card, CardMedia, CardContent, Box, Paper, Button, Chip, Stack } from '@mui/material';
import { Heart, X } from 'lucide-react';

// Recibimos 'categories' y 'filters' del controlador
export default function Products({ products, categories, filters }) {
  
  const searchTerm = filters?.search;
  const currentCategory = filters?.category_id; // ID de la categoría seleccionada actualmente

  // Función para filtrar al dar clic
  const handleCategoryFilter = (categoryId) => {
      router.get(route('catalogo.index'), { 
          search: searchTerm, // Mantenemos la búsqueda si existe
          category_id: categoryId // Agregamos la categoría
      }, { preserveState: true });
  };

  // Función para limpiar filtros
  const clearFilters = () => {
      router.get(route('catalogo.index'));
  };

  return (
    <MainLayout>
      <Head title="Catálogo de Productos" />
      
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" fontWeight={800}>
                {searchTerm ? `Resultados: "${searchTerm}"` : 'Explorar Catálogo'}
            </Typography>
            
            {(searchTerm || currentCategory) && (
                <Button 
                    startIcon={<X size={16}/>} 
                    color="error" 
                    onClick={clearFilters}
                    size="small"
                >
                    Limpiar Filtros
                </Button>
            )}
        </Box>

        {/* --- BARRA DE CATEGORÍAS (BOTONES DE FILTRO) --- */}
        <Box sx={{ overflowX: 'auto', py: 1, display: 'flex', gap: 1, '::-webkit-scrollbar': { display: 'none' } }}>
            {/* Botón "Todas" */}
            <Chip 
                label="Todas" 
                clickable 
                color={!currentCategory ? "primary" : "default"} 
                variant={!currentCategory ? "filled" : "outlined"}
                onClick={() => handleCategoryFilter(null)}
                sx={{ fontWeight: 'bold' }}
            />

            {/* Lista de Categorías desde la Base de Datos */}
            {categories.map((cat) => (
                <Chip 
                    key={cat.id} 
                    label={cat.name} 
                    clickable 
                    color={Number(currentCategory) === cat.id ? "primary" : "default"} 
                    variant={Number(currentCategory) === cat.id ? "filled" : "outlined"}
                    onClick={() => handleCategoryFilter(cat.id)}
                    sx={{ fontWeight: 'bold' }}
                />
            ))}
        </Box>
      </Box>
      
      {/* --- GRID DE PRODUCTOS --- */}
      <Grid container spacing={3}>
        {products.data.length > 0 ? (
            products.data.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Link href={route('product.show', product.id)} style={{ textDecoration: 'none' }}>
                    <Card sx={{ 
                        height: '100%', 
                        position: 'relative', 
                        borderRadius: 3, 
                        boxShadow: 'none', 
                        border: '1px solid #e2e8f0',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
                    }}>
                        {/* Estado */}
                        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
                            <Paper sx={{ px: 1.5, py: 0.5, borderRadius: 4, fontWeight: 700, fontSize: '0.75rem', bgcolor: 'rgba(255,255,255,0.9)' }}>
                                {product.condition || 'Nuevo'}
                            </Paper>
                        </Box>

                        <CardMedia 
                            component="img" 
                            height="260" 
                            image={product.image_url || 'https://via.placeholder.com/300'} 
                            alt={product.name} 
                            sx={{ objectFit: 'cover', bgcolor: '#f1f5f9' }}
                        />

                        <CardContent>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                {product.category ? product.category.name : 'General'}
                            </Typography>
                            <Typography variant="h6" fontWeight={700} noWrap title={product.name}>
                                {product.name}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
                                <Typography variant="h6" color="primary.main" fontWeight={800}>
                                    ${Number(product.price).toLocaleString()}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
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
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'transparent', border: '2px dashed #e2e8f0' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay productos en esta categoría.
                    </Typography>
                    <Button variant="outlined" onClick={clearFilters}>
                        Ver todos los productos
                    </Button>
                </Paper>
            </Grid>
        )}
      </Grid>
    </MainLayout>
  );
}