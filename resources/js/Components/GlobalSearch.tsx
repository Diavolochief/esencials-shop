import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react'; // Importar usePage
import { Autocomplete, TextField, InputAdornment, Box, Typography, Avatar, IconButton } from '@mui/material';
import { Search } from 'lucide-react';

export default function GlobalSearch() {
    // 1. OBTENEMOS LOS PRODUCTOS GLOBALES DESDE INERTIA
    const { searchable_products } = usePage().props; 
    
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);

    // Función para ir a la página de resultados generales (Enter o Lupa)
    const triggerSearch = () => {
        setOpen(false);
        if (inputValue.trim()) {
            router.get(route('catalogo.index'), { search: inputValue });
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.defaultPrevented = true;
            triggerSearch();
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
            
            // 2. PASAMOS LA LISTA COMPLETA, MUI FILTRA SOLO
            options={searchable_products || []} 
            
            // Configurar qué texto se usa para filtrar (Nombre + Categoría)
            getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.name;
            }}
            
            // Control del input
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}

            // Acción al seleccionar una opción de la lista
            onChange={(event, product) => {
                if (product && typeof product !== 'string') {
                    router.get(route('product.show', product.id));
                }
            }}

            // Cómo se ve cada opción en la lista
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <li key={key} {...optionProps}>
                         <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Avatar 
                                src={option.image_url} 
                                variant="rounded" 
                                sx={{ width: 30, height: 30, mr: 2 }}
                            >
                                {option.name.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight="bold">
                                    {option.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {option.category?.name} - ${option.price}
                                </Typography>
                            </Box>
                         </Box>
                    </li>
                );
            }}

            // El Input visual
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder="Buscar..."
                    variant="outlined"
                    size="small"
                    onKeyDown={handleKeyDown}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <IconButton 
                                onClick={triggerSearch} 
                                edge="end" 
                                size="small"
                                sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, width: 32, height: 32, borderRadius: 1 }}
                            >
                                <Search size={18} />
                            </IconButton>
                        ),
                    }}
                    sx={{ '& fieldset': { border: 'none' } }}
                />
            )}
        />
    );
}