import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroCarousel({ banners = [] }) {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = banners.length;

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000); // Cambia cada 5 segundos
    return () => clearInterval(timer);
  }, [activeStep]);

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prev) => (prev - 1 + maxSteps) % maxSteps);
  };

  if (!banners || banners.length === 0) return null;

  return (
    <Paper 
        elevation={4} 
        sx={{ 
            position: 'relative', 
            width: '100%', 
            height: { xs: 250, md: 450 }, // Altura responsiva
            overflow: 'hidden',
            borderRadius: 3,
            mb: 5
        }}
    >
        {banners.map((step, index) => (
            <Box
                key={step.id}
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: activeStep === index ? 1 : 0,
                    transition: 'opacity 0.8s ease-in-out',
                    zIndex: activeStep === index ? 1 : 0,
                    backgroundImage: `url(${step.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Degradado oscuro para que se lea el texto */}
                <Box sx={{ 
                    position: 'absolute', inset: 0, 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)' 
                }} />
                
                {/* Título del Banner */}
                {step.title && (
                    <Box sx={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
                        <Typography variant="h3" color="white" fontWeight="800" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                            {step.title}
                        </Typography>
                    </Box>
                )}
            </Box>
        ))}

        {/* Botones de Navegación (Solo si hay más de 1 imagen) */}
        {maxSteps > 1 && (
            <>
                <IconButton 
                    onClick={handleBack} 
                    sx={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.3)', color: 'white', zIndex: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' } }}
                >
                    <ChevronLeft size={32} />
                </IconButton>
                <IconButton 
                    onClick={handleNext} 
                    sx={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.3)', color: 'white', zIndex: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' } }}
                >
                    <ChevronRight size={32} />
                </IconButton>
                
                {/* Indicadores (Puntitos) */}
                <Box sx={{ position: 'absolute', bottom: 15, width: '100%', display: 'flex', justifyContent: 'center', gap: 1, zIndex: 2 }}>
                    {banners.map((_, index) => (
                        <Box 
                            key={index}
                            onClick={() => setActiveStep(index)}
                            sx={{ 
                                width: activeStep === index ? 24 : 10, 
                                height: 6, 
                                borderRadius: 4, 
                                bgcolor: activeStep === index ? 'primary.main' : 'rgba(255,255,255,0.5)',
                                transition: 'all 0.3s',
                                cursor: 'pointer'
                            }} 
                        />
                    ))}
                </Box>
            </>
        )}
    </Paper>
  );
}