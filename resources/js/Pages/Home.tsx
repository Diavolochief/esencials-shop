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
                borderRadius: 1, // Minimalista: menos redondeado
                boxShadow: 'none', // Sin sombras pesadas
                border: '1px solid #f1f1f1', // Borde ultra fino
                transition: 'all 0.2s ease', 
                '&:hover': { borderColor: '#000' } // Cambio sutil al pasar el mouse
            }}>
                {product.status && (
                    <Box sx={{ position: 'absolute', top: 6, left: 6, z_index: 10 }}>
                        <Chip label={product.status} size="small" sx={{ bgcolor: '#000', color: '#fff', borderRadius: 0, height: 18, fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }} />
                    </Box>
                )}
                
                {/* Medidas respetadas tal cual las pediste */}
                <Box sx={{ pt: { xs: 1.5, sm: 2 }, px: 1, bgcolor: '#fafafa', display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 110, sm: 160, md: 180 } }}>
                    <Box component="img" src={product.image_url || 'https://via.placeholder.com/300'} alt={product.name} sx={{ height: '90%', width: '90%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </Box>
                
                <CardContent sx={{ p: { xs: 1, sm: 1.5 }, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#a1a1aa', display: 'block', mb: 0.5, fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {product.category?.name || 'S/C'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.7rem', sm: '0.85rem' }, fontWeight: 500, color: '#000', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {product.name}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#000', fontSize: { xs: '0.8rem', sm: '0.95rem' } }}>
                            ${Number(product.price).toLocaleString()}
                        </Typography>
                        <Box sx={{ color: '#000', display: 'flex' }}>
                            <ShoppingCart size={isMobile ? 12 : 16} strokeWidth={1.5} />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Link>
    );

    return (
        <MainLayout>
            <Head title="Inicio" />

            {/* Medida de 350px respetada */}
            <Box sx={{ 
                width: '100%', 
                maxWidth: { xs: '350px', sm: '100%' }, 
                mx: 'auto', 
                overflowX: 'hidden', 
                position: 'relative',
                bgcolor: '#fff'
            }}>

                {/* 1. CARRUSEL PRINCIPAL - Medidas respetadas, estilo limpio */}
                <Box sx={{ width: '100%', height: { xs: '350px', sm: '500px', md: '70vh' }, mb: { xs: 4, md: 6 }, bgcolor: '#000' }}>
                    <Swiper
                        modules={[Navigation, SwiperPagination, Autoplay, EffectFade]}
                        effect={'fade'} slidesPerView={1} navigation={!isMobile}
                        pagination={{ clickable: true }} autoplay={{ delay: 6000 }}
                        style={{ width: '100%', height: '100%', '--swiper-theme-color': '#fff', '--swiper-pagination-bullet-inactive-color': '#fff' }}
                    >
                        {(banners.length > 0 ? banners : [{ id: 1, title: 'BIENVENIDO', subtitle: 'Colección Esencial', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070' }]).map((banner) => (
                            <SwiperSlide key={`banner-${banner.id}`}>
                                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <Box component="img" src={banner.image_url} alt={banner.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.7)' }} />
                                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 2 }}>
                                        <Box>
                                            <Typography variant="h1" sx={{ color: 'white', fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', sm: '3rem', md: '4rem' }, textTransform: 'uppercase', letterSpacing: 2 }}>
                                                {banner.title}
                                            </Typography>
                                            <Typography variant="h5" sx={{ color: 'white', opacity: 0.9, fontWeight: 300, fontSize: { xs: '0.8rem', sm: '1.2rem' }, textTransform: 'uppercase', letterSpacing: 3 }}>
                                                {banner.subtitle}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>

                <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3, md: 4 }, overflow: 'hidden' }}>
                    
                    {/* 2. MÁS CALIFICADOS */}
                    <Box sx={{ mb: { xs: 5, md: 8 }, width: '100%' }}>
                        <Typography sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, px: 1, fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            Los Más Deseados
                        </Typography>
                        
                        <Box sx={{ width: '100%', minWidth: 0, px: 1 }}>
                            <Swiper
                                modules={[Navigation, Autoplay]}
                                spaceBetween={isMobile ? 12 : 20}
                                slidesPerView={isMobile ? 2.1 : 4} 
                                navigation={!isMobile}
                                autoplay={{ delay: 4000, disableOnInteraction: false }}
                                style={{ paddingBottom: '15px' }}
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
                            <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.8rem' }, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Catálogo
                            </Typography>
                            <TextField 
                                placeholder="Buscar..." variant="standard" size="small" fullWidth={isMobile} value={searchQuery} onChange={handleSearchChange} onKeyDown={executeSearch}
                                sx={{ width: { xs: '100%', md: 240 }, bgcolor: 'transparent' }}
                                InputProps={{ 
                                    startAdornment: <InputAdornment position="start"><Search size={16} color="#000"/></InputAdornment>, 
                                    sx: { fontSize: '0.85rem', '&:after': { borderBottom: '2px solid #000' } } 
                                }}
                            />
                        </Box>

                        <Box sx={{ borderBottom: 1, borderColor: '#f1f1f1', mb: 3, width: '100%' }}>
                            <Tabs 
                                value={selectedCategory} onChange={handleCategoryChange} variant="scrollable" scrollButtons="auto" 
                                textColor="inherit" 
                                sx={{ 
                                    '& .MuiTabs-indicator': { bgcolor: '#000', height: 2 },
                                    '& .MuiTab-root': { fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1, minWidth: 'auto', px: 2, color: '#a1a1aa', '&.Mui-selected': { color: '#000' } } 
                                }}
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
                                        <Box sx={{ p: 6, textAlign: 'center', border: '1px dashed #e2e2e2' }}>
                                            <Typography variant="body2" color="text.secondary">No se encontraron productos</Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', px: 1 }}>
                            <Button 
                                component={Link} href={route('catalogo.index')} variant="outlined" 
                                sx={{ 
                                    borderRadius: 0, px: 5, py: 1.5, color: '#000', borderColor: '#000', 
                                    fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1.5,
                                    '&:hover': { bgcolor: '#000', color: '#fff', borderColor: '#000' } 
                                }}
                            >
                                Ver Todo
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </MainLayout>
    );
}