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
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Plus
} from 'lucide-react';

export default function Dashboard({ sales = [] }) {
  const { auth } = usePage().props;
  const user = auth.user;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // --------------------------------------------
  // 1. LÓGICA DEL FORMULARIO Y MODAL
  // --------------------------------------------
  const [open, setOpen] = useState(false);
  
  // MODIFICACIÓN: 'client_name' tiene un valor por defecto y no se pide en el form
  const { data, setData, post, processing, errors, reset } = useForm({
    client_name: 'Cliente de Mostrador', // Valor automático
    concept: '',
    amount: '',
  });

  const handleClickOpen = () => setOpen(true);
  
  const handleClose = () => {
    setOpen(false);
    reset(); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('sales.store'), {
      onSuccess: () => handleClose(),
    });
  };

  // --------------------------------------------
  // 2. CÁLCULOS DE KPI (Sin cambios)
  // --------------------------------------------
  const kpi = useMemo(() => {
    const totalRevenue = sales.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalOrders = sales.length;
    const todayStr = new Date().toISOString().slice(0, 10); 
    const todayRevenue = sales
      .filter(sale => sale.created_at.substring(0, 10) === todayStr)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, todayRevenue, averageTicket };
  }, [sales]);

  // --------------------------------------------
  // 3. HELPERS
  // --------------------------------------------
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  // Configuración de Stats
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
      color: '#059669',
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
      
      {/* CONTENEDOR PRINCIPAL: Centrado (mx: auto) y Responsivo */}
      <Container maxWidth="xl" sx={{ mx: 'auto', py: { xs: 2, md: 4 } }}>
        
        {/* HEADER */}
        <Box 
          sx={{ 
            mb: 4, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, // Columna en móvil, Fila en PC
            alignItems: { xs: 'stretch', sm: 'center' }, 
            justifyContent: 'space-between',
            gap: 2,
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hola, <b>{user.name}</b>.
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            size="large"
            fullWidth={isMobile} // Botón ancho completo en móvil
            startIcon={<Plus size={20} />}
            sx={{ 
              fontWeight: 'bold', px: 3, py: 1.5, borderRadius: 2,
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
            }}
            onClick={handleClickOpen}
          >
            Nueva Venta
          </Button>
        </Box>

        {/* MODAL / DIALOG */}
        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="xs" // Más estrecho para verse mejor
          fullWidth
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle fontWeight="bold">Registrar Venta Rápida</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2, fontSize: '0.9rem' }}>
                Registra una venta de mostrador.
              </DialogContentText>
              
              {/* NOTA: El campo Client Name fue eliminado visualmente,
                  se envía "Cliente de Mostrador" por defecto */}

              {/* CAMPO: CONCEPTO */}
              <TextField
                autoFocus
                margin="dense" id="concept"
                label="Concepto / Producto" type="text" fullWidth variant="outlined"
                value={data.concept}
                onChange={(e) => setData('concept', e.target.value)}
                error={!!errors.concept} helperText={errors.concept}
                placeholder="Ej. Pantalón Levis"
                sx={{ mb: 2 }}
              />

              {/* CAMPO: MONTO */}
              <TextField
                margin="dense" id="amount"
                label="Monto Total" type="number" fullWidth variant="outlined"
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
                error={!!errors.amount} helperText={errors.amount}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={handleClose} color="inherit">Cancelar</Button>
              <Button type="submit" variant="contained" disabled={processing} sx={{ px: 3 }}>
                Registrar
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <Grid container spacing={2} sx={{ mb: 4 }} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 3, border: '1px solid #e2e8f0',
                  display: 'flex', flexDirection: 'column', height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      width: 45, height: 45, borderRadius: 2, bgcolor: stat.color,
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
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* GRID PRINCIPAL: TABLA + SIDEBAR */}
        <Grid container spacing={3}>
          
          {/* COLUMNA IZQUIERDA: TABLA */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Historial Reciente</Typography>
              </Box>
              
              {/* TableContainer con scroll horizontal para móviles */}
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Concepto</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Monto</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sales && sales.length > 0 ? (
                      sales.slice(0, 10).map((sale) => (
                        <TableRow key={sale.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                             {/* Mostramos el concepto en lugar del ID para ahorrar espacio en móvil */}
                             {sale.concept}
                             <Typography variant="caption" display="block" color="text.secondary">
                               {sale.client ? sale.client.name : 'Venta Manual'}
                             </Typography>
                          </TableCell>
                          
                          <TableCell>{formatDate(sale.created_at)}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(sale.amount)}</TableCell>
                          <TableCell>
                            <Chip 
                              label="OK" 
                              color="success" 
                              size="small" 
                              variant="filled"
                              sx={{ fontWeight: 600, borderRadius: 1, height: 24 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            Sin ventas recientes.
                          </Typography>
                          <Button size="small" onClick={handleClickOpen} sx={{ mt: 1 }}>
                            Registrar venta
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* COLUMNA DERECHA: RESUMEN (Se va abajo en móvil) */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Actividad</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[1, 2, 3].map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 40, height: 40 }}>
                      <Users size={18} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>Nueva Visita</Typography>
                      <Typography variant="caption" color="text.secondary">Hace {i * 15 + 5} min</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

        </Grid>
      </Container>
    </MainLayout>
  );
}