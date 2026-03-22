import React, { useState, useMemo } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
  Box, Grid, Paper, Typography, Avatar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  Button, Container, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, TextField, InputAdornment,
  useTheme, useMediaQuery, TablePagination, IconButton, Divider
} from '@mui/material';
import {
  TrendingUp, Users, ShoppingBag, DollarSign, Plus, Calendar, X, FileText, ArrowUpRight
} from 'lucide-react';

export default function Dashboard({ sales = [] }) {
  const { auth } = usePage().props;
  const user = auth.user;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Ajustado a 'md' para el layout asimétrico

  // --------------------------------------------
  // 1. ESTADO DEL FILTRO DE FECHA
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
  const [rowsPerPage, setRowsPerPage] = useState(7); // Reducido a 7 para que encaje mejor en la vista

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

  return (
    <MainLayout>
      <Head title="Panel General" />
      
      <Box sx={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ mx: 'auto', px: { xs: 1.5, sm: 3, lg: 4 }, py: 4 }}>
          
          {/* HEADER MODERNO */}
          <Box sx={{ mb: 5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'flex-end' }, justifyContent: 'space-between', gap: 3 }}>
            <Box>
              <Typography variant="overline" color="primary.main" fontWeight="800" sx={{ letterSpacing: 1.5 }}>Resumen General</Typography>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="900" sx={{ color: '#0f172a', mb: 0.5 }}>
                Hola, {user.name.split(' ')[0]} 👋
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aquí tienes el rendimiento de tu negocio para la fecha seleccionada.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                  type="date"
                  size="small"
                  fullWidth={isMobile}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Calendar size={18} color="#64748b" /></InputAdornment>) }}
                  sx={{ bgcolor: 'white', borderRadius: 2, '& fieldset': { borderColor: '#e2e8f0' } }}
              />
              <Button 
                  variant="contained" size="large" startIcon={<Plus size={20} />} onClick={handleClickOpen} fullWidth={isMobile}
                  sx={{ fontWeight: 'bold', px: 4, borderRadius: 2, boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)', textTransform: 'none' }}
              >
                  Venta Rápida
              </Button>
            </Box>
          </Box>

          {/* KPIs: Layout Héroe (1 principal + 3 secundarios) */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* KPI HÉROE (Ingresos) */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                  p: 3, borderRadius: 4, height: '100%', color: 'white',
                  background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#60a5fa', width: 48, height: 48 }}>
                    <DollarSign size={24} />
                  </Avatar>
                  <Chip label={selectedDate === today ? 'Hoy' : selectedDate} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600, mb: 0.5 }}>Ingresos Brutos</Typography>
                  <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-1px' }}>
                    {formatCurrency(kpi.totalRevenue)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* KPIs SECUNDARIOS */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6' }}><ShoppingBag size={20} /></Avatar>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Pedidos</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="800" color="#0f172a">{kpi.totalOrders}</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#ecfdf5', color: '#10b981' }}><TrendingUp size={20} /></Avatar>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>Ticket Promedio</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="800" color="#0f172a">{formatCurrency(kpi.averageTicket)}</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#faf5ff', color: '#8b5cf6' }}><Users size={20} /></Avatar>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>Clientes</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="800" color="#0f172a">Directo</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* SECCIÓN PRINCIPAL: LAYOUT ASIMÉTRICO (8 y 4) */}
          <Grid container spacing={4}>
            
            {/* LADO IZQUIERDO: TABLA DE VENTAS */}
            <Grid item xs={12} lg={8}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="800" color="#0f172a">
                      Transacciones Recientes
                  </Typography>
                  <Button size="small" endIcon={<ArrowUpRight size={16}/>} sx={{ fontWeight: 700, textTransform: 'none' }}>Ver todas</Button>
                </Box>
                
                {isMobile ? (
                  <Box>
                    {filteredSales && filteredSales.length > 0 ? (
                      filteredSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((sale) => (
                        <Box key={sale.id} sx={{ p: 2, mb: 2, border: '1px solid #f1f5f9', borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">{sale.concept}</Typography>
                            <Typography variant="subtitle2" color="success.main" fontWeight="900">+{formatCurrency(sale.amount)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                               <Users size={12}/> {sale.client ? sale.client.name : 'Venta Manual'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{formatDate(sale.created_at)}</Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ py: 6, textAlign: 'center' }}>
                        <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                        <Typography variant="body1" color="text.secondary" fontWeight={600}>Sin movimientos hoy.</Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 600 }}>
                      <TableHead>
                        <TableRow sx={{ '& th': { borderBottom: '2px solid #f1f5f9', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: 0.5 } }}>
                          <TableCell>Concepto / Cliente</TableCell>
                          <TableCell>Fecha y Hora</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell align="right">Monto Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredSales && filteredSales.length > 0 ? (
                          filteredSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((sale) => (
                            <TableRow key={sale.id} hover sx={{ '& td': { borderBottom: '1px solid #f8fafc', py: 2 } }}>
                              <TableCell>
                                  <Typography variant="subtitle2" fontWeight="700" color="#0f172a">{sale.concept}</Typography>
                                  <Typography variant="caption" color="text.secondary">{sale.client ? sale.client.name : 'Venta Manual'}</Typography>
                              </TableCell>
                              <TableCell sx={{ color: '#64748b', fontSize: '0.875rem' }}>{formatDate(sale.created_at)}</TableCell>
                              <TableCell><Chip label="Completado" color="success" size="small" sx={{ fontWeight: 700, borderRadius: 2, bgcolor: '#ecfdf5', color: '#059669', height: 24, fontSize: '0.7rem' }} /></TableCell>
                              <TableCell align="right" sx={{ fontWeight: '900', color: '#0f172a' }}>{formatCurrency(sale.amount)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                              <FileText size={32} color="#cbd5e1" style={{ margin: '0 auto', marginBottom: 8 }} />
                              <Typography variant="body1" color="text.secondary" fontWeight={500}>No hay ventas registradas en esta fecha.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <TablePagination
                  rowsPerPageOptions={[7, 15, 25]}
                  component="div"
                  count={filteredSales.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage={isMobile ? "Filas" : "Filas por página"}
                  sx={{ borderTop: '1px solid #f1f5f9' }}
                />
              </Paper>
            </Grid>

            {/* LADO DERECHO: ACTIVIDAD / SIDEBAR */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight="800" color="#0f172a" sx={{ mb: 3 }}>Flujo de Actividad</Typography>
                
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                   {[1, 2, 3, 4].map((_, i) => (
                     <Box key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar sx={{ bgcolor: i === 0 ? '#eff6ff' : '#f8fafc', color: i === 0 ? '#3b82f6' : '#94a3b8', width: 40, height: 40 }}>
                            {i % 2 === 0 ? <ShoppingBag size={18} /> : <Users size={18} />}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                              {i % 2 === 0 ? 'Venta Rápida Registrada' : 'Nuevo Cliente Agregado'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Hace {i * 15 + 5} minutos</Typography>
                          </Box>
                        </Box>
                        {i !== 3 && <Divider sx={{ my: 2, ml: 7, borderColor: '#f1f5f9' }} />}
                     </Box>
                   ))}
                </Box>

                {/* Banner Mini Promocional o Informativo al final de la actividad */}
                <Box sx={{ mt: 4, p: 2, borderRadius: 3, bgcolor: '#fffbeb', border: '1px solid #fef3c7', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ bgcolor: '#fde68a', p: 1, borderRadius: 2, color: '#d97706' }}><TrendingUp size={24}/></Box>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={800} color="#92400e">¡Buen ritmo!</Typography>
                        <Typography variant="caption" color="#b45309">Tus ventas están activas el día de hoy.</Typography>
                    </Box>
                </Box>
              </Paper>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* MODAL / DIALOG */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="xs" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 4, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '900', borderBottom: '1px solid #f1f5f9', p: 3 }}>
            Registro Rápido
            {isMobile && <IconButton onClick={handleClose} size="small" sx={{ bgcolor: '#f8fafc' }}><X size={20} /></IconButton>}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <DialogContentText sx={{ mb: 4, fontSize: '0.875rem', color: '#64748b' }}>
              Ingresa el concepto y el monto total. La fecha se registrará automáticamente como el día de hoy.
            </DialogContentText>
            
            <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, color: '#334155' }}>Concepto / Producto</Typography>
            <TextField
              autoFocus id="concept"
              type="text" fullWidth variant="outlined"
              value={data.concept} onChange={(e) => setData('concept', e.target.value)}
              error={!!errors.concept} helperText={errors.concept} placeholder="Ej. Playera Básica Negra" 
              sx={{ mb: 3, '& fieldset': { borderRadius: 2 } }}
            />

            <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, color: '#334155' }}>Monto Total</Typography>
            <TextField
              id="amount"
              type="number" fullWidth variant="outlined"
              value={data.amount} onChange={(e) => setData('amount', e.target.value)}
              error={!!errors.amount} helperText={errors.amount} placeholder="0.00"
              InputProps={{ startAdornment: <InputAdornment position="start"><Typography fontWeight="800" color="text.secondary">$</Typography></InputAdornment> }}
              sx={{ '& fieldset': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
            {!isMobile && <Button onClick={handleClose} color="inherit" sx={{ fontWeight: '700' }}>Cancelar</Button>}
            <Button type="submit" variant="contained" disabled={processing} fullWidth={isMobile} sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}>
              Confirmar Venta
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </MainLayout>
  );
}