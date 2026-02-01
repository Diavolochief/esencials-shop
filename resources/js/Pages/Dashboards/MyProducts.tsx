import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { useForm } from '@inertiajs/react';
import { 
    Container, Typography, Button, Table, TableBody, TableCell, 
    TableHead, TableRow, Paper, Modal, Box, TextField, MenuItem, IconButton 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

// Estilo del Modal
const modalStyle = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

export default function MyProducts({ auth, my_products, categories }) {
    const [open, setOpen] = useState(false);
    
    // Inertia Form Helper
    const { data, setData, post, processing, reset } = useForm({
        name: '', price: '', category_id: '', condition: 'bueno', description: '', image: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('products.store'), {
            onSuccess: () => { setOpen(false); reset(); }
        });
    };

    return (
        <MainLayout user={auth.user}>
            <Container sx={{ mt: 4 }}>
                <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="h4">Mis Ventas</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                        Vender Artículo
                    </Button>
                </Box>

                {/* Tabla Minimalista */}
                <Paper elevation={0} sx={{ border: '1px solid #eee' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Producto</TableCell>
                                <TableCell>Precio</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {my_products?.map((prod) => (
                                <TableRow key={prod.id}>
                                    <TableCell>{prod.name}</TableCell>
                                    <TableCell>${prod.price}</TableCell>
                                    <TableCell>{prod.condition}</TableCell>
                                    <TableCell>
                                        <Typography color={prod.is_sold ? 'error' : 'success.main'} variant="caption" fontWeight="bold">
                                            {prod.is_sold ? 'VENDIDO' : 'DISPONIBLE'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!my_products || my_products.length === 0) && (
                                <TableRow><TableCell colSpan={4} align="center">Aún no has subido productos</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>

                {/* Modal Formulario */}
                <Modal open={open} onClose={() => setOpen(false)}>
                    <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="h6">Nuevo Producto</Typography>
                            <IconButton onClick={() => setOpen(false)}><CloseIcon /></IconButton>
                        </Box>
                        
                        <TextField fullWidth label="Título" margin="dense" 
                            onChange={e => setData('name', e.target.value)} value={data.name} required />
                        
                        <Box display="flex" gap={2}>
                            <TextField fullWidth label="Precio" type="number" margin="dense" 
                                onChange={e => setData('price', e.target.value)} value={data.price} required />
                            <TextField select fullWidth label="Estado" margin="dense" 
                                onChange={e => setData('condition', e.target.value)} value={data.condition}>
                                <MenuItem value="nuevo">Nuevo</MenuItem>
                                <MenuItem value="bueno">Bueno</MenuItem>
                                <MenuItem value="usado">Usado</MenuItem>
                            </TextField>
                        </Box>

                        <TextField select fullWidth label="Categoría" margin="dense" 
                                onChange={e => setData('category_id', e.target.value)} value={data.category_id}>
                                {categories?.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                ))}
                        </TextField>

                        <TextField fullWidth multiline rows={3} label="Descripción" margin="dense" 
                            onChange={e => setData('description', e.target.value)} value={data.description} />

                        {/* Input archivo manual simple */}
                        <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
                            Subir Foto
                            <input type="file" hidden onChange={e => setData('image', e.target.files[0])} />
                        </Button>
                        {data.image && <Typography variant="caption">{data.image.name}</Typography>}

                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={processing}>
                            Publicar
                        </Button>
                    </Box>
                </Modal>
            </Container>
        </MainLayout>
    );
}