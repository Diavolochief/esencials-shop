import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { 
    Grid, Typography, Card, CardContent, 
    Box, Container, Button, Chip, Tabs, Tab, TextField,
    InputAdornment, useTheme, useMediaQuery
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
    banners = [], 
    topProducts = [],      
    catalogueProducts = [], 
    categories = [], 
    filters = {}           
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || 'all');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleCategoryChange = (event, newValue) => {
        setSelectedCategory(newValue);
        router.get(
            route('home'), 
            { category_id: newValue, search: searchQuery }, 
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearchChange = (event) => setSearchQuery(event.target.value);

    const executeSearch = (e) => {
        if(e.key === 'Enter') {
            router.get(
                route('home'), 
                { category_id: selectedCategory, search: searchQuery }, 
                { preserveState: true, preserveScroll: true }
            );
        }
    };

    const ProductCard = ({ product }) => (
        <Link href={route('product.show', product.id)} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
            <Card sx={{ 
                height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', 
                borderRadius: { xs: 2, md: 3 }, boxShadow: '0 4px 10px rgba(0,0,0,0.03)', 
                border: '1px solid #f1f5f9', transition: 'all 0.2s ease', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px -5px rgba(0,0,0,0.1)', borderColor: 'transparent' }
            }}>
                {product.status && (
                    <Box sx={{ position: 'absolute', top: 6, left: 6, zIndex: 10 }}>
                        <Chip label={product.status} size="small" color="primary" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }} />
                    </Box>
                )}
                
                <Box sx={{ pt: { xs: 1.5, sm: 2 }, px: 1, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 110, sm: 160, md: 180 } }}>
                    <Box component="img" src={product.image_url || 'https://via.placeholder.com/300'} alt={product.name} sx={{ height: '100%', width: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </Box>
                
                <CardContent sx={{ p: { xs: 1, sm: 2 }, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
                    <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                            {product.category?.name || 'S/C'}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.9rem', md: '0.95rem' }, color: '#1e293b', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {product.name}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Typography variant="subtitle2" fontWeight={800} color="primary.main" sx={{ fontSize: { xs: '0.85rem', sm: '1rem', md: '1.1rem' } }}>
                            ${Number(product.price).toLocaleString()}
                        </Typography>
                        <Box sx={{ bgcolor: '#f1f5f9', borderRadius: '50%', p: { xs: 0.5, sm: 0.8 }, color: '#64748b', display: 'flex' }}>
                            <ShoppingCart size={isMobile ? 14 : 18} />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Link>
    );

    return (
        <MainLayout>
            <Head title="Inicio" />

            {/* 🔥 EL SECRETO ESTÁ AQUÍ: Límite estricto en móvil 🔥 */}
            {/* Limitamos TODA la página a 350px en celulares y la centramos, escondiendo cualquier desborde */}
            <Box sx={{ 
                width: '100%', 
                maxWidth: { xs: '350px', sm: '100%' }, // Limita a 350px solo en móviles (xs)
                mx: 'auto', // Centra el contenedor si es más pequeño que la pantalla
                overflowX: 'hidden', // Corta de raíz cualquier cosa que intente salir de la caja
                position: 'relative' 
            }}>

                {/* 1. CARRUSEL PRINCIPAL (HERO) */}
                <Box sx={{ width: '100%', height: { xs: '350px', sm: '500px', md: '70vh' }, mb: { xs: 4, md: 6 }, bgcolor: '#0f172a' }}>
                    <Swiper
                        modules={[Navigation, SwiperPagination, Autoplay, EffectFade]}
                        effect={'fade'} slidesPerView={1} navigation={!isMobile}
                        pagination={{ clickable: true }} autoplay={{ delay: 6000 }}
                        style={{ width: '100%', height: '100%', '--swiper-theme-color': '#fff' }}
                    >
                        {(banners.length > 0 ? banners : [{ id: 1, title: 'Bienvenido', subtitle: 'Descubre nuestra colección', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070' }]).map((banner) => (
                            <SwiperSlide key={`banner-${banner.id}`}>
                                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <Box component="img" src={banner.image_url} alt={banner.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.5)' }} />
                                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: { xs: 2, sm: 4 } }}>
                                        <Box maxWidth="md">
                                            <Typography variant="h1" sx={{ color: 'white', fontWeight: 900, mb: 1, fontSize: { xs: '2rem', sm: '3.5rem', md: '5rem' }, lineHeight: 1.1, textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
                                                {banner.title}
                                            </Typography>
                                            <Typography variant="h5" sx={{ color: 'grey.300', mb: { xs: 3, sm: 4 }, fontSize: { xs: '0.9rem', sm: '1.2rem', md: '1.5rem' }, textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
                                                {banner.subtitle}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>

                {/* Contenedor con padding mínimo en móvil para aprovechar el espacio */}
                <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 3, md: 4 }, overflow: 'hidden' }}>
                    
                    {/* 2. MÁS CALIFICADOS */}
                    <Box sx={{ mb: { xs: 5, md: 8 }, width: '100%' }}>
                        <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800} sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                            <Heart color="#ef4444" fill="#ef4444" size={isMobile ? 20 : 24} /> Los Más Deseados
                        </Typography>
                        
                        {/* Contenedor estricto para que el Swiper no expanda la pantalla */}
                        <Box sx={{ width: '100%', minWidth: 0, px: 1 }}>
                            <Swiper
                                modules={[Navigation, Autoplay]}
                                spaceBetween={isMobile ? 12 : 20}
                                slidesPerView={isMobile ? 2.1 : 4} 
                                navigation={!isMobile}
                                autoplay={{ delay: 4000, disableOnInteraction: false }}
                                breakpoints={{
                                    600: { slidesPerView: 3, spaceBetween: 20 }, 
                                    900: { slidesPerView: 4, spaceBetween: 20 }, 
                                }}
                                style={{ paddingBottom: '15px', paddingTop: '5px' }} 
                            >
                                {topProducts.map((product) => (
                                    <SwiperSlide key={`top-${product.id}`} style={{ height: 'auto' }}>
                                        <ProductCard product={product} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </Box>
                    </Box>

                    {/* 3. CATÁLOGO GRID */}
                    <Box sx={{ mb: 8, width: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 3, gap: 2, px: 1 }}>
                            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800}>
                                Nuestro Catálogo
                            </Typography>
                            <TextField 
                                placeholder="Buscar producto..." variant="outlined" size="small" fullWidth={isMobile} value={searchQuery} onChange={handleSearchChange} onKeyDown={executeSearch}
                                sx={{ width: { xs: '100%', md: 300 }, bgcolor: 'white' }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} className="text-gray-400"/></InputAdornment>, sx: { borderRadius: 2, fontSize: '0.9rem' } }}
                            />
                        </Box>

                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 3, md: 4 }, width: '100%', maxWidth: '100vw' }}>
                            <Tabs 
                                value={selectedCategory} onChange={handleCategoryChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile textColor="primary" indicatorColor="primary"
                                sx={{ '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none', fontSize: { xs: '0.8rem', md: '1rem' }, minWidth: 'auto', px: { xs: 1.5, md: 3 }, py: { xs: 1, md: 2 } } }}
                            >
                                <Tab label="Todos" value="all" />
                                {categories.map((cat) => (
                                    <Tab key={`cat-${cat.id}`} label={cat.name} value={String(cat.id)} />
                                ))}
                            </Tabs>
                        </Box>

                        <Box sx={{ px: 1 }}>
                            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                                {catalogueProducts.length > 0 ? (
                                    catalogueProducts.map((product) => (
                                        <Grid item xs={6} sm={4} md={3} key={`grid-${product.id}`}>
                                            <ProductCard product={product} />
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <Box sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 4, border: '2px dashed #cbd5e1' }}>
                                            <Search size={32} className="mx-auto text-gray-400 mb-2" />
                                            <Typography variant="subtitle1" color="text.secondary" fontWeight="bold">No se encontraron productos</Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                        <Box sx={{ mt: { xs: 4, md: 6 }, display: 'flex', justifyContent: 'center', px: 1 }}>
                            <Button component={Link} href={route('catalogo.index')} variant="outlined" size={isMobile ? "medium" : "large"} fullWidth={isMobile} sx={{ borderRadius: 50, px: 6, py: {xs: 1.2, md: 1.5}, fontWeight: 'bold', borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
                                Ver Catálogo Completo
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </MainLayout>
    );
}