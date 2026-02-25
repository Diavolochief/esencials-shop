import React, { useState, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, AppBar, Toolbar, Typography, IconButton,
  Avatar, CssBaseline, ThemeProvider, createTheme, Button, Divider, 
  useMediaQuery, Badge, Menu, MenuItem, Dialog, DialogContent, Slide
} from '@mui/material';
import { 
  Package, LogOut, LogIn, Menu as MenuIcon, ChevronLeft, 
  LayoutDashboard, ShoppingBag, Settings, ShoppingCart, User, Store,
  Search // Importamos el icono de lupa
} from 'lucide-react';

// --- COMPONENTE DE BÚSQUEDA ---
import GlobalSearch from '@/Components/GlobalSearch';

// --- SWEETALERT CONFIGURACIÓN ---
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Configuración del Toast
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
    const container = Swal.getContainer();
    if(container) container.style.zIndex = '99999';
  }
});

const DRAWER_WIDTH = 280;

const theme = createTheme({
  palette: {
    primary: { main: '#0f172a' },
    secondary: { main: '#64748b' },
    background: { default: '#f8fafc' },
  },
  typography: { fontFamily: '"Inter", sans-serif', button: { textTransform: 'none', fontWeight: 600 } },
  shape: { borderRadius: 8 },
});

// Transición para el Modal de Búsqueda Móvil
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

