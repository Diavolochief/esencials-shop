import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Autocomplete, TextField, InputAdornment, CircularProgress, Box, Typography, Avatar, IconButton } from '@mui/material';
import { Search } from 'lucide-react';
import axios from 'axios';

export default function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handleSearch = async (event, query) => {
        setInputValue(query);
        if (query.length < 2) {
            setOptions([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(route('products.search'), { params: { query } });
            setOptions(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- FUNCIÓN PARA EJECUTAR LA BÚSQUEDA GENERAL ---
    const triggerSearch = () => {
        // Cierra el autocompletado y manda al usuario a la página de resultados (Home)
        setOpen(false);
        if (inputValue.trim()) {
            // Envía el término 'search' al backend
            router.get(route('home'), { search: inputValue });
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.defaultPrevented = true;
            triggerSearch(); // Reutilizamos la función
        }
    };

    return (
        <Autocomplete
            id="global-search"
            freeSolo
            sx={{ 
                width: { xs: 200, sm: 300, md: 400 },
                bgcolor: 'background.paper',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': { paddingRight: '10px !important' }
            }}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            onInputChange={handleSearch}
            inputValue={inputValue}
            options={options}
            loading={loading}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
            // Al seleccionar una opción específica, vamos a su detalle
            onChange={(event, product) => {
                if (product && typeof product !== 'string') {
                    router.get(route('product.show', product.id));
                }
            }}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <li key={key} {...optionProps}>
                         <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Avatar src={option.image_url} variant="rounded" sx={{ width: 30, height: 30, mr: 2 }}>{option.name.charAt(0)}</Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight="bold">{option.name}</Typography>
                                <Typography variant="caption" color="text.secondary">${option.price}</Typography>
                            </Box>
                         </Box>
                    </li>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder="Buscar por nombre o categoría..."
                    variant="outlined"
                    size="small"
                    onKeyDown={handleKeyDown}
                    InputProps={{
                        ...params.InputProps,
                        // --- AQUÍ ESTÁ EL CAMBIO: BOTÓN DE BÚSQUEDA ---
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {/* Botón Lupa al final para confirmar búsqueda */}
                                <IconButton 
                                    onClick={triggerSearch} 
                                    edge="end" 
                                    size="small"
                                    sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, ml: 1, width: 32, height: 32, borderRadius: 1 }}
                                >
                                    <Search size={18} />
                                </IconButton>
                            </>
                        ),
                    }}
                    sx={{ '& fieldset': { border: 'none' } }}
                />
            )}
        />
    );
}