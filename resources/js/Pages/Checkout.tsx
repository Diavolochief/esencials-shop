import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Box, Typography, Container, Paper, Grid, TextField, Button, 
    Radio, RadioGroup, FormControlLabel, Divider, CircularProgress,
    Avatar, Checkbox
} from '@mui/material';
import { MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Checkout({ addresses = [], cart = {} }) {
    
    // 1. Usar el carrito REAL enviado desde el controlador
    const cartItems = Object.values(cart);

    // 2. Cálculos financieros
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const envio = subtotal > 1000 ? 0 : 150; // Envío gratis en compras mayores a $1000
    const total = subtotal + envio;

    // 3. Estado del formulario
    const { data, setData, post, processing } = useForm({
        address: addresses.length > 0 ? `${addresses[0].street}, ${addresses[0].city}, ${addresses[0].zip_code}` : '',
        save_address: false,
        new_address: { street: '', city: '', state: '', zip_code: '', phone: '' },
        items: cartItems // Enviar los items reales al backend
    });

    // 4. Lógica de UI para cambiar entre lista de direcciones o formulario nuevo
    const [isNewAddress, setIsNewAddress] = useState(addresses.length === 0);

    const handlePay = (e) => {
        e.preventDefault();
        
        if (cartItems.length === 0) {
            return Swal.fire('Carrito vacío', 'No tienes productos para pagar.', 'error');
        }

        if (!data.address) {
            return Swal.fire('Falta Dirección', 'Por favor selecciona o ingresa una dirección de envío.', 'warning');
        }

        Swal.fire({
            title: 'Procesando pago...',
            text: 'Estamos conectando con tu banco.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        setTimeout(() => {
            post(route('checkout.process'), {
                onSuccess: () => {
                    Swal.close();
                },
                onError: (err) => {
                    Swal.fire('Error', err.error || 'Ocurrió un error al procesar el pago.', 'error');
                }
            });
        }, 1500);
    };

    return (
        <MainLayout>
            <Head title="Checkout - Pago Seguro" />
            
            <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh', py: { xs: 4, md: 6 } }}>
                <Container maxWidth="lg">
                    
                    <Typography variant="h4" fontWeight="900" sx={{ mb: 4, color: '#0f172a' }}>Completa tu compra</Typography>

                    <Grid container spacing={4}>
                        
                        {/* COLUMNA IZQUIERDA: DATOS DE ENVÍO Y PAGO */}
                        <Grid item xs={12} md={8}>
                            
                            {/* 1. DIRECCIÓN DE ENVÍO */}
                            <Paper sx={{ p: 4, borderRadius: 3, mb: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <MapPin color="#3b82f6" /> 1. Dirección de entrega
                                </Typography>
                                
                                {/* Vista 1: Mostrar lista de direcciones (si hay y no está en modo "crear") */}
                                {addresses.length > 0 && !isNewAddress ? (
                                    <Box>
                                        <RadioGroup 
                                            value={data.address} 
                                            onChange={(e) => {
                                                setData('address', e.target.value);
                                                setData('save_address', false); // Si elige una existente, no necesita guardar
                                            }}
                                        >
                                            {addresses.map((addr) => (
                                                <Box 
                                                    key={addr.id} 
                                                    sx={{ 
                                                        border: '1px solid', 
                                                        borderColor: data.address === `${addr.street}, ${addr.city}, ${addr.zip_code}` ? 'primary.main' : '#e2e8f0',
                                                        bgcolor: data.address === `${addr.street}, ${addr.city}, ${addr.zip_code}` ? '#f0f9ff' : 'transparent',
                                                        borderRadius: 2, p: 2, mb: 2, transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <FormControlLabel 
                                                        value={`${addr.street}, ${addr.city}, ${addr.zip_code}`} 
                                                        control={<Radio color="primary" />} 
                                                        label={<Typography fontWeight="bold">{addr.street}</Typography>} 
                                                    />
                                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                                                        {addr.city}, {addr.state} C.P. {addr.zip_code} <br/> Tel: {addr.phone}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </RadioGroup>
                                        <Button variant="outlined" size="small" onClick={() => setIsNewAddress(true)} sx={{ mt: 1, borderRadius: 2 }}>
                                            + Agregar nueva dirección
                                        </Button>
                                    </Box>
                                ) : (
                                    /* Vista 2: Formulario para nueva dirección */
                                    <Box>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={8}>
                                                <TextField fullWidth label="Calle y Número (Ej. Av Vallarta 123)" value={data.new_address.street} onChange={e => setData('new_address', {...data.new_address, street: e.target.value})} />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <TextField fullWidth label="Código Postal" value={data.new_address.zip_code} onChange={e => setData('new_address', {...data.new_address, zip_code: e.target.value})} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth label="Ciudad" value={data.new_address.city} onChange={e => setData('new_address', {...data.new_address, city: e.target.value})} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth label="Estado" value={data.new_address.state} onChange={e => setData('new_address', {...data.new_address, state: e.target.value})} />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField fullWidth label="Teléfono de contacto" value={data.new_address.phone} onChange={e => setData('new_address', {...data.new_address, phone: e.target.value})} />
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <FormControlLabel 
                                                    control={
                                                        <Checkbox 
                                                            checked={data.save_address} 
                                                            onChange={(e) => setData('save_address', e.target.checked)} 
                                                            color="primary"
                                                        />
                                                    } 
                                                    label="Guardar esta dirección para futuras compras" 
                                                />
                                            </Grid>

                                            <Grid item xs={12} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                <Button 
                                                    variant="contained" 
                                                    disabled={!data.new_address.street || !data.new_address.city || !data.new_address.zip_code}
                                                    onClick={() => { 
                                                        setData('address', `${data.new_address.street}, ${data.new_address.city}, ${data.new_address.zip_code}`);
                                                        if(addresses.length > 0) setIsNewAddress(false); 
                                                    }} 
                                                    sx={{ mt: 1, borderRadius: 2 }}
                                                >
                                                    Usar esta dirección
                                                </Button>

                                                {addresses.length > 0 && (
                                                    <Button variant="text" onClick={() => setIsNewAddress(false)} sx={{ mt: 1 }}>
                                                        Cancelar
                                                    </Button>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}
                            </Paper>

                            {/* 2. MÉTODO DE PAGO (Simulación visual) */}
                            <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <CreditCard color="#10b981" /> 2. Método de pago
                                </Typography>
                                
                                <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Número de Tarjeta" placeholder="0000 0000 0000 0000" InputLabelProps={{ shrink: true }} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField fullWidth label="Vencimiento" placeholder="MM/YY" InputLabelProps={{ shrink: true }} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField fullWidth label="CVV" placeholder="123" type="password" InputLabelProps={{ shrink: true }} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Nombre en la tarjeta" placeholder="Como aparece en la tarjeta" InputLabelProps={{ shrink: true }} />
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2, color: 'text.secondary' }}>
                                    <ShieldCheck size={16} color="#10b981"/> Pago 100% encriptado y seguro. (Simulación)
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 4, borderRadius: 3, position: 'sticky', top: 20, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                                <Typography variant="h6" fontWeight="bold" mb={3}>Resumen de compra</Typography>
                                
                                {/* Lista rápida de productos REALES */}
                                {cartItems.map(item => (
                                    <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                        <Avatar src={item.image_url} variant="rounded" sx={{ width: 45, height: 45, border: '1px solid #f1f5f9' }} />
                                        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                            <Typography variant="body2" fontWeight="600" noWrap>{item.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">Cant: {item.quantity}</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            ${(item.price * item.quantity).toLocaleString()}
                                        </Typography>
                                    </Box>
                                ))}
                                
                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                    <Typography variant="body2">${subtotal.toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">Envío</Typography>
                                    {envio === 0 ? (
                                        <Typography variant="body2" color="success.main" fontWeight="bold">Gratis</Typography>
                                    ) : (
                                        <Typography variant="body2">${envio.toLocaleString()}</Typography>
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
                                    <Typography variant="h6" fontWeight="bold">Total</Typography>
                                    <Typography variant="h5" fontWeight="900" color="primary.main">${total.toLocaleString()}</Typography>
                                </Box>

                                <form onSubmit={handlePay}>
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        fullWidth 
                                        size="large"
                                        disabled={processing || !data.address || cartItems.length === 0}
                                        sx={{ bgcolor: '#0f172a', py: 2, borderRadius: 2, fontWeight: 'bold', fontSize: '1rem', '&:hover': { bgcolor: '#1e293b' } }}
                                    >
                                        {processing ? <CircularProgress size={24} color="inherit" /> : `Pagar $${total.toLocaleString()}`}
                                    </Button>
                                </form>
                                
                                {!data.address && (
                                    <Typography variant="caption" color="error" textAlign="center" display="block" mt={1}>
                                        Por favor, selecciona o ingresa una dirección de entrega válida.
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>

                    </Grid>
                </Container>
            </Box>
        </MainLayout>
    );
}