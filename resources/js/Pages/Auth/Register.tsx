// resources/js/Pages/Auth/Register.jsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Button, TextField, Typography, Container, Paper } from '@mui/material';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Head title="Registro Rápido" />
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
                    Crear Cuenta
                </Typography>
                <Box component="form" onSubmit={submit} sx={{ mt: 2 }}>
                    <TextField
                        label="Nombre" fullWidth required margin="normal"
                        value={data.name} onChange={e => setData('name', e.target.value)}
                        error={!!errors.name} helperText={errors.name}
                    />
                    <TextField
                        label="Email" type="email" fullWidth required margin="normal"
                        value={data.email} onChange={e => setData('email', e.target.value)}
                        error={!!errors.email} helperText={errors.email}
                    />
                    <TextField
                        label="Contraseña" type="password" fullWidth required margin="normal"
                        value={data.password} onChange={e => setData('password', e.target.value)}
                    />
                    <TextField
                        label="Confirmar Contraseña" type="password" fullWidth required margin="normal"
                        value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)}
                    />
                    <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3 }} disabled={processing}>
                        Siguiente: Datos de envío
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}