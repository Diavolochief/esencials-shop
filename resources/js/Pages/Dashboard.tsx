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
  useMediaQuery,
  TablePagination
} from '@mui/material';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Plus,
  Calendar // Importamos icono de calendario
} from 'lucide-react';

export default function Dashboard({ sales = [] }) {
  const { auth } = usePage().props;
  const user = auth.user;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // --------------------------------------------
  // 1. ESTADO DEL FILTRO DE FECHA (DEFAULT: HOY)
  // --------------------------------------------
  // Obtenemos la fecha de hoy en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // --------------------------------------------
  // 2. FILTRADO DE DATOS
  // --------------------------------------------
  // Filtramos las ventas según la fecha seleccionada
  const filteredSales = useMemo(() => {
    if (!selectedDate) return sales; // Si no hay fecha, muestra todo (opcional)
    return sales.filter(sale => sale.created_at.startsWith(selectedDate));
  }, [sales, selectedDate]);

  // --------------------------------------------
  // 3. PAGINACIÓN (Sobre los datos filtrados)
  // --------------------------------------------
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Resetear paginación si cambia el filtro de fecha
  useMemo(() => {
    setPage(0);
  }, [selectedDate]);

  // --------------------------------------------
  // 4. LÓGICA DEL FORMULARIO Y MODAL
  // --------------------------------------------
  const [open, setOpen] = useState(false);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    client_name: 'Cliente de Mostrador', 
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
  // 5. CÁLCULOS DE KPI (Basados en filteredSales)
  // --------------------------------------------
  const kpi = useMemo(() => {
    // Calculamos totales SOLO de la fecha seleccionada
    const totalRevenue = filteredSales.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalOrders = filteredSales.length;
    
    // Ticket promedio
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, averageTicket };
  }, [filteredSales]);

  // --------------------------------------------
  // 6. HELPERS
  // --------------------------------------------
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const stats = [
    {
      title: 'Ventas del Día', // Cambié el título para reflejar el filtro
      value: formatCurrency(kpi.totalRevenue),
      icon: <DollarSign size={24} color="#fff" />,
      color: '#0f172a',
      trend: selectedDate === today ? 'Hoy' : selectedDate // Muestra la fecha o "Hoy"
    },
    {
      title: 'Pedidos',
      value: kpi.totalOrders,
      icon: <ShoppingBag size={24} color="#fff" />,
      color: '#64748b',
      trend: 'En periodo'
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
      
      <Container maxWidth="xl" sx={{ mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
        
        {/* HEADER CON FILTRO DE FECHA */}
        <Box 
          sx={{ 
            mb: 4, 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, // Columna en móvil, fila en PC
            alignItems: { xs: 'stretch', md: 'center' }, 
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          {/* Título y Saludo */}
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hola, <b>{user.name}</b>. Aquí tienes el resumen de {selectedDate === today ? 'hoy' : selectedDate}.
            </Typography>
          </Box>

          {/* Acciones: Selector de Fecha + Botón */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
                type="date"
                size="small"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Calendar size={18} />
                        </InputAdornment>
                    ),
                }}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
            
            <Button 
                variant="contained" 
                size="large"
                startIcon={<Plus size={20} />}
                sx={{ 
                fontWeight: 'bold', px: 3, borderRadius: 2,
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
                }}
                onClick={handleClickOpen}
            >
                Nueva Venta
            </Button>
          </Box>
        </Box>

        {/* MODAL / DIALOG */}
        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="xs" 
          fullWidth
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle fontWeight="bold">Registrar Venta Rápida</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2, fontSize: '0.9rem' }}>
                Registra una venta de mostrador para el día de hoy.
              </DialogContentText>
              
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

        {/* TARJETAS DE ESTADÍSTICAS (KPIs) */}
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

        {/* CONTENIDO PRINCIPAL */}
        <Grid container spacing={4}>
          
          {/* SECCIÓN 1: TABLA DE VENTAS CON PAGINACIÓN */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    Historial del {selectedDate}
                </Typography>
              </Box>
              
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
                    {filteredSales && filteredSales.length > 0 ? (
                      filteredSales
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((sale) => (
                        <TableRow key={sale.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
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
                            No hay ventas registradas en esta fecha.
                          </Typography>
                          {/* Solo mostramos el botón de registrar si estamos en el día de hoy */}
                          {selectedDate === today && (
                            <Button size="small" onClick={handleClickOpen} sx={{ mt: 1 }}>
                                Registrar venta
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredSales.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página"
              />

            </Paper>
          </Grid>

          {/* SECCIÓN 2: ACTIVIDAD */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Actividad Reciente</Typography>
              <Grid container spacing={2}>
                 {[1, 2, 3].map((_, i) => (
                   <Grid item xs={12} md={4} key={i}>
                      <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          p: 2, 
                          border: '1px solid #f1f5f9', 
                          borderRadius: 2 
                        }}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 40, height: 40 }}>
                          <Users size={18} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700}>Nueva Visita</Typography>
                          <Typography variant="caption" color="text.secondary">Hace {i * 15 + 5} min</Typography>
                        </Box>
                      </Box>
                   </Grid>
                 ))}
              </Grid>
            </Paper>
          </Grid>

        </Grid>
      </Container>
    </MainLayout>
  );
}