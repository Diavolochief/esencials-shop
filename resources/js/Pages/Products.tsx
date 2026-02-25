import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Grid, Typography, Card, CardMedia, CardContent, Box, Paper, Button, Chip } from '@mui/material';
import { Heart, X, ShoppingBag } from 'lucide-react';

export default function Products({ products, categories, filters }) {
  
  const searchTerm = filters?.search;
  const currentCategory = filters?.category_id; 

  // Filtrar
  const handleCategoryFilter = (categoryId) => {
      router.get(route('catalogo.index'), { 
          search: searchTerm, 
          category_id: categoryId 
      }, { preserveState: true });
  };

  // Limpiar
  const clearFilters = () => {
      router.get(route('catalogo.index'));
  };

  return (
    <MainLayout>
      <Head title="Catálogo" />
      
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" fontWeight={800}>
                {searchTerm ? `Buscando: "${searchTerm}"` : 'Colección Completa'}
            </Typography>
            {(searchTerm || currentCategory) && (
                <Button startIcon={<X size={16}/>} color="error" onClick={clearFilters} size="small">
                    Limpiar Filtros
                </Button>
            )}
        </Box>

        {/* Chips de Categorías */}
        <Box sx={{ overflowX: 'auto', py: 1, display: 'flex', gap: 1, pb: 2 }}>
            <Chip 
                label="Todas" clickable 
                color={!currentCategory ? "primary" : "default"} 
                variant={!currentCategory ? "filled" : "outlined"}
                onClick={() => handleCategoryFilter(null)}
                sx={{ fontWeight: 'bold' }}
            />
            {categories.map((cat) => (
                <Chip 
                    key={cat.id} label={cat.name} clickable 
                    color={Number(currentCategory) === cat.id ? "primary" : "default"} 
                    variant={Number(currentCategory) === cat.id ? "filled" : "outlined"}
                    onClick={() => handleCategoryFilter(cat.id)}
                    sx={{ fontWeight: 'bold' }}
                />
            ))}
        </Box>
      </Box>
      
      {/* Grid de Productos */}
      <Grid container spacing={3}>
        {products.data.length > 0 ? (
            products.data.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Link href={route('product.show', product.id)} style={{ textDecoration: 'none' }}>
                    <Card sx={{ 
                        height: '100%', position: 'relative', borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0',
                        transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }
                    }}>
                        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
                            <Paper sx={{ px: 1.5, py: 0.5, borderRadius: 4, fontWeight: 700, fontSize: '0.75rem', bgcolor: 'rgba(255,255,255,0.9)' }}>
                                {product.condition}
                            </Paper>
                        </Box>
                        <CardMedia 
                            component="img" height="280" 
                            image={product.image_url || 'https://via.placeholder.com/300'} 
                            alt={product.name} sx={{ objectFit: 'cover', bgcolor: '#f1f5f9' }}
                        />
                        <CardContent>
                            <Typography variant="overline" color="text.secondary" fontWeight={700}>
                                {product.category ? product.category.name : 'General'}
                            </Typography>
                            <Typography variant="h6" fontWeight={800} noWrap sx={{ mb: 1 }}>{product.name}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                <Typography variant="h5" color="primary.main" fontWeight={900}>
                                    ${Number(product.price).toLocaleString()}
                                </Typography>
                                <ShoppingBag size={20} className="text-gray-400" />
                            </Box>
                        </CardContent>
                    </Card>
                </Link>
            </Grid>
            ))
        ) : (
            <Grid item xs={12}>
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1' }}>
                    <Typography color="text.secondary">No hay productos con estos filtros.</Typography>
                    <Button sx={{ mt: 2 }} onClick={clearFilters}>Ver todos</Button>
                </Paper>
            </Grid>
        )}
      </Grid>
    </MainLayout>
  );
}