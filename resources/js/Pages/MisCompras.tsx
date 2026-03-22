import React from 'react';
import { Head, router } from '@inertiajs/react';
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

// --- ESTILO PERSONALIZADO PARA EL STEPPER (CORREGIDO) ---
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
    // 👇 Aquí estaba el error, ahora está envuelto correctamente:
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

    // Configuración de etapas
    const steps = ['Pedido realizado', 'Preparando', 'En camino', 'Entregado'];

    const getActiveStep = (status) => {
        switch (status) {
            case 'Pendiente': return 1;
            case 'Enviado': return 2;
            case 'Entregado': return 3;
            default: return 0;
        }
    };

    const handleConfirmDelivery = (orderId) => {
        Swal.fire({
            title: '¿Confirmar entrega?',
            text: "Marcarás este producto como recibido.",
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

    // Datos de prueba
    const mockOrders = orders.length > 0 ? orders : [
        {
            id: '2000000123', created_at: '2026-03-18T10:00:00Z', total_amount: 2500, status: 'Enviado',
            courier: 'FedEx', tracking_number: 'FX-882211', tracking_url: 'https://fedex.com',
            items: [{ name: 'Tenis Jordan Air Retro G5', quantity: 1, price: 2500, image_url: null }]
        },
        {
            id: '2000000125', created_at: '2026-03-20T09:15:00Z', total_amount: 1200, status: 'Pendiente',
            courier: null, tracking_number: null, items: [{ name: 'Reloj Casio Vintage Gold', quantity: 1, price: 1200, image_url: null }]
        }
    ];

    return (
        <MainLayout>
            <Head title="Mis Compras" />
            
            <Box sx={{ bgcolor: '#f4f4f4', minHeight: '100vh', py: { xs: 2, md: 5 } }}>
                <Container maxWidth="lg">
                    
                    <Typography variant="h5" fontWeight="800" sx={{ mb: 3, px: 1 }}>Mis compras</Typography>

                    <Grid container spacing={2}>
                        {mockOrders.map((order) => (
                            <Grid item xs={12} key={order.id}>
                                <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white' }}>
                                    
                                    {/* Cabecera de la Tarjeta */}
                                    <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', bgcolor: '#fff' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(order.created_at)} | # {order.id}
                                        </Typography>
                                        <Button size="small" endIcon={<ChevronRight size={16}/>} sx={{ textTransform: 'none', fontWeight: 600 }}>
                                            Ver detalle
                                        </Button>
                                    </Box>

                                    <Box sx={{ p: { xs: 2, md: 3 } }}>
                                        <Grid container spacing={3} alignItems="center">
                                            
                                            {/* Info del Producto */}
                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                    <Avatar 
                                                        variant="rounded"
                                                        src={order.items[0].image_url}
                                                        sx={{ width: 80, height: 80, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}
                                                    >
                                                        <Package color="#cbd5e1" />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="700" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                                            {order.items[0].name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {order.items[0].quantity} unidad
                                                        </Typography>
                                                        <Typography variant="subtitle1" fontWeight="800">
                                                            {formatCurrency(order.total_amount)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
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
                                                    {order.status === 'Enviado' && (
                                                        <>
                                                            <Button 
                                                                variant="contained" 
                                                                fullWidth 
                                                                onClick={() => handleConfirmDelivery(order.id)}
                                                                sx={{ bgcolor: '#0f172a', fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
                                                            >
                                                                Confirmar llegada
                                                            </Button>
                                                            <Button 
                                                                variant="outlined" 
                                                                fullWidth 
                                                                href={order.tracking_url}
                                                                target="_blank"
                                                                startIcon={<Truck size={16}/>}
                                                                sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
                                                            >
                                                                Rastrear paquete
                                                            </Button>
                                                        </>
                                                    )}
                                                    {order.status === 'Entregado' && (
                                                        <Button variant="text" color="primary" sx={{ fontWeight: 700 }}>
                                                            Volver a comprar
                                                        </Button>
                                                    )}
                                                    {order.status === 'Pendiente' && (
                                                        <Chip 
                                                            icon={<Clock size={14}/>} 
                                                            label="Esperando despacho" 
                                                            sx={{ fontWeight: 700, bgcolor: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74' }} 
                                                        />
                                                    )}
                                                </Box>
                                            </Grid>

                                        </Grid>
                                    </Box>

                                    {/* Footer con info de envío rápida */}
                                    {order.courier && (
                                        <Box sx={{ px: 3, py: 1.5, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MapPin size={14} color="#64748b" />
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                Enviado por <b>{order.courier}</b> | Guía: {order.tracking_number}
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        </MainLayout>
    );
}