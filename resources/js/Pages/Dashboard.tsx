import React, { useState, useMemo } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  ArrowRight,
  DollarSign,
  Plus
} from 'lucide-react';

// Recibimos 'sales' desde Laravel (asegúrate de usar ->with('client') en el backend)
export default function Dashboard({ sales = [] }) {
  const { auth } = usePage().props;
  const user = auth.user;

  // --------------------------------------------
  // 1. LÓGICA DEL FORMULARIO Y MODAL
  // --------------------------------------------
  const [open, setOpen] = useState(false);
  
  // Agregamos 'client_name' al formulario
  const { data, setData, post, processing, errors, reset } = useForm({
    client_name: '',
    concept: '',
    amount: '',
  });

  const handleClickOpen = () => setOpen(true);
  
  const handleClose = () => {
    setOpen(false);
    reset(); // Limpia el formulario al cerrar
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('sales.store'), {
      onSuccess: () => handleClose(),
    });
  };

  // --------------------------------------------
  // 2. CÁLCULOS DE KPI EN EL FRONTEND (useMemo)
  // --------------------------------------------
  const kpi = useMemo(() => {
    // A. Suma Total de Dinero
    const totalRevenue = sales.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // B. Total de Pedidos
    const totalOrders = sales.length;

    // C. Ventas de HOY (Comparamos fecha YYYY-MM-DD)
    const todayStr = new Date().toISOString().slice(0, 10); 
    const todayRevenue = sales
      .filter(sale => sale.created_at.substring(0, 10) === todayStr)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    // D. Ticket Promedio
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, todayRevenue, averageTicket };
  }, [sales]);

  // --------------------------------------------
  // 3. HELPERS DE FORMATO
  // --------------------------------------------
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  // --------------------------------------------
  // 4. CONFIGURACIÓN DE TARJETAS
  // --------------------------------------------
  const stats = [
    {
      title: 'Ventas Totales',
      value: formatCurrency(kpi.totalRevenue),
      icon: <DollarSign size={24} color="#fff" />,
      color: '#0f172a',
      trend: `Hoy: ${formatCurrency(kpi.todayRevenue)}`
    },
    {
      title: 'Pedidos',
      value: kpi.totalOrders,
      icon: <ShoppingBag size={24} color="#fff" />,
      color: '#64748b',
      trend: 'Histórico'
    },
    {
      title: 'Ticket Promedio',
      value: formatCurrency(kpi.averageTicket),
      icon: <TrendingUp size={24} color="#fff" />,
      color: '#059669', // Cambié el color para variedad
      trend: 'Por venta'
    },
    {
      title: 'Clientes',
      value: 'Gestión', 
      icon: <Users size={24} color="#fff" />,
      color: '#7c3aed', 
      trend: 'Activos'
    },
  ];

  return (
    <MainLayout>
      <Head title="Dashboard" />
      
      <Container maxWidth={false} sx={{ maxWidth: '1800px', mx: 'auto' }}>
        
        {/* HEADER */}
        <Box 
          sx={{ 
            mb: 5, 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h4" fontWeight="800" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Bienvenido de nuevo, <b>{user.name}</b>.
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            size="large"
            startIcon={<Plus size={20} />}
            sx={{ 
              fontWeight: 'bold', px: 3, py: 1.5, borderRadius: 2,
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
            }}
            onClick={handleClickOpen}
          >
            Nueva Venta Manual
          </Button>
        </Box>

        {/* MODAL / DIALOG */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle fontWeight="bold">Registrar Venta Rápida</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                Ingresa los detalles. Si el cliente es nuevo, se registrará automáticamente.
              </DialogContentText>
              
              {/* CAMPO: NOMBRE DEL CLIENTE */}
              <TextField
                autoFocus margin="dense" id="client_name"
                label="Nombre del Cliente" type="text" fullWidth variant="outlined"
                value={data.client_name}
                onChange={(e) => setData('client_name', e.target.value)}
                error={!!errors.client_name} helperText={errors.client_name}
                placeholder="Ej. Juan Pérez"
                sx={{ mb: 2 }}
              />

              {/* CAMPO: CONCEPTO */}
              <TextField
                margin="dense" id="concept"
                label="¿Qué vendiste?" type="text" fullWidth variant="outlined"
                value={data.concept}
                onChange={(e) => setData('concept', e.target.value)}
                error={!!errors.concept} helperText={errors.concept}
                placeholder="Ej. Pantalón Levis Talla 32"
                sx={{ mb: 2 }}
              />

              {/* CAMPO: MONTO */}
              <TextField
                margin="dense" id="amount"
                label="Monto de venta" type="number" fullWidth variant="outlined"
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
                error={!!errors.amount} helperText={errors.amount}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleClose} color="inherit">Cancelar</Button>
              <Button type="submit" variant="contained" disabled={processing} sx={{ px: 3 }}>
                {processing ? 'Guardando...' : 'Registrar Venta'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 3, border: '1px solid #e2e8f0',
                  display: 'flex', flexDirection: 'column', height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      width: 50, height: 50, borderRadius: 2, bgcolor: stat.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Chip 
                    label={stat.trend} size="small" 
                    sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'success.main', fontWeight: 700, borderRadius: 1 }} 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
                  {stat.title}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* TABLA DE VENTAS */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Historial de Ventas</Typography>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Cliente</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Concepto</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Monto</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* slice(0, 10) muestra solo las últimas 10 ventas en la tabla */}
                    {sales && sales.length > 0 ? (
                      sales.slice(0, 10).map((sale) => (
                        <TableRow key={sale.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                            #{sale.id}
                          </TableCell>
                          
                          {/* Columna CLIENTE: Muestra nombre del cliente (si existe) o "N/A" */}
                          <TableCell>
                            {sale.client ? sale.client.name : (sale.is_manual ? 'Cliente Manual Sin Nombre' : 'Venta Web')}
                          </TableCell>

                          <TableCell>{sale.concept}</TableCell>
                          <TableCell>{formatDate(sale.created_at)}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(sale.amount)}</TableCell>
                          <TableCell>
                            <Chip 
                              label="Completado" 
                              color="success" 
                              size="small" 
                              variant="filled"
                              sx={{ fontWeight: 600, borderRadius: 1 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No hay ventas registradas.
                          </Typography>
                          <Button size="small" onClick={handleClickOpen} sx={{ mt: 1 }}>
                            Registrar primera venta
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* PANEL LATERAL DERECHO (ESTÁTICO/SIMULADO) */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Resumen de Clientes</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[1, 2, 3].map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 45, height: 45 }}>
                      <Users size={20} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>Cliente Frecuente</Typography>
                      <Typography variant="caption" color="text.secondary">Compra realizada hace {i * 15 + 5} min</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Button fullWidth variant="outlined" sx={{ mt: 4, py: 1 }}>
                Ver todos los clientes
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
}