export default function MainLayout({ children }) {
  const { auth, flash, cart_global } = usePage().props; 
  const user = auth?.user;
  const isMasterUser = user?.id === 1;

  // --- ESTADOS ---
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false); // Sidebar cerrado por defecto

  // ESTADO PARA EL BUSCADOR MÓVIL (MODAL)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Estados de Menús
  const [anchorElCart, setAnchorElCart] = useState(null);
  const openCart = Boolean(anchorElCart);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const openUser = Boolean(anchorElUser);

  // --- HANDLERS ---
  const handleDrawerToggle = () => {
    isMobile ? setMobileOpen(!mobileOpen) : setDesktopOpen(!desktopOpen);
  };

  const handleOpenCart = (event) => setAnchorElCart(event.currentTarget);
  const handleCloseCart = () => setAnchorElCart(null);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  // --- EFECTO: ALERTAS ---
  useEffect(() => {
    if (flash?.success) Toast.fire({ icon: 'success', title: flash.success, background: '#f0fdf4', color: '#166534', iconColor: '#22c55e' });
    if (flash?.warning) Toast.fire({ icon: 'warning', title: flash.warning, background: '#fffbeb', color: '#92400e', iconColor: '#f59e0b' });
    if (flash?.error) Toast.fire({ icon: 'error', title: flash.error, background: '#fef2f2', color: '#991b1b', iconColor: '#ef4444' });
  }, [flash]); 

  // --- LISTAS DE NAVEGACIÓN ---
  const publicItems = [
    { text: 'Inicio', icon: <Package size={20} />, route: 'home' },
    { text: 'Catálogo', icon: <Store size={20} />, route: 'catalogo.index' },
  ];

  const sellerItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, route: 'dashboard' },
    { text: 'Mis Productos', icon: <ShoppingBag size={20} />, route: 'products.index' },
  ];
  
  const configItems = [
    { text: 'Config. Sitio', icon: <Settings size={20} />, route: 'admin.banners.index' }
  ];

  // --- CONTENIDO DEL DRAWER (SIDEBAR) ---
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'transparent' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
          <Typography variant="h6" fontWeight={800} color="primary.main">ESSENTIALS.</Typography>
        </Box>
        {!isMobile && (
          <IconButton onClick={() => setDesktopOpen(false)}><ChevronLeft size={20} /></IconButton>
        )}
      </Box>

      <List sx={{ flexGrow: 1, px: 1 }}>
        {publicItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <Link href={route(item.route)} style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}>
              <ListItemButton sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.05)' } }}>
                <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}

        {user && (
          <>
            <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.05)' }} />
            <Typography variant="caption" sx={{ px: 2, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }}>PANEL VENDEDOR</Typography>
            {sellerItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <Link href={route(item.route)} style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}>
                  <ListItemButton sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.05)' } }}>
                    <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}

            {isMasterUser && (
                <>
                    <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.05)' }} />
                    <Typography variant="caption" sx={{ px: 2, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }}>ADMINISTRACIÓN</Typography>
                    {configItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                        <Link href={route(item.route)} style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}>
                        <ListItemButton sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.05)' } }}>
                            <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                        </ListItemButton>
                        </Link>
                    </ListItem>
                    ))}
                </>
            )}
          </>
        )}
      </List>

      <Box sx={{ p: 2 }}>
        {user ? (
          <Link href={route('logout')} method="post" as="button" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
            <ListItemButton sx={{ color: 'error.main', borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
              <ListItemIcon sx={{ color: 'error.main', minWidth: 35 }}><LogOut size={20} /></ListItemIcon>
              <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
            </ListItemButton>
          </Link>
        ) : (
          <Link href={route('login')} style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}>
            <ListItemButton sx={{ color: 'primary.main', borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.05)' }}>
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 35 }}><LogIn size={20} /></ListItemIcon>
              <ListItemText primary="Iniciar Sesión" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
            </ListItemButton>
          </Link>
        )}
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        
        {/* FONDO DECORATIVO */}
        <Box sx={{ position: 'fixed', top: -100, left: -100, width: 400, height: 400, bgcolor: 'rgba(99, 102, 241, 0.15)', borderRadius: '50%', filter: 'blur(80px)', zIndex: -1 }} />
        <Box sx={{ position: 'fixed', bottom: -100, right: -100, width: 300, height: 300, bgcolor: 'rgba(236, 72, 153, 0.1)', borderRadius: '50%', filter: 'blur(80px)', zIndex: -1 }} />

        {/* ================= NAVBAR ================= */}
        <AppBar 
          position="fixed" 
          sx={{ 
            width: { md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' }, 
            ml: { md: desktopOpen ? `${DRAWER_WIDTH}px` : 0 }, 
            transition: theme.transitions.create(['margin', 'width'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }), 
            bgcolor: 'rgba(255,255,255,0.85)', 
            backdropFilter: 'blur(8px)', 
            color: 'text.primary', 
            boxShadow: 'none', 
            borderBottom: '1px solid #e2e8f0', 
            zIndex: (theme) => theme.zIndex.drawer + 1 
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}> {/* justifyContent space-between es clave */}
            
            {/* 1. IZQUIERDA: MENÚ HAMBURGUESA */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                    <MenuIcon />
                </IconButton>
            </Box>
            
            {/* 2. CENTRO: BUSCADOR (SOLO ESCRITORIO) */}
            {/* Usamos flexGrow y márgenes automáticos para centrar absolutamente */}
            <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                flexGrow: 1, 
                justifyContent: 'center',
                position: 'absolute', // Truco para centrado perfecto
                left: 0, 
                right: 0, 
                pointerEvents: 'none' // Para no bloquear clics debajo si se expande mucho
            }}>
                <Box sx={{ pointerEvents: 'auto', width: '100%', maxWidth: 500 }}>
                    <GlobalSearch />
                </Box>
            </Box>

            {/* 3. DERECHA: ACCIONES (BUSCAR MÓVIL + CARRITO + USUARIO) */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                
                {/* BOTÓN LUPA (SOLO MÓVIL) */}
                <IconButton 
                    color="inherit" 
                    onClick={() => setMobileSearchOpen(true)}
                    sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
                >
                    <Search size={24} />
                </IconButton>

                {/* CARRITO */}
                <IconButton color="inherit" sx={{ mr: 1 }} onClick={handleOpenCart}>
                    <Badge badgeContent={cart_global?.count || 0} color="error">
                        <ShoppingCart />
                    </Badge>
                </IconButton>

                {/* USUARIO / LOGIN */}
                {user ? (
                <>
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                        <Avatar src={user.avatar} sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>{user.name.charAt(0)}</Avatar>
                    </IconButton>
                    <Menu sx={{ mt: '45px' }} anchorEl={anchorElUser} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }} open={openUser} onClose={handleCloseUserMenu}>
                        <MenuItem onClick={() => { handleCloseUserMenu(); router.get(route('profile.edit')); }}><ListItemIcon><User size={18} /></ListItemIcon><ListItemText>Mi Perfil</ListItemText></MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { handleCloseUserMenu(); router.post(route('logout')); }}><ListItemIcon><LogOut size={18} color="#ef4444" /></ListItemIcon><ListItemText sx={{ color: 'error.main' }}>Cerrar Sesión</ListItemText></MenuItem>
                    </Menu>
                </>
                ) : (
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                    <Link href={route('login')}><Button variant="text">Ingresar</Button></Link>
                    <Link href={route('register')}><Button variant="contained" disableElevation>Registrarse</Button></Link>
                </Box>
                )}
            </Box>

            {/* MENÚ CARRITO DESPLEGABLE */}
            <Menu anchorEl={anchorElCart} open={openCart} onClose={handleCloseCart} PaperProps={{ elevation: 0, sx: { overflow: 'visible', filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))', mt: 1.5, width: 320, '&:before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0, }, }, }} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}><Typography fontWeight="bold">Tu Carrito</Typography></Box>
                {cart_global?.items && Object.values(cart_global.items).length > 0 ? (
                    Object.values(cart_global.items).slice(0, 3).map((item: any) => (
                        <MenuItem key={item.id} sx={{ gap: 2 }} onClick={() => { handleCloseCart(); router.get(route('cart.index')); }}>
                            <Avatar src={item.image_url} variant="rounded" sx={{ width: 40, height: 40 }} />
                            <Box sx={{ overflow: 'hidden' }}><Typography variant="body2" noWrap fontWeight="bold">{item.name}</Typography><Typography variant="caption" color="text.secondary">{item.quantity} x ${item.price}</Typography></Box>
                        </MenuItem>
                    ))
                ) : (<Box sx={{ p: 2, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">El carrito está vacío</Typography></Box>)}
                <Divider />
                <Box sx={{ p: 2, textAlign: 'center' }}>{cart_global?.total > 0 && (<Typography variant="subtitle2" sx={{ mb: 1 }}>Total: ${cart_global.total.toLocaleString()}</Typography>)}<Link href={route('cart.index')} style={{ textDecoration: 'none' }}><Button variant="contained" fullWidth size="small" onClick={handleCloseCart}>Ver Carrito</Button></Link></Box>
            </Menu>

          </Toolbar>
        </AppBar>

        {/* ================= MODAL BUSCADOR MÓVIL ================= */}
        <Dialog 
            open={mobileSearchOpen} 
            onClose={() => setMobileSearchOpen(false)}
            TransitionComponent={Transition}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: { position: 'fixed', top: 10, m: 2, width: 'calc(100% - 32px)', borderRadius: 3 }
            }}
        >
            <DialogContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <GlobalSearch /> {/* Aquí reutilizamos el buscador */}
                    </Box>
                    <Button onClick={() => setMobileSearchOpen(false)} color="inherit">Cancelar</Button>
                </Box>
            </DialogContent>
        </Dialog>


        {/* ================= DRAWER (SIDEBAR) ================= */}
        <Box component="nav">
          <Drawer 
            variant="temporary" 
            open={mobileOpen} 
            onClose={() => setMobileOpen(false)} 
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
          >
            {drawerContent}
          </Drawer>
          
          <Drawer 
            variant="persistent" 
            open={desktopOpen} 
            sx={{ 
                display: { xs: 'none', md: 'block' }, 
                '& .MuiDrawer-paper': { 
                    boxSizing: 'border-box', 
                    width: DRAWER_WIDTH, 
                    backgroundColor: 'rgba(255, 255, 255, 0.65)', 
                    backdropFilter: 'blur(12px)', 
                    borderRight: '1px solid rgba(255, 255, 255, 0.4)', 
                    boxShadow: '4px 0 24px rgba(0,0,0,0.02)', 
                    height: '100vh' 
                } 
            }}
          >
            {drawerContent}
          </Drawer>
        </Box>

        {/* ================= CONTENIDO PRINCIPAL ================= */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { md: 0 }, width: { md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' }, transition: theme.transitions.create(['margin', 'width'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }) }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}