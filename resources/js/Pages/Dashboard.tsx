import React, { useState, useMemo } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
  Box, Grid, Paper, Typography, Avatar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  Button, Container, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, TextField, InputAdornment,
  useTheme, useMediaQuery, TablePagination, IconButton
} from '@mui/material';
import {
  TrendingUp, Users, ShoppingBag, DollarSign, Plus, Calendar, X, FileText
} from 'lucide-react';

export default function Dashboard({ sales = [] }) {
  const { auth } = usePage().props;
  const user = auth.user;
  const theme = useTheme();
  // Detectamos celular para adaptar el diseño
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // --------------------------------------------
  // 1. ESTADO DEL FILTRO DE FECHA (DEFAULT: HOY)
  // --------------------------------------------
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // --------------------------------------------
  // 2. FILTRADO DE DATOS
  // --------------------------------------------
  const filteredSales = useMemo(() => {
    if (!selectedDate) return sales; 
    return sales.filter(sale => sale.created_at.startsWith(selectedDate));
  }, [sales, selectedDate]);

  // --------------------------------------------
  // 3. PAGINACIÓN
  // --------------------------------------------
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useMemo(() => { setPage(0); }, [selectedDate]);

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
  const handleClose = () => { setOpen(false); reset(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('sales.store'), { onSuccess: () => handleClose() });
  };

  // --------------------------------------------
  // 5. CÁLCULOS DE KPI
  // --------------------------------------------
  const kpi = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalOrders = filteredSales.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, averageTicket };
  }, [filteredSales]);

  // --------------------------------------------
  // 6. HELPERS
  // --------------------------------------------
  const formatCurrency = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const stats = [
    { title: 'Ventas del Día', value: formatCurrency(kpi.totalRevenue), icon: <DollarSign size={24} color="#fff" />, color: '#0f172a', trend: selectedDate === today ? 'Hoy' : selectedDate },
    { title: 'Pedidos', value: kpi.totalOrders, icon: <ShoppingBag size={24} color="#fff" />, color: '#64748b', trend: 'En periodo' },
    { title: 'Ticket Promedio', value: formatCurrency(kpi.averageTicket), icon: <TrendingUp size={24} color="#fff" />, color: '#059669', trend: 'Por venta' },
    { title: 'Clientes', value: 'Gestión', icon: <Users size={24} color="#fff" />, color: '#7c3aed', trend: 'Activos' },
  ];

  return (
    <MainLayout>
      <Head title="Dashboard" />
      
      {/* Contenedor estricto para evitar desbordes en móvil */}
      <Box sx={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Container maxWidth="xl" sx={{ mx: 'auto', px: { xs: 1.5, sm: 3, lg: 4 }, py: 4 }}>
          
          {/* HEADER RESPONSIVO */}
          <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" gutterBottom>Dashboard</Typography>
              <Typography variant="body2" color="text.secondary">
                Hola, <b>{user.name}</b>. Aquí tienes el resumen de {selectedDate === today ? 'hoy' : selectedDate}.
              </Typography>
            </Box>

            {/* Acciones: En celular ocupan el 100% del ancho */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                  type="date"
                  size="small"
                  fullWidth={isMobile}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Calendar size={18} /></InputAdornment>) }}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
              <Button 
                  variant="contained" size="large" startIcon={<Plus size={20} />} onClick={handleClickOpen} fullWidth={isMobile}
                  sx={{ fontWeight: 'bold', px: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}
              >
                  Nueva Venta
              </Button>
            </Box>
          </Box>

          {/* TARJETAS DE ESTADÍSTICAS (KPIs) */}
          <Grid container spacing={2} sx={{ mb: 4 }} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ width: 45, height: 45, borderRadius: 2, bgcolor: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                      {stat.icon}
                    </Box>
                    <Chip label={stat.trend} size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'success.main', fontWeight: 700, borderRadius: 1 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>{stat.title}</Typography>
                  <Typography variant="h5" fontWeight="bold">{stat.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* CONTENIDO PRINCIPAL */}
          <Grid container spacing={4}>
            
            {/* SECCIÓN 1: HISTORIAL DE VENTAS RESPONSIVO */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Historial del {selectedDate}
                </Typography>
                
                {/* SI ES MÓVIL: MOSTRAMOS TARJETAS, SI ES PC: MOSTRAMOS TABLA */}
                {isMobile ? (
                  <Box>
                    {filteredSales && filteredSales.length > 0 ? (
                      filteredSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((sale) => (
                        <Box key={sale.id} sx={{ p: 2, mb: 2, border: '1px solid #f1f5f9', borderRadius: 2, bgcolor: '#f8fafc' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">{sale.concept}</Typography>
                            <Typography variant="subtitle2" color="primary.main" fontWeight="bold">{formatCurrency(sale.amount)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">{sale.client ? sale.client.name : 'Venta Manual'}</Typography>
                            <Typography variant="caption" color="text.secondary">{formatDate(sale.created_at)}</Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                        <Typography variant="body2" color="text.secondary">No hay ventas registradas.</Typography>
                        {selectedDate === today && (
                          <Button size="small" variant="outlined" onClick={handleClickOpen} sx={{ mt: 2, borderRadius: 2 }}>Registrar primera venta</Button>
                        )}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 650 }}>
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
                          filteredSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((sale) => (
                            <TableRow key={sale.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell sx={{ fontWeight: 600 }}>
                                  {sale.concept}
                                  <Typography variant="caption" display="block" color="text.secondary">{sale.client ? sale.client.name : 'Venta Manual'}</Typography>
                              </TableCell>
                              <TableCell>{formatDate(sale.created_at)}</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(sale.amount)}</TableCell>
                              <TableCell><Chip label="OK" color="success" size="small" variant="filled" sx={{ fontWeight: 600, borderRadius: 1, height: 24 }} /></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>No hay ventas registradas en esta fecha.</Typography>
                              {selectedDate === today && (<Button size="medium" variant="outlined" onClick={handleClickOpen}>Registrar venta</Button>)}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredSales.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage={isMobile ? "Filas" : "Filas por página"}
                />
              </Paper>
            </Grid>

            {/* SECCIÓN 2: ACTIVIDAD */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Actividad Reciente</Typography>
                <Grid container spacing={2}>
                   {[1, 2, 3].map((_, i) => (
                     <Grid item xs={12} sm={6} md={4} key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #f1f5f9', borderRadius: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 40, height: 40 }}><Users size={18} /></Avatar>
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
      </Box>

      {/* MODAL / DIALOG - 100% Responsivo */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="xs" 
        fullWidth
        fullScreen={isMobile} // En celular ocupa toda la pantalla
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            Registrar Venta Rápida
            {isMobile && <IconButton onClick={handleClose} size="small"><X size={20} /></IconButton>}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <DialogContentText sx={{ mb: 3, fontSize: '0.9rem' }}>
              Registra una venta de mostrador para el día de hoy.
            </DialogContentText>
            
            <TextField
              autoFocus margin="dense" id="concept"
              label="Concepto / Producto" type="text" fullWidth variant="outlined"
              value={data.concept} onChange={(e) => setData('concept', e.target.value)}
              error={!!errors.concept} helperText={errors.concept} placeholder="Ej. Pantalón Levis" sx={{ mb: 3 }}
            />

            <TextField
              margin="dense" id="amount"
              label="Monto Total" type="number" fullWidth variant="outlined"
              value={data.amount} onChange={(e) => setData('amount', e.target.value)}
              error={!!errors.amount} helperText={errors.amount}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            {!isMobile && <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 'bold' }}>Cancelar</Button>}
            <Button type="submit" variant="contained" disabled={processing} fullWidth={isMobile} sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
              Registrar Venta
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </MainLayout>
  );
}