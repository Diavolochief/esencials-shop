import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Box, Container, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    Button, Avatar, Grid, Divider
} from '@mui/material';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CartIndex({ cart, total }) {
    
    // Convertir objeto cart a array para mapear
    const cartItems = Object.values(cart);

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        router.patch(route('cart.update'), { id, quantity }, { preserveScroll: true });
    };

    const removeItem = (id) => {
        Swal.fire({
            title: '¿Eliminar?',
            text: "Se quitará el producto del carrito.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, quitar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('cart.remove'), { data: { id } });
            }
        });
    };

    const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

    return (
        <MainLayout>
            <Head title="Mi Carrito" />
            <Container maxWidth="lg">
                <Typography variant="h4" fontWeight="800" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ShoppingBag size={32} /> Mi Carrito
                </Typography>

                {cartItems.length > 0 ? (
                    <Grid container spacing={4}>
                        {/* TABLA DE PRODUCTOS */}
                        <Grid item xs={12} md={8}>
                            <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                <TableContainer>
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                            <TableRow>
                                                <TableCell>Producto</TableCell>
                                                <TableCell align="center">Cantidad</TableCell>
                                                <TableCell align="right">Total</TableCell>
                                                <TableCell align="right"></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {cartItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar src={item.image_url} variant="rounded" sx={{ width: 60, height: 60, border: '1px solid #eee' }} />
                                                            <Box>
                                                                <Typography fontWeight="bold" variant="subtitle2">{item.name}</Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Precio unitario: {formatCurrency(item.price)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, border: '1px solid #e2e8f0', borderRadius: 50, width: 'fit-content', mx: 'auto', px: 1, py: 0.5 }}>
                                                            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                                                <Minus size={14} />
                                                            </IconButton>
                                                            <Typography fontWeight="bold" sx={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                                                            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                                <Plus size={14} />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontWeight="bold">
                                                            {formatCurrency(item.price * item.quantity)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton color="error" onClick={() => removeItem(item.id)}>
                                                            <Trash2 size={18} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>

                        {/* RESUMEN DE COMPRA */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Resumen del Pedido</Typography>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="text.secondary">Subtotal</Typography>
                                    <Typography fontWeight="bold">{formatCurrency(total)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography color="text.secondary">Envío</Typography>
                                    <Typography color="success.main" fontWeight="bold">Gratis</Typography>
                                </Box>
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="h5" fontWeight="900">Total</Typography>
                                    <Typography variant="h5" fontWeight="900" color="primary">{formatCurrency(total)}</Typography>
                                </Box>

                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    size="large" 
                                    endIcon={<ArrowRight />}
                                    sx={{ borderRadius: 2, py: 1.5, fontSize: '1.1rem' }}
                                    onClick={() => Swal.fire('Próximamente', 'La pasarela de pago será el siguiente paso.', 'info')}
                                >
                                    Proceder al Pago
                                </Button>
                                
                                <Link href={route('home')} style={{ textDecoration: 'none' }}>
                                    <Button variant="text" fullWidth sx={{ mt: 2 }}>
                                        Seguir Comprando
                                    </Button>
                                </Link>
                            </Paper>
                        </Grid>
                    </Grid>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <ShoppingBag size={64} color="#cbd5e1" />
                        <Typography variant="h5" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>Tu carrito está vacío</Typography>
                        <Typography color="text.secondary" sx={{ mb: 4 }}>¿No sabes qué comprar? ¡Miles de productos te esperan!</Typography>
                        <Link href={route('home')}>
                            <Button variant="contained" size="large">Ir a la Tienda</Button>
                        </Link>
                    </Box>
                )}
            </Container>
        </MainLayout>
    );
}