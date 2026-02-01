import React, { useState } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
  Box, Container, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, InputAdornment, Avatar, Grid, Divider, Switch, FormControlLabel
} from '@mui/material';
import { Plus, Edit, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProductIndex({ products = [] }) {
  const { auth } = usePage().props;
  
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]); 
  const [existingGallery, setExistingGallery] = useState([]); 

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    price: '',
    stock: 1,
    condition: 'nuevo',
    description: '',
    image: null,     
    gallery: [],     
  });

  // Helper para forzar Z-Index alto en alertas
  const highZIndex = {
    didOpen: () => {
        const container = Swal.getContainer();
        if(container) container.style.zIndex = '99999';
    }
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setEditingId(null);
    setMainPreview(null);
    setGalleryPreviews([]);
    setExistingGallery([]);
    reset();
    setOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditMode(true);
    setEditingId(product.id);
    setData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      condition: product.condition,
      description: product.description || '',
      image: null, 
      gallery: [],
    });
    setMainPreview(product.image_url);
    setExistingGallery(product.images || []); 
    setGalleryPreviews([]);
    setOpen(true);
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('image', file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCurrent = existingGallery.length + galleryPreviews.length + files.length;
    
    if (totalCurrent > 8) {
        Swal.fire({
            icon: 'warning',
            title: 'Límite alcanzado',
            text: 'Solo puedes tener un máximo de 8 fotos en la galería.',
            confirmButtonColor: '#f59e0b',
            ...highZIndex // <--- FIX Z-INDEX
        });
        return;
    }

    setData('gallery', [...data.gallery, ...files]);
    const newPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name
    }));
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
  };

  const handleDeleteExistingImage = (imageId) => {
    Swal.fire({
        title: '¿Borrar imagen?',
        text: "Se eliminará permanentemente de la galería.",
        icon: 'error',
        iconColor: '#ef4444',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar',
        ...highZIndex // <--- FIX Z-INDEX (Porque sale sobre el Modal)
    }).then((result) => {
        if (result.isConfirmed) {
            router.delete(route('product.image.delete', imageId), {
                preserveScroll: true,
                onSuccess: () => {
                    setExistingGallery(prev => prev.filter(img => img.id !== imageId));
                }
            });
        }
    });
  };

  const handleRemoveNewImage = (index) => {
    const newGallery = [...data.gallery];
    newGallery.splice(index, 1); 
    setData('gallery', newGallery);
    const newPreviews = [...galleryPreviews];
    newPreviews.splice(index, 1); 
    setGalleryPreviews(newPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // VALIDACIÓN DE IMAGEN CON Z-INDEX CORREGIDO
    if (!editMode && !data.image) {
        Swal.fire({
            icon: 'warning',
            title: 'Falta la imagen',
            text: 'Debes subir una foto de portada para publicar el producto.',
            confirmButtonColor: '#f59e0b',
            ...highZIndex // <--- ESTO SOLUCIONA TU PROBLEMA
        });
        return; 
    }

    if (editMode) {
      router.post(route('products.update', editingId), {
        _method: 'post', 
        ...data,
        image: data.image,
        gallery: data.gallery 
      }, { onSuccess: () => setOpen(false) });
    } else {
      post(route('products.store'), { onSuccess: () => { setOpen(false); reset(); } });
    }
  };

  const handleToggleStatus = (id) => {
    router.put(route('products.toggle', id), {}, { preserveScroll: true });
  };

  const handleDelete = (id) => {
    Swal.fire({
        title: '¿Eliminar producto?',
        text: "Esta acción no se puede deshacer.",
        icon: 'error',
        iconColor: '#ef4444',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        ...highZIndex 
    }).then((result) => {
        if (result.isConfirmed) {
            router.delete(route('products.destroy', id));
        }
    });
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <MainLayout>
      <Head title="Mis Productos" />
      <Container maxWidth={false} sx={{ maxWidth: '1600px', mx: 'auto' }}>
        
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="800">Mis Productos</Typography>
            <Typography variant="body1" color="text.secondary">Gestión de inventario y estado.</Typography>
          </Box>
          <Button variant="contained" startIcon={<Plus size={20} />} onClick={handleOpenCreate} sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 'bold' }}>
            Nuevo Producto
          </Button>
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Foto</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Precio</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id} hover sx={{ opacity: product.is_active ? 1 : 0.6 }}>
                      <TableCell>
                        <Avatar variant="rounded" src={product.image_url} sx={{ width: 50, height: 50, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                           <ImageIcon size={20} color="#94a3b8" />
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={700}>{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: #{product.id}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                            label={product.stock} 
                            color={product.stock > 0 ? "default" : "error"} 
                            variant="outlined" 
                            size="small" 
                        />
                      </TableCell>
                      <TableCell><Typography fontWeight={600}>{formatCurrency(product.price)}</Typography></TableCell>
                      <TableCell>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={Boolean(product.is_active)} 
                                    onChange={() => handleToggleStatus(product.id)} 
                                    color="success"
                                    size="small"
                                />
                            }
                            label={
                                <Chip 
                                    label={product.is_active ? "Activo" : "Cancelado"} 
                                    color={product.is_active ? "success" : "default"} 
                                    size="small"
                                    sx={{ fontWeight: 'bold', width: 80 }}
                                />
                            }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(product)}>
                            <Edit size={18} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(product.id)}>
                            <Trash2 size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}>No tienes productos.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight="bold" sx={{ borderBottom: '1px solid #e2e8f0', px: 3, py: 2, textAlign: 'center' }}>
            {editMode ? 'Editar Producto' : 'Publicar Nuevo Producto'}
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ maxWidth: '1000px', mx: 'auto' }}> 
                
                {/* ZONA DE IMÁGENES */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>Multimedia</Typography>
                    <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'center', alignItems: 'flex-start' }}>
                        
                        {/* FOTO PRINCIPAL */}
                        <Box sx={{ flex: 1, maxWidth: '400px', width: '100%' }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'block', textAlign: 'center' }}>FOTO DE PORTADA</Typography>
                            <Box sx={{ position: 'relative', width: '100%', height: 280, borderRadius: 3, overflow: 'hidden', border: `1px dashed ${errors.image ? '#ef4444' : '#cbd5e1'}`, bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {mainPreview ? (
                                    <img src={mainPreview} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <ImageIcon size={48} opacity={0.3} />
                                )}
                                <Button variant="contained" component="label" size="small" sx={{ position: 'absolute', bottom: 12, right: 12 }}>
                                    Cambiar <input hidden accept="image/*" type="file" onChange={handleMainImageChange} />
                                </Button>
                            </Box>
                            {errors.image && <Typography variant="caption" color="error" align="center" display="block">{errors.image}</Typography>}
                        </Box>

                        {/* GALERÍA */}
                        <Box sx={{ flex: 1.5, width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" fontWeight="bold">GALERÍA ADICIONAL</Typography>
                                <Typography variant="caption" color="text.secondary">{existingGallery.length + galleryPreviews.length} / 8 Fotos</Typography>
                            </Box>
                            <Paper variant="outlined" sx={{ p: 2, height: 280, overflowY: 'auto', bgcolor: '#fafafa', borderRadius: 3 }}>
                                <Grid container spacing={2}>
                                    {(existingGallery.length + galleryPreviews.length) < 8 && (
                                        <Grid item xs={4} sm={3}>
                                            <Button component="label" sx={{ width: '100%', height: 80, border: '2px dashed #e2e8f0', borderRadius: 2, display: 'flex', flexDirection: 'column', bgcolor: 'white', '&:hover': { borderColor: 'primary.main', bgcolor: '#f0f9ff' } }}>
                                                <Plus size={24} color="#94a3b8" />
                                                <Typography fontSize={10} color="text.secondary">Añadir</Typography>
                                                <input hidden accept="image/*" type="file" multiple onChange={handleGalleryChange} />
                                            </Button>
                                        </Grid>
                                    )}
                                    {existingGallery.map((img) => (
                                        <Grid item xs={4} sm={3} key={img.id} sx={{ position: 'relative' }}>
                                            <Avatar variant="rounded" src={img.image_url} sx={{ width: '100%', height: 80, border: '1px solid #e2e8f0', borderRadius: 2 }} />
                                            <IconButton size="small" onClick={() => handleDeleteExistingImage(img.id)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', width: 24, height: 24, '&:hover': { bgcolor: 'error.dark' } }}>
                                                <X size={14} />
                                            </IconButton>
                                        </Grid>
                                    ))}
                                    {galleryPreviews.map((img, index) => (
                                        <Grid item xs={4} sm={3} key={index} sx={{ position: 'relative' }}>
                                            <Avatar variant="rounded" src={img.url} sx={{ width: '100%', height: 80, border: '2px solid #3b82f6', borderRadius: 2 }} />
                                            <IconButton size="small" onClick={() => handleRemoveNewImage(index)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'grey.800', color: 'white', width: 24, height: 24, '&:hover': { bgcolor: 'black' } }}>
                                                <X size={14} />
                                            </IconButton>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>Detalles del Producto</Typography>
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} md={6}>
                        <TextField 
                            label="Nombre del Producto" fullWidth 
                            value={data.name} onChange={e => setData('name', e.target.value)} 
                            error={!!errors.name} helperText={errors.name}
                            sx={{ mb: 3 }}
                        />
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <TextField 
                                label="Precio" type="number" fullWidth 
                                value={data.price} onChange={e => setData('price', e.target.value)} 
                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
                                error={!!errors.price} helperText={errors.price}
                            />
                            <TextField 
                                label="Stock" type="number" fullWidth 
                                value={data.stock} onChange={e => setData('stock', e.target.value)} 
                                error={!!errors.stock} helperText={errors.stock}
                            />
                        </Box>
                        <TextField 
                            select label="Condición" fullWidth 
                            value={data.condition} onChange={e => setData('condition', e.target.value)}
                        >
                            <MenuItem value="nuevo">Nuevo / Etiqueta</MenuItem>
                            <MenuItem value="bueno">Buen Estado</MenuItem>
                            <MenuItem value="usado">Usado / Detalles</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            label="Descripción detallada" multiline rows={6} fullWidth 
                            value={data.description} onChange={e => setData('description', e.target.value)} 
                        />
                    </Grid>
                </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc', justifyContent: 'center' }}>
            <Button onClick={() => setOpen(false)} color="inherit" size="large" sx={{ mr: 2 }}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={processing} size="large" sx={{ px: 5, borderRadius: 2 }}>
                {editMode ? 'Guardar Cambios' : 'Publicar Producto'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </MainLayout>
  );
}