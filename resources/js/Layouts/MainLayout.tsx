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
  ShoppingBagIcon, Search, ClipboardList 
} from 'lucide-react';

import GlobalSearch from '@/Components/GlobalSearch';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#18181b', 
  color: '#ffffff',      
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
    const container = Swal.getContainer();
    if(container) container.style.zIndex = '99999';
  }
});

const DRAWER_WIDTH = 260;

const theme = createTheme({
  palette: {
    primary: { main: '#000000' }, 
    secondary: { main: '#71717a' }, 
    background: { default: '#ffffff', paper: '#ffffff' },
  },
  typography: { 
    fontFamily: '"Inter", sans-serif', 
    button: { textTransform: 'none', fontWeight: 500, letterSpacing: '0.3px' } 
  },
  shape: { borderRadius: 4 }, 
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } }
      }
    }
  }
});

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

export default function MainLayout({ children }) {
  const { auth, flash, cart_global } = usePage().props; 
  const user = auth?.user;
  const isMasterUser = user?.id === 1;

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false); 
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [anchorElCart, setAnchorElCart] = useState(null);
  const openCart = Boolean(anchorElCart);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const openUser = Boolean(anchorElUser);

  const handleDrawerToggle = () => isMobile ? setMobileOpen(!mobileOpen) : setDesktopOpen(!desktopOpen);
  const handleOpenCart = (event) => setAnchorElCart(event.currentTarget);
  const handleCloseCart = () => setAnchorElCart(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  useEffect(() => {
    if (flash?.success) Toast.fire({ icon: 'success', title: flash.success });
    if (flash?.warning) Toast.fire({ icon: 'warning', title: flash.warning });
    if (flash?.error) Toast.fire({ icon: 'error', title: flash.error });
  }, [flash]); 

  const publicItems = [
    { text: 'Inicio', icon: <Package size={18} strokeWidth={1.5} />, route: 'home' },
    { text: 'Catálogo', icon: <Store size={18} strokeWidth={1.5} />, route: 'catalogo.index' },
    { text: 'Mis Compras', icon: <ShoppingBagIcon size={18} strokeWidth={1.5} />, route: 'mis_compras.index' },
  ];

  const adminItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} />, route: 'dashboard' },
    { text: 'Gestión Ventas', icon: <ClipboardList size={18} strokeWidth={1.5} />, route: 'admin.ventas' },
    { text: 'Mis Productos', icon: <ShoppingBag size={18} strokeWidth={1.5} />, route: 'products.index' },
    { text: 'Config. Sitio', icon: <Settings size={18} strokeWidth={1.5} />, route: 'admin.banners.index' }
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={900} letterSpacing={1.5} color="primary.main">ESSENTIALS.</Typography>
        {!isMobile && (
          <IconButton onClick={() => setDesktopOpen(false)} size="small"><ChevronLeft size={18} /></IconButton>
        )}
      </Box>
      <List sx={{ flexGrow: 1, px: 2 }}>
        {publicItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <Link href={route(item.route)} style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}>
              <ListItemButton sx={{ borderRadius: 1.5, py: 1, color: 'text.secondary', '&:hover': { bgcolor: '#f4f4f5', color: '#000' } }}>
                <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
        {isMasterUser && (
          <>
            <Divider sx={{ my: 3, borderColor: '#f4f4f5' }} />
            <Typography variant="overline" sx={{ px: 2, mb: 1, display: 'block', color: '#a1a1aa', fontWeight: 600, letterSpacing: 1 }}>ADMINISTRACIÓN</Typography>
            {adminItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <Link href={route(item.route)} style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}>
                  <ListItemButton sx={{ borderRadius: 1.5, py: 1, color: 'text.secondary', '&:hover': { bgcolor: '#f4f4f5', color: '#000' } }}>
                    <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
          </>
        )}
      </List>
      <Box sx={{ p: 2 }}>
        {user ? (
          <Link href={route('logout')} method="post" as="button" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
            <ListItemButton sx={{ borderRadius: 1.5, color: 'text.secondary', '&:hover': { bgcolor: '#fff1f2', color: '#ef4444' } }}>
              <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}><LogOut size={18} strokeWidth={1.5} /></ListItemIcon>
              <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
            </ListItemButton>
          </Link>
        ) : (
          <Link href={route('login')} style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}>
            <ListItemButton sx={{ borderRadius: 1.5, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#27272a' } }}>
              <ListItemIcon sx={{ minWidth: 32, color: '#fff' }}><LogIn size={18} strokeWidth={1.5} /></ListItemIcon>
              <ListItemText primary="Iniciar Sesión" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
            </ListItemButton>
          </Link>
        )}
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        
        {/* ================= NAVBAR CORREGIDO ================= */}
        <AppBar 
          position="fixed" 
          sx={{ 
            width: '100%',
            transition: theme.transitions.create(['margin', 'width'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }), 
            bgcolor: '#ffffff', 
            color: '#000000', 
            boxShadow: 'none', 
            borderBottom: '1px solid #f4f4f5', 
            zIndex: (theme) => theme.zIndex.drawer + 1 
          }}
        >
          {/* EL TRUCO: Toolbar limita donde aparecen los iconos para alinearse al contenido */}
          <Toolbar sx={{ 
              justifyContent: 'space-between', 
              minHeight: '64px !important',
              maxWidth: { xs: '350px', md: desktopOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' }, 
              width: '100%',
              mx: 'auto', // Centra la barra
              px: { xs: 1, sm: 2 } 
          }}>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: { xs: 'block', md: desktopOpen ? 'none' : 'block' } }}>
                    <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                        <MenuIcon size={20} strokeWidth={1.5} />
                    </IconButton>
                </Box>
                {(!desktopOpen && !isMobile) && (
                    <Typography variant="h6" fontWeight={900} letterSpacing={1} sx={{ fontSize: '1rem' }}>
                        ESSENTIALS.
                    </Typography>
                )}
                {isMobile && (
                    <Typography variant="h6" fontWeight={900} sx={{ fontSize: '0.9rem', ml: 1 }}>ESSENTIALS.</Typography>
                )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton color="inherit" onClick={() => setMobileSearchOpen(true)} sx={{ display: { xs: 'flex', md: 'none' } }}>
                    <Search size={20} strokeWidth={1.5} />
                </IconButton>

                <IconButton color="inherit" onClick={handleOpenCart}>
                    <Badge badgeContent={cart_global?.count || 0} sx={{ '& .MuiBadge-badge': { bgcolor: '#000', color: '#fff', fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
                        <ShoppingCart size={18} strokeWidth={1.5} />
                    </Badge>
                </IconButton>

                {user ? (
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 0.5 }}>
                        <Avatar src={user.avatar} sx={{ width: 30, height: 30, bgcolor: '#000', fontSize: '0.8rem' }}>{user.name.charAt(0)}</Avatar>
                    </IconButton>
                ) : (
                    <Link href={route('login')} style={{ marginLeft: '8px' }}><User size={18} strokeWidth={1.5}/></Link>
                )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* MENÚS (User y Carrito) */}
        <Menu sx={{ mt: '45px' }} anchorEl={anchorElUser} open={openUser} onClose={handleCloseUserMenu} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} PaperProps={{ elevation: 0, sx: { border: '1px solid #f4f4f5', borderRadius: 2, minWidth: 180 } }}>
            <MenuItem onClick={() => { handleCloseUserMenu(); router.get(route('profile.edit')); }} sx={{ py: 1.5 }}><ListItemIcon><User size={16} /></ListItemIcon><ListItemText primaryTypographyProps={{ fontSize: '0.85rem' }}>Mi Perfil</ListItemText></MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => { handleCloseUserMenu(); router.post(route('logout')); }}><ListItemIcon><LogOut size={16} color="#ef4444" /></ListItemIcon><ListItemText primaryTypographyProps={{ fontSize: '0.85rem' }} sx={{ color: 'error.main' }}>Cerrar Sesión</ListItemText></MenuItem>
        </Menu>

        <Menu anchorEl={anchorElCart} open={openCart} onClose={handleCloseCart} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }} PaperProps={{ elevation: 0, sx: { border: '1px solid #f4f4f5', borderRadius: 2, mt: 1.5, width: 320 } }} >
            <Box sx={{ p: 2, borderBottom: '1px solid #f4f4f5' }}><Typography fontWeight="600" fontSize="0.9rem">Tu Bolsa</Typography></Box>
            {cart_global?.items && Object.values(cart_global.items).length > 0 ? (
                Object.values(cart_global.items).slice(0, 3).map((item) => (
                    <MenuItem key={item.id} sx={{ gap: 2, py: 1.5 }} onClick={() => { handleCloseCart(); router.get(route('cart.index')); }}>
                        <Avatar src={item.image_url} variant="square" sx={{ width: 40, height: 40, borderRadius: 1 }} />
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="body2" noWrap fontWeight="500" fontSize="0.85rem">{item.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.quantity} x ${Number(item.price).toLocaleString()}</Typography>
                        </Box>
                    </MenuItem>
                ))
            ) : ( <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">Vacía</Typography></Box> )}
            <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
                <Link href={route('cart.index')} style={{ textDecoration: 'none' }}><Button variant="contained" fullWidth sx={{ bgcolor: '#000', color: '#fff' }} onClick={handleCloseCart}>Ver Bolsa</Button></Link>
            </Box>
        </Menu>

        <Dialog open={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} TransitionComponent={Transition} fullWidth maxWidth="sm" PaperProps={{ sx: { position: 'fixed', top: 0, m: 2, width: 'calc(100% - 32px)', borderRadius: 2 } }}>
            <DialogContent sx={{ p: 1.5 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ flexGrow: 1 }}><GlobalSearch /></Box><Button onClick={() => setMobileSearchOpen(false)} sx={{ color: '#71717a', minWidth: 'auto' }}>Cerrar</Button></Box></DialogContent>
        </Dialog>

        {/* DRAWER */}
        <Box component="nav">
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}>{drawerContent}</Drawer>
          <Drawer variant="persistent" open={desktopOpen} sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid #f4f4f5' } }}>{drawerContent}</Drawer>
        </Box>

        {/* ================= MAIN CONTENT CORREGIDO ================= */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            width: '100%',
            // Límite estricto de 350px en móvil para que el header y el cuerpo se alineen
            maxWidth: { xs: '350px', md: '100%' }, 
            mx: 'auto', // Centrado
            mt: 8, 
            p: { xs: 1, md: 4 },
            overflowX: 'hidden',
            transition: theme.transitions.create(['margin', 'width'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen })
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}