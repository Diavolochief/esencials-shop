import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { 
    Grid, Typography, Card, CardMedia, CardContent, 
    Box, Container, Button, Chip, Tabs, Tab, TextField,
    InputAdornment, useTheme, useMediaQuery, Rating
} from '@mui/material';
import { Heart, Search, ShoppingCart, ArrowRight } from 'lucide-react';

// --- SWIPER ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as SwiperPagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function Welcome({ 
    auth, 
    banners = [], // Banners desde tus settings
    topRatedProducts = [], // Productos más calificados
    products = [], // Lista de productos para la grilla
    categories = [] // Categorías para las Tabs
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // --- ESTADOS PARA TABS Y BÚSQUEDA RÁPIDA ---
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // --- LÓGICA DE FILTRADO (CLIENT-SIDE) ---
    // Filtramos los productos según la tab seleccionada y lo que se escriba en el buscador
    const filteredProducts = useMemo(() => {
        // Asegurarnos de tener un array (si viene paginado de Laravel, usar products.data)
        const items = Array.isArray(products) ? products : (products.data || []);
        
        return items.filter(product => {
            // 1. Filtro por Categoría
            const matchCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
            // 2. Filtro por Búsqueda Rápida
            const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchCategory && matchSearch;
        }).slice(0, 12); // Limitamos a 12 para hacer la cuadrícula 4x3 (4 columnas x 3 filas)
    }, [products, selectedCategory, searchQuery]);

    // Handlers
    const handleCategoryChange = (event, newValue) => setSelectedCategory(newValue);
    const handleSearchChange = (event) => setSearchQuery(event.target.value);

    // Componente Reutilizable: Tarjeta de Producto
    const ProductCard = ({ product }) => (
        <Link href={route('product.show', product.id)} style={{ textDecoration: 'none' }}>
            <Card sx={{ 
                height: '100%', position: 'relative', borderRadius: 4, 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
                transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 20px -5px rgba(0,0,0,0.1)', borderColor: 'transparent' }
            }}>
                {product.status && (
                    <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
                        <Chip label={product.status} size="small" color="primary" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }} />
                    </Box>
                )}
                
                <Box sx={{ pt: 2, px: 2, bgcolor: '#f8fafc', borderTopLeftRadius: 16, borderTopRightRadius: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 140, sm: 180 } }}>
                    <CardMedia 
                        component="img" 
                        sx={{ height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                        image={product.image_url || 'https://via.placeholder.com/300'} 
                        alt={product.name}
                    />
                </Box>
                
                <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ mb: 0.5, fontSize: { xs: '0.85rem', md: '0.95rem' }, color: '#1e293b' }}>
                        {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mt: 1 }}>
                        <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                            ${Number(product.price).toLocaleString()}
                        </Typography>
                        <Box sx={{ bgcolor: '#f1f5f9', borderRadius: '50%', p: 0.5, color: '#64748b', display: 'flex', transition: '0.2s', '&:hover': { bgcolor: '#e2e8f0', color: '#ef4444' } }}>
                            <ShoppingCart size={16} />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Link>
    );

    return (
        <MainLayout>
            <Head title="Inicio" />

            {/* ================= 1. CARRUSEL PRINCIPAL (BANNERS DE SETTINGS) ================= */}
            <Box sx={{ width: '100%', position: 'relative', aspectRatio: { xs: '4/5', sm: '21/9' }, maxHeight: '70vh', mb: { xs: 4, md: 6 }, overflow: 'hidden', bgcolor: '#0f172a', borderRadius: {xs: 0, md: 4} }}>
                <Swiper
                    modules={[Navigation, SwiperPagination, Autoplay, EffectFade]}
                    effect={'fade'} slidesPerView={1} navigation={!isMobile}
                    pagination={{ clickable: true }} autoplay={{ delay: 6000 }}
                    style={{ width: '100%', height: '100%', '--swiper-theme-color': '#fff' }}
                >
                    {/* Si no hay banners, mostramos uno de relleno para que no se rompa el diseño */}
                    {(banners.length > 0 ? banners : [{ id: 1, title: 'Bienvenido a Sonidec', subtitle: 'Descubre nuestra nueva colección', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop' }]).map((banner) => (
                        <SwiperSlide key={banner.id}>
                            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                                <Box component="img" src={banner.image_url} alt={banner.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.5)' }} />
                                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 2 }}>
                                    <Box maxWidth="md">
                                        <Typography variant="h1" sx={{ color: 'white', fontWeight: 900, mb: 1, fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' }, lineHeight: 1, textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
                                            {banner.title}
                                        </Typography>
                                        <Typography variant="h5" sx={{ color: 'grey.300', mb: 4, fontSize: { xs: '1rem', md: '1.5rem' }, fontWeight: 400, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                            {banner.subtitle}
                                        </Typography>
                                        <Button variant="contained" size={isMobile ? "medium" : "large"} endIcon={<ArrowRight size={20} />} sx={{ borderRadius: 50, px: { xs: 3, md: 5 }, py: { xs: 1.2, md: 1.5 }, fontWeight: 'bold', bgcolor: 'white', color: 'black', '&:hover': { bgcolor: 'grey.200' } }}>
                                            Ver Colección
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>

            <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
                
                {/* ================= 2. CARRUSEL: MÁS CALIFICADOS ================= */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Heart color="#ef4444" fill="#ef4444" size={24} /> Los Más Deseados
                    </Typography>
                    
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={2} // 2 en celular
                        navigation={!isMobile}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        breakpoints={{
                            600: { slidesPerView: 3 }, // 3 en tablet
                            900: { slidesPerView: 4 }, // 4 en PC
                            1200: { slidesPerView: 5 }, // 5 en pantallas grandes
                        }}
                        style={{ paddingBottom: '20px' }} // Espacio para la sombra de las cards
                    >
                        {/* Usamos mock data si topRatedProducts está vacío */}
                        {(topRatedProducts.length > 0 ? topRatedProducts : products.data?.slice(0,6) || []).map((product) => (
                            <SwiperSlide key={`top-${product.id}`}>
                                <Box sx={{ height: '100%' }}>
                                    <ProductCard product={product} />
                                </Box>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>

                {/* ================= 3. CATÁLOGO GRID (4x3) CON TABS Y BÚSQUEDA ================= */}
                <Box sx={{ mb: 8 }}>
                    
                    {/* Header de la sección: Título + Buscador */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'flex-end' }, mb: 3, gap: 2 }}>
                        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800}>
                            Nuestro Catálogo
                        </Typography>
                        
                        {/* BUSCADOR RÁPIDO */}
                        <TextField 
                            placeholder="Buscar en el catálogo..."
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            sx={{ width: { xs: '100%', md: 300 }, bgcolor: 'white', borderRadius: 2 }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search size={18} className="text-gray-400"/></InputAdornment>,
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Box>

                    {/* TABS DE CATEGORÍAS */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                        <Tabs 
                            value={selectedCategory} 
                            onChange={handleCategoryChange} 
                            variant="scrollable" 
                            scrollButtons="auto"
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{ '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' } }}
                        >
                            <Tab label="Todos los productos" value="all" />
                            {categories.map((cat) => (
                                <Tab key={cat.id} label={cat.name} value={cat.id} />
                            ))}
                        </Tabs>
                    </Box>

                    {/* GRID DE PRODUCTOS (Max 12 ítems = 4 columnas x 3 filas) */}
                    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                // xs=6 (2 columnas móvil), md=3 (4 columnas PC)
                                <Grid item xs={6} sm={4} md={3} key={`grid-${product.id}`}>
                                    <ProductCard product={product} />
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 4, border: '2px dashed #cbd5e1' }}>
                                    <Search size={40} className="mx-auto text-gray-400 mb-2" />
                                    <Typography variant="h6" color="text.secondary">No se encontraron productos</Typography>
                                    <Typography variant="body2" color="text.secondary">Intenta buscar con otros términos o selecciona otra categoría.</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>

                    {/* Botón Ver Más */}
                    {filteredProducts.length >= 12 && (
                        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                            <Button variant="outlined" size="large" sx={{ borderRadius: 50, px: 6, fontWeight: 'bold', borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
                                Ver Catálogo Completo
                            </Button>
                        </Box>
                    )}

                </Box>
            </Container>
        </MainLayout>
    );
}