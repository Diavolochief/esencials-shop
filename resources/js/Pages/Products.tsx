import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Grid, Typography, Card, CardMedia, CardContent, Box, Paper } from '@mui/material';
import { Heart } from 'lucide-react';

// Este componente recibe los "products" directamente desde tu ProductController de Laravel
export default function Products({ products }: { products: any }) {
  return (
    <MainLayout>
      <Head title="Productos" />
      <Typography variant="h4" gutterBottom fontWeight={800}>Explorar</Typography>
      
      <Grid container spacing={3}>
        {products.data.map((product: any) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ height: '100%', position: 'relative', borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                    <Paper sx={{ px: 1.5, py: 0.5, borderRadius: 4, fontWeight: 700, fontSize: '0.75rem' }}>{product.status}</Paper>
                </Box>
                <CardMedia component="img" height="260" image={product.image} alt={product.name} />
                <CardContent>
                    <Typography variant="h6" fontWeight={700}>{product.name}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="h6" color="primary">${product.price}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Heart size={16} /> <Typography variant="caption">{product.likes}</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </MainLayout>
  );
}