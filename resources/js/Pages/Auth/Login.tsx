import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
  Alert
} from '@mui/material';
import { LogIn } from 'lucide-react';

// Tema consistente con el resto de la aplicación
const theme = createTheme({
  palette: {
    primary: { main: '#0f172a' },
    secondary: { main: '#64748b' },
    background: { default: '#f8fafc' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
});

export default function Login({
  status,
  canResetPassword,
}: {
  status?: string;
  canResetPassword: boolean;
}) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Head title="Iniciar Sesión" />

        <Container maxWidth="xs">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Icono Header */}
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                mb: 2,
              }}
            >
              <LogIn size={24} />
            </Box>

            <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Bienvenido de nuevo
            </Typography>

            {/* Mensaje de estado (ej: "Password reset link sent") */}
            {status && (
              <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                {status}
              </Alert>
            )}

            <Box component="form" onSubmit={submit} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                {/* Email */}
                <TextField
                  fullWidth
                  id="email"
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />

                {/* Password */}
                <TextField
                  fullWidth
                  id="password"
                  label="Contraseña"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                />

                {/* Remember Me y Forgot Password */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        color="primary"
                        name="remember"
                      />
                    }
                    label={<Typography variant="body2" color="text.secondary">Recordarme</Typography>}
                  />

                  {canResetPassword && (
                    <Link
                      href={route('password.request')}
                      style={{ textDecoration: 'none' }}
                    >
                      <Typography
                        variant="body2"
                        color="primary"
                        fontWeight={500}
                        sx={{ '&:hover': { textDecoration: 'underline' } }}
                      >
                        ¿Olvidaste tu contraseña?
                      </Typography>
                    </Link>
                  )}
                </Box>

                {/* Botón Submit */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={processing}
                  sx={{ py: 1.5 }}
                >
                  {processing ? 'Iniciando...' : 'Iniciar Sesión'}
                </Button>
              </Stack>

              {/* Link al Registro */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Link
                  href={route('register')}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                  >
                    ¿No tienes una cuenta? <span style={{ fontWeight: 600 }}>Regístrate</span>
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}