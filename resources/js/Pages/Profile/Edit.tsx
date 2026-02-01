import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { 
    Container, Grid, Paper, Typography, Box, Avatar, Divider, 
    TextField, Button, Stack, IconButton 
} from '@mui/material';
import { 
    User, MapPin, Phone, Mail, Home, Hash, Building2, Save, Edit3, X, Camera 
} from 'lucide-react';

export default function Edit() {
    const { auth } = usePage().props;
    const user = auth.user;

    const [isEditing, setIsEditing] = useState(false);
    const [preview, setPreview] = useState(user.avatar);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        neighborhood: user.neighborhood || '',
        city: user.city || '',
        zip_code: user.zip_code || '',
        avatar: null,
        _method: 'PATCH', // Necesario para enviar archivos vía POST simulando PATCH
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Usamos post con _method PATCH porque multipart/form-data no soporta PATCH nativo en PHP
        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    return (
        <MainLayout>
            <Head title="Mi Perfil" />
            <Container maxWidth="lg">
                
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight="800">Mi Perfil</Typography>
                        <Typography variant="body1" color="text.secondary">Gestiona tu identidad y envíos</Typography>
                    </Box>
                    {!isEditing ? (
                        <Button variant="outlined" startIcon={<Edit3 size={18} />} onClick={() => setIsEditing(true)}>
                            Editar Perfil
                        </Button>
                    ) : (
                        <Button variant="text" color="error" startIcon={<X size={18} />} onClick={() => { setIsEditing(false); reset(); setPreview(user.avatar); }}>
                            Cancelar
                        </Button>
                    )}
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        
                        {/* COLUMNA IZQUIERDA: INFORMACIÓN DE CUENTA (TODO CENTRADO) */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} elevation={0}>
                                
                                {/* AVATAR CON CARGA DE FOTO */}
                                <Box sx={{ position: 'relative', mb: 3 }}>
                                    <Avatar 
                                        src={preview} 
                                        sx={{ width: 140, height: 140, bgcolor: 'primary.main', fontSize: 60, border: '4px solid #fff', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                                    >
                                        {user.name.charAt(0)}
                                    </Avatar>
                                    
                                    {isEditing && (
                                        <IconButton 
                                            component="label"
                                            sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
                                        >
                                            <Camera size={20} />
                                            <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                                        </IconButton>
                                    )}
                                </Box>

                                <Stack spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
                                    {isEditing ? (
                                        <TextField
                                            label="Nombre" fullWidth size="small"
                                            value={data.name} onChange={e => setData('name', e.target.value)}
                                            sx={{ maxWidth: 280 }}
                                        />
                                    ) : (
                                        <Typography variant="h5" fontWeight="bold">{user.name}</Typography>
                                    )}
                                    
                                    <Typography variant="body2" color="text.secondary">
                                        Cliente desde {new Date(user.created_at).getFullYear()}
                                    </Typography>
                                </Stack>

                                <Divider sx={{ my: 3, width: '80%' }} />

                                <Stack spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Mail size={18} color="#64748b" />
                                        <Typography variant="body2" fontWeight="500" sx={{ mt: 0.5 }}>{user.email}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Phone size={18} color="#64748b" />
                                        <Typography variant="body2" fontWeight="500" sx={{ mt: 0.5 }}>{user.phone || 'Sin teléfono'}</Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* COLUMNA DERECHA: DIRECCIÓN */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0' }} elevation={0}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MapPin size={22} /> Dirección de Entrega
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField 
                                            label="Calle y Número" fullWidth 
                                            value={isEditing ? data.address : (user.address || '---')} 
                                            onChange={e => setData('address', e.target.value)}
                                            InputProps={{ readOnly: !isEditing }}
                                            variant={isEditing ? "outlined" : "filled"}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Colonia" fullWidth value={isEditing ? data.neighborhood : (user.neighborhood || '---')} onChange={e => setData('neighborhood', e.target.value)} InputProps={{ readOnly: !isEditing }} variant={isEditing ? "outlined" : "filled"} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Código Postal" fullWidth value={isEditing ? data.zip_code : (user.zip_code || '---')} onChange={e => setData('zip_code', e.target.value)} InputProps={{ readOnly: !isEditing }} variant={isEditing ? "outlined" : "filled"} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Ciudad" fullWidth value={isEditing ? data.city : (user.city || '---')} onChange={e => setData('city', e.target.value)} InputProps={{ readOnly: !isEditing }} variant={isEditing ? "outlined" : "filled"} />
                                    </Grid>
                                </Grid>

                                {isEditing && (
                                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                                        <Button 
                                            type="submit" variant="contained" 
                                            size="large" startIcon={<Save />}
                                            disabled={processing}
                                            sx={{ px: 8, borderRadius: 2 }}
                                        >
                                            Guardar Todo
                                        </Button>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </form>
            </Container>
        </MainLayout>
    );
}