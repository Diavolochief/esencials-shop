import React, { useState, useMemo } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { 
    Box, Typography, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Grid, InputAdornment, useTheme, useMediaQuery, Container, TablePagination, CircularProgress
} from '@mui/material';
import { Edit, Trash2, Plus, Eye, Image as ImageIcon, X, Search, Upload, Download, TrendingUp } from 'lucide-react';
import Swal from 'sweetalert2';

export default function MyProducts({ products, categories }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); 

    // --- ESTADOS DE BÚSQUEDA Y PAGINACIÓN ---
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- ESTADOS DEL MODAL Y EDICIÓN ---
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [previewMain, setPreviewMain] = useState(null);
    const [previewGallery, setPreviewGallery] = useState([]);

    // --- ESTADOS DEL MODAL DE IMPORTACIÓN EXCEL ---
    const [importOpen, setImportOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Formulario para el Producto Individual (Agregado cost_price)
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '', 
        price: '', 
        cost_price: '', // <--- Agregado
        stock: '', 
        category_id: '',
        condition: 'Nuevo', 
        description: '', 
        image: null, 
        gallery: [],
        _method: 'post' 
    });

    // Formulario para la Importación Masiva
    const importForm = useForm({
        excel: null,
        images: [],
    });

    // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
    const productList = Array.isArray(products) ? products : (products.data || []);
    
    const filteredProducts = useMemo(() => {
        return productList.filter((prod) => 
            prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (prod.category && prod.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [productList, searchTerm]);

    const paginatedProducts = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredProducts.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredProducts, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // --- MANEJO DEL MODAL DE PRODUCTO INDIVIDUAL ---
    const handleOpenCreate = () => {
        setEditMode(false);
        setEditId(null);
        setOpen(true);
    };

    const handleOpenEdit = (product) => {
        setEditMode(true);
        setEditId(product.id);
        
        setData({
            name: product.name,
            price: product.price,
            cost_price: product.cost_price || '', // <--- Agregado
            stock: product.stock,
            category_id: product.category_id,
            condition: product.condition,
            description: product.description || '',
            image: null, 
            gallery: [],
            _method: 'post' 
        });

        setPreviewMain(product.image_url || null);
        
        if (product.images && product.images.length > 0) {
            const existingGallery = product.images.map(img => ({ 
                id: img.id, url: img.image_url, isNew: false 
            }));
            setPreviewGallery(existingGallery);
        } else {
            setPreviewGallery([]);
        }
        
        setOpen(true);
    };
    
    const handleClose = () => { 
        setOpen(false); 
        setTimeout(() => {
            reset(); clearErrors();
            setPreviewMain(null); setPreviewGallery([]); 
            setEditMode(false);
        }, 200); 
    };

    // --- MANEJO DE IMPORTACIÓN EXCEL ---
    const handleImportOpen = () => setImportOpen(true);
    const handleImportClose = () => {
        setImportOpen(false);
        importForm.reset();
        importForm.clearErrors();
        setIsImporting(false);
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importForm.data.excel) return;
        setIsImporting(true);
        importForm.post(route('products.import'), {
            onSuccess: () => {
                handleImportClose();
                Swal.fire({
                    title: '¡Importación Exitosa!',
                    text: 'Los productos se han cargado en el sistema.',
                    icon: 'success',
                    confirmButtonColor: '#0f172a'
                });
            },
            onError: () => { setIsImporting(false); }
        });
    };

    // --- MANEJO DE IMÁGENES ---
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setPreviewMain(URL.createObjectURL(file));
        }
        e.target.value = null; 
    };

    const removeMainImage = (e) => {
        e.preventDefault(); e.stopPropagation();
        setPreviewMain(null); setData('image', null);
    };

    const handleGalleryImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setData('gallery', [...data.gallery, ...files]);
            const newPreviews = files.map(file => ({ url: URL.createObjectURL(file), isNew: true, file: file }));
            setPreviewGallery([...previewGallery, ...newPreviews]);
        }
        e.target.value = null; 
    };

    const removeGalleryImage = (indexToRemove) => {
        const imageToRemove = previewGallery[indexToRemove];
        if (!imageToRemove.isNew && imageToRemove.id) {
            Swal.fire({
                title: '¿Borrar imagen?', text: "Se eliminará permanentemente de la galería.",
                icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, borrar'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.delete(route('products.deleteImage', imageToRemove.id), {
                        preserveScroll: true,
                        onSuccess: () => {
                            const newPreviews = previewGallery.filter((_, index) => index !== indexToRemove);
                            setPreviewGallery(newPreviews);
                        }
                    });
                }
            });
        } else {
            const fileToRemove = imageToRemove.file;
            const newFiles = data.gallery.filter(file => file !== fileToRemove);
            setData('gallery', newFiles);
            const newPreviews = previewGallery.filter((_, index) => index !== indexToRemove);
            setPreviewGallery(newPreviews);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            post(route('products.update', editId), { onSuccess: () => handleClose() });
        } else {
            post(route('products.store'), { onSuccess: () => handleClose() });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Eliminar producto?', text: "No podrás revertir esto", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) router.delete(route('products.destroy', id));
        })
    };

    const handleToggleStatus = (id) => {
        router.post(route('products.toggleStatus', id), {}, { preserveScroll: true });
    };

    return (
        <MainLayout>
            <Head title="Mis Productos" />
            
            <Container maxWidth="xl" sx={{ mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
                
                {/* HEADER Y BUSCADOR */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 4 }}>
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800">
                        Gestión de Inventario
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField 
                            placeholder="Buscar producto..." 
                            size="small"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment>
                            }}
                            sx={{ bgcolor: 'white', borderRadius: 2, minWidth: { sm: 200 } }}
                        />
                        
                        <Button 
                            variant="outlined" 
                            startIcon={<Upload size={18} />} 
                            onClick={handleImportOpen} 
                            size="large" 
                            sx={{ px: 2, borderRadius: 2, fontWeight: 'bold', bgcolor: 'white' }}
                        >
                            Importar
                        </Button>

                        <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleOpenCreate} size="large" sx={{ px: 2, borderRadius: 2, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}>
                            Nuevo
                        </Button>
                    </Box>
                </Box>

                {/* CONTENEDOR DE LA LISTA DE PRODUCTOS */}
                <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    
                    {isMobile ? (
                        <Box sx={{ p: 2 }}>
                            {paginatedProducts.length > 0 ? paginatedProducts.map((product) => {
                                const profit = Number(product.price) - Number(product.cost_price || 0);
                                return (
                                <Paper key={product.id} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #f1f5f9', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <img src={product.image_url || 'https://via.placeholder.com/60'} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} alt="prod" />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1e293b' }}>{product.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">Venta: ${Number(product.price).toLocaleString()} | Ganancia: <span style={{ color: profit >= 0 ? '#2e7d32' : '#d32f2f', fontWeight: 'bold' }}>${profit.toLocaleString()}</span></Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', p: 1, borderRadius: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Stock: {product.stock}</Typography>
                                        <Chip label={product.is_active ? "Activo" : "Inactivo"} color={product.is_active ? "success" : "default"} size="small" onClick={() => handleToggleStatus(product.id)} />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                                        <Button size="small" variant="outlined" color="info" onClick={() => router.get(route('product.show', product.id))}><Eye size={16} /></Button>
                                        <Button size="small" variant="outlined" color="primary" onClick={() => handleOpenEdit(product)}><Edit size={16} /></Button>
                                        <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(product.id)}><Trash2 size={16} /></Button>
                                    </Box>
                                </Paper>
                            )}) : (
                                <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No se encontraron productos.</Typography>
                            )}
                        </Box>
                    ) : (
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table sx={{ minWidth: 700 }}>
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Producto</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Compra / Venta</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Ganancia</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Stock</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Estado</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedProducts.length > 0 ? paginatedProducts.map((product) => {
                                        const profit = Number(product.price) - Number(product.cost_price || 0);
                                        return (
                                        <TableRow key={product.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                    <img src={product.image_url || 'https://via.placeholder.com/40'} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} alt="prod" />
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1e293b' }}>{product.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{product.category?.name || 'S/C'}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block" color="text.secondary">Compra: ${Number(product.cost_price || 0).toLocaleString()}</Typography>
                                                <Typography variant="body2" fontWeight="bold">Venta: ${Number(product.price).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={`$${profit.toLocaleString()}`} 
                                                    size="small" 
                                                    sx={{ bgcolor: profit >= 0 ? '#e8f5e9' : '#ffebee', color: profit >= 0 ? '#2e7d32' : '#d32f2f', fontWeight: 'bold' }} 
                                                />
                                            </TableCell>
                                            <TableCell>{product.stock}</TableCell>
                                            <TableCell>
                                                <Chip label={product.is_active ? "Activo" : "Inactivo"} color={product.is_active ? "success" : "default"} size="small" onClick={() => handleToggleStatus(product.id)} sx={{ cursor: 'pointer', fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" color="info" onClick={() => router.get(route('product.show', product.id))}><Eye size={20} /></IconButton>
                                                <IconButton size="small" color="primary" onClick={() => handleOpenEdit(product)}><Edit size={20} /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(product.id)}><Trash2 size={20} /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )}) : (
                                        <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>No se encontraron productos.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <TablePagination
                        component="div"
                        count={filteredProducts.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        labelRowsPerPage="Filas por página"
                    />
                </Paper>
            </Container>

            {/* ================= MODAL RESPONSIVO ================= */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {editMode ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                        {isMobile && <IconButton onClick={handleClose} size="small" sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}><X size={20} /></IconButton>}
                    </DialogTitle>
                    
                    <DialogContent sx={{ flexGrow: 1, py: 4, display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={{ xs: 4, md: 5 }} sx={{ maxWidth: '800px' }}>
                            <Grid item xs={12} md={7}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>Información General</Typography>
                                <TextField label="Nombre del Producto" fullWidth value={data.name} onChange={e => setData('name', e.target.value)} error={!!errors.name} helperText={errors.name} sx={{ mb: 3 }} />
                                
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    {/* PRECIO COMPRA */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Precio Compra (Costo)" type="number" fullWidth value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                                    </Grid>
                                    {/* PRECIO VENTA */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Precio Venta" type="number" fullWidth value={data.price} onChange={e => setData('price', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} error={!!errors.price} helperText={errors.price} />
                                    </Grid>
                                </Grid>

                                {/* CALCULADORA DE GANANCIA REAL-TIME */}
                                <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px dashed #22c55e', mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUp size={20} color="#16a34a" />
                                        <Typography variant="body2" color="#166534" fontWeight="bold">Ganancia neta:</Typography>
                                    </Box>
                                    <Typography variant="h6" color="#166534" fontWeight="900">
                                        ${(Number(data.price || 0) - Number(data.cost_price || 0)).toLocaleString()}
                                    </Typography>
                                </Box>

                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={12} sm={6}><TextField label="Stock" type="number" fullWidth value={data.stock} onChange={e => setData('stock', e.target.value)} error={!!errors.stock} helperText={errors.stock} /></Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField select label="Categoría" fullWidth value={data.category_id} onChange={e => setData('category_id', e.target.value)} error={!!errors.category_id} helperText={errors.category_id}>
                                            {categories.map((cat) => (<MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>))}
                                        </TextField>
                                    </Grid>
                                </Grid>
                                <TextField select label="Condición" fullWidth value={data.condition} onChange={e => setData('condition', e.target.value)} sx={{ mb: 3 }}>
                                    <MenuItem value="Nuevo">Nuevo</MenuItem><MenuItem value="Usado">Usado</MenuItem>
                                </TextField>
                                <TextField label="Descripción" multiline rows={3} fullWidth value={data.description} onChange={e => setData('description', e.target.value)} />
                            </Grid>
                            
                            <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>Imagen Portada</Typography>
                                <Box component="label" sx={{ width: '100%', height: 220, border: '2px dashed #cbd5e1', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                                    {previewMain ? (
                                        <>
                                            <img src={previewMain} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Port" />
                                            <IconButton size="small" onClick={removeMainImage} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}><X size={16} /></IconButton>
                                        </>
                                    ) : (
                                        <ImageIcon size={48} color="#94a3b8" />
                                    )}
                                    <input type="file" hidden accept="image/*" onChange={handleMainImageChange} />
                                </Box>
                                {/* GALERÍA (Mantenido igual) */}
                                <Typography variant="caption" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Galería Adicional</Typography>
                                <Button variant="outlined" component="label" size="small" startIcon={<Plus />}>Agregar<input type="file" hidden multiple accept="image/*" onChange={handleGalleryImagesChange} /></Button>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, justifyContent: 'center' }}>
                                    {previewGallery.map((img, i) => (
                                        <Box key={i} sx={{ width: 50, height: 50, position: 'relative', border: '1px solid #eee', borderRadius: 1, overflow: 'hidden' }}>
                                            <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <IconButton onClick={() => removeGalleryImage(i)} sx={{ position: 'absolute', top: 0, right: 0, p: 0, bgcolor: 'white' }}><X size={10} /></IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                        {!isMobile && <Button onClick={handleClose} color="inherit">Cancelar</Button>}
                        <Button type="submit" variant="contained" disabled={processing} sx={{ width: { xs: '100%', sm: 200 } }}>
                            {editMode ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* MODAL IMPORTACIÓN (Mantenido igual, con aviso de cost_price) */}
            <Dialog open={importOpen} onClose={handleImportClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleImportSubmit}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Importación Masiva</DialogTitle>
                    <DialogContent sx={{ py: 3 }}>
                        <Typography variant="body2" mb={3}>Asegúrate de incluir la columna <b>cost_price</b> en tu Excel para calcular tus ganancias.</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Button component="label" variant="outlined" fullWidth startIcon={<Download />}>
                                    {importForm.data.excel ? importForm.data.excel.name : 'Subir Excel'}
                                    <input type="file" hidden onChange={(e) => importForm.setData('excel', e.target.files[0])} />
                                </Button>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleImportClose}>Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={isImporting || !importForm.data.excel}>
                            {isImporting ? 'Importando...' : 'Iniciar'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

        </MainLayout>
    );
}