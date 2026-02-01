import React, { useState } from 'react';
import { Head, usePage, router, useForm } from '@inertiajs/react'; // <--- Router y useForm
import MainLayout from '@/Layouts/MainLayout';
import {
    Box, Container, Grid, Typography, Button, Rating, Chip,
    Avatar, TextField, Divider, Paper, IconButton
} from '@mui/material';
import { ShoppingCart, Check, Star } from 'lucide-react';

export default function Show({ product, canReview }) {
    const { auth } = usePage().props;
    const [selectedImage, setSelectedImage] = useState(product.image_url);

    // Formulario para Reviews
    const { data, setData, post, processing, reset, errors } = useForm({
        rating: 5,
        comment: ''
    });

    // Acción: Agregar al Carrito
    const handleAddToCart = () => {
        router.post(route('cart.add', product.id), {}, {
            preserveScroll: true
        });
    };

    // Acción: Enviar Review
    const submitReview = (e) => {
        e.preventDefault();
        post(route('product.review.store', product.id), {
            onSuccess: () => reset()
        });
    };

    return (
        <MainLayout>
            <Head title={product.name} />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                
                <Grid container spacing={6}>
                    
                    {/* --- COLUMNA IZQUIERDA: IMÁGENES --- */}
                    <Grid item xs={12} md={6}>
                        {/* Imagen Principal */}
                        <Box sx={{ 
                            height: 500, bgcolor: '#f8fafc', borderRadius: 4, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid #e2e8f0', mb: 2, overflow: 'hidden'
                        }}>
                            <img 
                                src={selectedImage} 
                                alt={product.name} 
                                style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }} 
                            />
                        </Box>
                        
                        {/* Galería Miniaturas */}
                        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                            {/* Foto principal en miniatura */}
                            <Box 
                                onClick={() => setSelectedImage(product.image_url)}
                                sx={{ 
                                    width: 80, height: 80, borderRadius: 2, border: selectedImage === product.image_url ? '2px solid #0f172a' : '1px solid #e2e8f0',
                                    cursor: 'pointer', overflow: 'hidden', p: 1
                                }}
                            >
                                <img src={product.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                            
                            {/* Fotos extra */}
                            {product.images && product.images.map((img) => (
                                <Box 
                                    key={img.id}
                                    onClick={() => setSelectedImage(img.image_url)}
                                    sx={{ 
                                        width: 80, height: 80, borderRadius: 2, border: selectedImage === img.image_url ? '2px solid #0f172a' : '1px solid #e2e8f0',
                                        cursor: 'pointer', overflow: 'hidden', p: 1
                                    }}
                                >
                                    <img src={img.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* --- COLUMNA DERECHA: INFO --- */}
                    <Grid item xs={12} md={6}>
                        <Chip label={product.condition === 'nuevo' ? 'Nuevo / Etiqueta' : 'Usado / Buen Estado'} color="primary" size="small" variant="outlined" sx={{ mb: 2, textTransform: 'capitalize' }} />
                        
                        <Typography variant="h3" fontWeight="800" sx={{ mb: 2, lineHeight: 1.2 }}>
                            {product.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Rating value={Math.round(product.reviews_avg_rating || 0)} readOnly precision={0.5} />
                            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'underline' }}>
                                {product.reviews_count} opiniones
                            </Typography>
                        </Box>

                        <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
                            ${product.price}
                        </Typography>

                        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.8 }}>
                            {product.description || "Sin descripción disponible para este artículo."}
                        </Typography>

                        <Divider sx={{ mb: 4 }} />

                        {/* Botones de Acción */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                variant="contained" 
                                size="large" 
                                fullWidth
                                startIcon={<ShoppingCart />}
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                sx={{ py: 2, borderRadius: 2, fontSize: '1.1rem' }}
                            >
                                {product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
                            </Button>
                        </Box>

                        {/* Info Extra */}
                        <Box sx={{ mt: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Check size={18} color="#16a34a" />
                                <Typography variant="body2">Stock disponible: {product.stock} unidades</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Check size={18} color="#16a34a" />
                                <Typography variant="body2">Envío seguro garantizado</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                {/* --- SECCIÓN DE RESEÑAS --- */}
                <Box sx={{ mt: 8, mb: 8 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>Opiniones de Clientes</Typography>
                    
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={5}>
                             {/* Formulario de Reseña */}
                             {canReview ? (
                                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc' }} elevation={0}>
                                    <Typography fontWeight="bold" sx={{ mb: 2 }}>Escribe una reseña</Typography>
                                    <form onSubmit={submitReview}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography component="legend" variant="caption">Tu calificación</Typography>
                                            <Rating 
                                                name="rating" 
                                                value={data.rating} 
                                                onChange={(event, newValue) => setData('rating', newValue)} 
                                            />
                                        </Box>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder="¿Qué te pareció el producto?"
                                            value={data.comment}
                                            onChange={e => setData('comment', e.target.value)}
                                            sx={{ mb: 2, bgcolor: 'white' }}
                                        />
                                        <Button type="submit" variant="contained" disabled={processing}>
                                            Publicar Opinión
                                        </Button>
                                    </form>
                                </Paper>
                             ) : (
                                !auth.user ? (
                                    <Typography color="text.secondary">Inicia sesión para dejar una opinión.</Typography>
                                ) : (
                                    <Typography color="text.secondary">Ya has opinado sobre este producto o no cumples los requisitos.</Typography>
                                )
                             )}
                        </Grid>

                        <Grid item xs={12} md={7}>
                             {/* Lista de Reseñas */}
                             {product.reviews && product.reviews.length > 0 ? (
                                 product.reviews.map((review) => (
                                     <Box key={review.id} sx={{ mb: 3, borderBottom: '1px solid #f1f5f9', pb: 3 }}>
                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                             <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                                                 {review.user?.name.charAt(0)}
                                             </Avatar>
                                             <Typography fontWeight="bold" variant="subtitle2">
                                                 {review.user?.name}
                                             </Typography>
                                             <Rating value={review.rating} readOnly size="small" />
                                         </Box>
                                         <Typography variant="body2" color="text.secondary">
                                             {review.comment}
                                         </Typography>
                                     </Box>
                                 ))
                             ) : (
                                 <Typography color="text.secondary" fontStyle="italic">Aún no hay opiniones. ¡Sé el primero!</Typography>
                             )}
                        </Grid>
                    </Grid>
                </Box>

            </Container>
        </MainLayout>
    );
}