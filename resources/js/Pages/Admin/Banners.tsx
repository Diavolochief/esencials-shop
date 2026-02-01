import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { Box, Container, Typography, Button, Paper, TextField, Grid, IconButton } from '@mui/material';
import { Upload, Trash2 } from 'lucide-react';

export default function AdminBanners({ banners }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    image: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.banners.store'), {
      onSuccess: () => reset()
    });
  };

  const handleDelete = (id) => {
    if(confirm('¿Borrar este banner?')) router.delete(route('admin.banners.destroy', id));
  };

  return (
    <MainLayout>
      <Head title="Configurar Banners" />
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Configuración del Sitio</Typography>
        
        {/* FORMULARIO DE SUBIDA */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Agregar Nuevo Banner</Typography>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <TextField 
                        label="Texto del Banner (Opcional)" fullWidth 
                        value={data.title} onChange={e => setData('title', e.target.value)} 
                    />
                    <Button variant="contained" component="label" startIcon={<Upload />} sx={{ height: 56, minWidth: 150 }}>
                        Imagen
                        <input hidden type="file" accept="image/*" onChange={e => setData('image', e.target.files[0])} />
                    </Button>
                </Box>
                {data.image && <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Archivo: {data.image.name}</Typography>}
                {errors.image && <Typography color="error">{errors.image}</Typography>}
                
                <Button type="submit" variant="contained" disabled={processing} fullWidth sx={{ mt: 2 }}>Subir Banner</Button>
            </form>
        </Paper>

        {/* LISTA DE BANNERS ACTIVOS */}
        <Typography variant="h6" sx={{ mb: 2 }}>Banners Activos</Typography>
        <Grid container spacing={2}>
            {banners.map((banner) => (
                <Grid item xs={12} key={banner.id}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                        <img src={banner.image_url} alt="Banner" style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                        <Typography sx={{ flexGrow: 1, fontWeight: 'bold' }}>{banner.title || "Sin título"}</Typography>
                        <IconButton color="error" onClick={() => handleDelete(banner.id)}><Trash2 /></IconButton>
                    </Paper>
                </Grid>
            ))}
        </Grid>
      </Container>
    </MainLayout>
  );
}