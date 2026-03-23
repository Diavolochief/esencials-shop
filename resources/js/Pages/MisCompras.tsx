import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Box, Typography, Container, Paper, Grid, Chip, Button, 
    Avatar, Stepper, Step, StepLabel, Divider, useTheme, useMediaQuery,
    StepConnector, stepConnectorClasses, styled
} from '@mui/material';
import { 
    Package, Truck, CheckCircle, ExternalLink, 
    Clock, ShoppingBag, MapPin, ChevronRight 
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- ESTILO PERSONALIZADO PARA EL STEPPER ---
const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderTopWidth: 3,
        borderRadius: 1,
        borderColor: '#e2e8f0',
    },
}));

export default function MisCompras({ orders = [] }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const formatCurrency = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

    const steps = ['Pedido realizado', 'Preparando', 'En camino', 'Entregado'];

    // Normalizamos el estatus para que coincida (Laravel guarda en minúsculas a veces)
    const getActiveStep = (status) => {
        const s = status.toLowerCase();
        if (s === 'pendiente') return 1;
        if (s === 'enviado') return 2;
        if (s === 'entregado') return 3;
        return 0;
    };

    const handleConfirmDelivery = (orderId) => {
        Swal.fire({
            title: '¿Confirmar entrega?',
            text: "Marcarás este pedido como recibido.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0f172a',
            confirmButtonText: 'Sí, ya lo tengo',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('orders.confirm_delivery', orderId), {}, {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire('¡Listo!', 'Pedido finalizado.', 'success')
                });
            }
        });
    };

    return (
        <MainLayout>
            <Head title="Mis Compras" />
            
            <Box sx={{  minHeight: '100vh', py: { xs: 4, md: 6 } }}>
                <Container maxWidth="lg">
                    
                    <Typography variant="h4" fontWeight="900" sx={{ mb: 4, color: '#0f172a' }}>
                        Mis Compras
                    </Typography>

                    {orders.length === 0 ? (
                        // ESTADO VACÍO: Si el cliente no ha comprado nada
                        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px dashed #cbd5e1', bgcolor: 'transparent' }}>
                            <ShoppingBag size={64} color="#94a3b8" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                            <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>
                                Aún no tienes compras
                            </Typography>
                            <Typography color="text.secondary" mb={3}>
                                Explora nuestro catálogo y encuentra lo que buscas.
                            </Typography>
                            <Link href={route('home')}>
                                <Button variant="contained" sx={{ bgcolor: '#0f172a', borderRadius: 2 }}>
                                    Ir a la tienda
                                </Button>
                            </Link>
                        </Paper>
                    ) : (
                        // LISTA DE COMPRAS REALES
                        <Grid container spacing={3}>
                            {orders.map((order) => (
                                <Grid item xs={12} key={order.id}>
                                    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.05)' } }}>
                                        
                                        {/* Cabecera de la Tarjeta */}
                                        <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', bgcolor: '#f8fafc' }}>
                                            <Box display="flex" gap={3}>
                                                <Typography variant="body2" color="text.secondary" fontWeight="600">
                                                    Fecha: {formatDate(order.created_at)}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" fontWeight="600">
                                                    Orden: #{order.id}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" fontWeight="800" color="primary.main">
                                                Total: {formatCurrency(order.total)}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ p: { xs: 2, md: 3 } }}>
                                            <Grid container spacing={3} alignItems="center">
                                                
                                                {/* Info de los Productos */}
                                                <Grid item xs={12} md={4}>
                                                    {order.items.map((item) => (
                                                        <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                                            <Avatar 
                                                                variant="rounded"
                                                                src={item.product?.image_url}
                                                                sx={{ width: 60, height: 60, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}
                                                            >
                                                                <Package color="#cbd5e1" />
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle2" fontWeight="700" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                                                    {item.product?.name || 'Producto eliminado'}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {item.quantity} unidad(es)
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Grid>

                                                {/* Stepper de Seguimiento */}
                                                <Grid item xs={12} md={5}>
                                                    <Box sx={{ width: '100%', py: 1 }}>
                                                        <Stepper 
                                                            activeStep={getActiveStep(order.status)} 
                                                            alternativeLabel 
                                                            connector={<QontoConnector />}
                                                        >
                                                            {steps.map((label) => (
                                                                <Step key={label}>
                                                                    <StepLabel 
                                                                        StepIconProps={{ sx: { fontSize: 20 } }}
                                                                        sx={{ '& .MuiStepLabel-label': { fontSize: '0.65rem', fontWeight: 700 } }}
                                                                    >
                                                                        {label}
                                                                    </StepLabel>
                                                                </Step>
                                                            ))}
                                                        </Stepper>
                                                    </Box>
                                                </Grid>

                                                {/* Acciones Rápidas */}
                                                <Grid item xs={12} md={3}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        {order.status.toLowerCase() === 'enviado' && (
                                                            <>
                                                                <Button 
                                                                    variant="contained" 
                                                                    fullWidth 
                                                                    onClick={() => handleConfirmDelivery(order.id)}
                                                                    sx={{ bgcolor: '#0f172a', fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
                                                                >
                                                                    Confirmar llegada
                                                                </Button>
                                                                {order.tracking_url && (
                                                                    <Button 
                                                                        variant="outlined" 
                                                                        fullWidth 
                                                                        href={order.tracking_url}
                                                                        target="_blank"
                                                                        startIcon={<Truck size={16}/>}
                                                                        sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
                                                                    >
                                                                        Rastrear
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                        {order.status.toLowerCase() === 'entregado' && (
                                                            <Chip 
                                                                icon={<CheckCircle size={16}/>} 
                                                                label="Entregado" 
                                                                color="success" 
                                                                sx={{ fontWeight: 700, borderRadius: 2, py: 2.5 }} 
                                                            />
                                                        )}
                                                        {order.status.toLowerCase() === 'pendiente' && (
                                                            <Chip 
                                                                icon={<Clock size={16}/>} 
                                                                label="Preparando paquete" 
                                                                sx={{ fontWeight: 700, bgcolor: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74', borderRadius: 2, py: 2.5 }} 
                                                            />
                                                        )}
                                                    </Box>
                                                </Grid>

                                            </Grid>
                                        </Box>

                                        {/* Footer con info de envío rápida */}
                                        {order.courier && (
                                            <Box sx={{ px: 3, py: 1.5, bgcolor: '#f0fdf4', borderTop: '1px solid #dcfce3', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <MapPin size={14} color="#166534" />
                                                <Typography variant="caption" color="#166534" fontWeight={600}>
                                                    Enviado por <b>{order.courier}</b> | Guía: {order.tracking_number}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
            </Box>
        </MainLayout>
    );
}