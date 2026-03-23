import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Box, Typography, Container, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Grid, Avatar, useTheme, useMediaQuery
} from '@mui/material';
import { 
    Truck, DollarSign, TrendingUp, ClipboardList, X, Package, MapPin
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function MisVentas({ allOrders = [] }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    // Formulario para actualizar la guía de paquetería
    const { data, setData, post, processing, reset } = useForm({
        courier: '',
        tracking_number: '',
        tracking_url: '',
    });

    const formatCurrency = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // --- CÁLCULO DE MÉTRICAS (KPIs) ---
    // Usamos useMemo para que no se recalcule a menos que cambien las órdenes
    const stats = useMemo(() => {
        const ordersArray = Array.isArray(allOrders) ? allOrders : [];
        const totalSales = ordersArray.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
        const totalProfit = ordersArray.reduce((acc, curr) => acc + Number(curr.total_profit || 0), 0);
        
        // Contamos cuántos están pendientes de envío
        const pendientes = ordersArray.filter(o => o.status.toLowerCase() === 'pendiente').length;

        return { totalSales, totalProfit, count: ordersArray.length, pendientes };
    }, [allOrders]);

    // --- MANEJO DEL MODAL DE ENVÍO ---
    const handleOpenShipment = (order) => {
        setSelectedOrder(order);
        setData({
            courier: order.courier || '',
            tracking_number: order.tracking_number || '',
            tracking_url: order.tracking_url || '',
        });
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        reset();
    };

    const handleSubmitShipment = (e) => {
        e.preventDefault();
        post(route('orders.update_shipment', selectedOrder.id), {
            onSuccess: () => {
                handleClose();
                Swal.fire('¡Envío Registrado!', 'El pedido cambió a "Enviado". El cliente ya puede ver su guía de rastreo.', 'success');
            }
        });
    };

    // Helper para colores de estado
    const getStatusColor = (status) => {
        const s = status.toLowerCase();
        if (s === 'pendiente') return 'warning';
        if (s === 'enviado') return 'info';
        if (s === 'entregado') return 'success';
        return 'default';
    };

    return (
        <MainLayout>
            <Head title="Panel de Ventas" />
            
            <Box sx={{  minHeight: '100vh', py: 4 }}>
                <Container maxWidth="xl">
                    
                    {/* ENCABEZADO Y KPIs */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight="900" color="#0f172a" gutterBottom>
                            Panel de Ventas
                        </Typography>
                        
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6' }}><ClipboardList /></Avatar>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="700">TOTAL PEDIDOS</Typography>
                                        <Typography variant="h5" fontWeight="900">{stats.count}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2, bgcolor: stats.pendientes > 0 ? '#fff7ed' : 'white', borderColor: stats.pendientes > 0 ? '#fdba74' : '#e2e8f0' }}>
                                    <Avatar sx={{ bgcolor: '#ffedd5', color: '#ea580c' }}><Package /></Avatar>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="700">POR DESPACHAR</Typography>
                                        <Typography variant="h5" fontWeight="900" color={stats.pendientes > 0 ? '#ea580c' : 'inherit'}>{stats.pendientes}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#ecfdf5', color: '#10b981' }}><DollarSign /></Avatar>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="700">VENTAS BRUTAS</Typography>
                                        <Typography variant="h5" fontWeight="900">{formatCurrency(stats.totalSales)}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fbbf24' }}><TrendingUp /></Avatar>
                                    <Box>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }} fontWeight="700">GANANCIA NETA</Typography>
                                        <Typography variant="h5" fontWeight="900" color="#fbbf24">{formatCurrency(stats.totalProfit)}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* TABLA PRINCIPAL DE VENTAS */}
                    <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Pedido</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Cliente / Destino</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Artículos</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Venta</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#10b981' }}>Ganancia</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                                <Typography color="text.secondary">Aún no tienes ventas registradas.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        allOrders.map((order) => (
                                            <TableRow key={order.id} hover>
                                                {/* ID y Fecha */}
                                                <TableCell>
                                                    <Typography variant="subtitle2" fontWeight="bold">#{order.id}</Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {formatDate(order.created_at)}
                                                    </Typography>
                                                </TableCell>

                                                {/* Cliente */}
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600">{order.user?.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 0.5, maxWidth: 250, lineHeight: 1.2 }}>
                                                        <MapPin size={12} style={{ flexShrink: 0, marginTop: 2 }} /> {order.shipping_address}
                                                    </Typography>
                                                </TableCell>

                                                {/* Artículos (Resumen) */}
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {order.items?.length || 0} producto(s)
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150, display: 'block' }}>
                                                        {order.items && order.items[0]?.product?.name} {order.items?.length > 1 ? '...' : ''}
                                                    </Typography>
                                                </TableCell>

                                                {/* Venta y Ganancia */}
                                                <TableCell sx={{ fontWeight: '700' }}>{formatCurrency(order.total)}</TableCell>
                                                <TableCell sx={{ fontWeight: '800', color: '#059669', bgcolor: '#f0fdf4' }}>
                                                    +{formatCurrency(order.total_profit)}
                                                </TableCell>

                                                {/* Estatus */}
                                                <TableCell>
                                                    <Chip 
                                                        label={order.status} 
                                                        size="small" 
                                                        color={getStatusColor(order.status)} 
                                                        sx={{ fontWeight: 'bold', textTransform: 'capitalize', borderRadius: 1.5 }}
                                                    />
                                                </TableCell>

                                                {/* Acciones */}
                                                <TableCell align="right">
                                                    <Button 
                                                        variant="contained" 
                                                        size="small" 
                                                        startIcon={<Truck size={16}/>}
                                                        onClick={() => handleOpenShipment(order)}
                                                        sx={{ 
                                                            borderRadius: 2, 
                                                            textTransform: 'none', 
                                                            fontWeight: 'bold',
                                                            bgcolor: order.status.toLowerCase() === 'pendiente' ? '#0f172a' : '#94a3b8',
                                                            '&:hover': { bgcolor: order.status.toLowerCase() === 'pendiente' ? '#1e293b' : '#64748b' }
                                                        }}
                                                    >
                                                        {order.status.toLowerCase() === 'pendiente' ? 'Despachar' : 'Ver Guía'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Container>
            </Box>

            {/* MODAL PARA GESTIONAR ENVÍO */}
            <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <form onSubmit={handleSubmitShipment}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        Despachar Pedido #{selectedOrder?.id}
                        <IconButton onClick={handleClose}><X size={20}/></IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                        
                        {/* Resumen de Ganancia en el Modal */}
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px dashed #4ade80', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="#166534" fontWeight="600">¡Felicidades! Ganancia neta de esta venta:</Typography>
                            <Typography variant="h6" color="#166534" fontWeight="900">{formatCurrency(selectedOrder?.total_profit || 0)}</Typography>
                        </Box>

                        <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>Dirección del Cliente</Typography>
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                            <Typography variant="body2" fontWeight="bold" mb={0.5}>{selectedOrder?.user?.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', gap: 1 }}>
                                <MapPin size={16} /> {selectedOrder?.shipping_address}
                            </Typography>
                        </Box>

                        <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>Datos de Paquetería</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Paquetería"
                                    value={data.courier} onChange={e => setData('courier', e.target.value)}
                                    required
                                >
                                    <MenuItem value="FedEx">FedEx</MenuItem>
                                    <MenuItem value="DHL">DHL</MenuItem>
                                    <MenuItem value="Estafeta">Estafeta</MenuItem>
                                    <MenuItem value="Mercado Envíos">Mercado Envíos</MenuItem>
                                    <MenuItem value="Entrega Local">Entrega Local / Personal</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth label="Número de Guía" 
                                    value={data.tracking_number} onChange={e => setData('tracking_number', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth label="Link de Rastreo Directo (Opcional)" 
                                    placeholder="https://www.fedex.com/track..."
                                    value={data.tracking_url} onChange={e => setData('tracking_url', e.target.value)}
                                    helperText="Si lo proporcionas, el cliente podrá darle clic y ver su paquete al instante."
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                        <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 'bold' }}>Cancelar</Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={processing}
                            sx={{ px: 4, borderRadius: 2, fontWeight: 'bold', bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
                        >
                            Guardar y Notificar al Cliente
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

        </MainLayout>
    );
}