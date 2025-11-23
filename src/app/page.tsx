"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { UploadButton } from '@/components/upload-button';
import { useEffect, useState } from 'react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'kiddie-hero');

  return (
    <div className="flex flex-col items-center min-h-screen"> {/* <-- Añadido min-h-screen aquí también para el cuerpo principal */}
      <section
        className="w-full bg-white relative min-h-screen flex items-center justify-center" // <-- min-h-screen, flexbox para centrar contenido
        style={{
          backgroundImage: "url('/lined-paper-bg.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: 'cover', // Aseguramos que el fondo cubra toda el área
        }}
      >
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center justify-center h-full py-12 md:py-24 gap-8"> {/* Mantener grid para md, flexbox para móvil */}
          <div className="text-center md:text-left flex flex-col justify-center items-center md:items-start h-full"> {/* Centrar texto/contenido en móvil */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 font-headline">
              ¡Bienvenido a Cuenti!
            </h1>
            <p className="text-4xl md:text-6xl font-extrabold text-primary mt-2 font-headline">
              Juega, aprende
              <br />
              y crece juntos.
            </p>
            {/* El botón 'Comenzar Aventura' se mostrará cuando termine la barra de progreso (5s). */}
          </div>
          <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center"> {/* Contenedor de imagen flexible, con altura mínima */}
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-contain" // <-- object-contain es mejor para no cortar la imagen en este caso
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
          </div>
          {/* Barra de progreso: aparecerá debajo de la imagen en vista móvil (por estar después de la imagen en el DOM) */}
          <div className="w-full md:col-span-2 px-4 mt-8 md:mt-0"> {/* Ajuste de margen para móvil */}
            <ProgressWithDelay duration={5000} />
          </div>
        </div>
      </section>

      {/* Si UploadButton va fuera de la sección h-screen, se mostrará debajo */}
      <UploadButton /> 
    </div>
  );
}

function ProgressWithDelay({ duration = 5000 }: { duration?: number }) {
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    let elapsed = 0;
    const interval = 50; // ms
    const totalSteps = Math.ceil(duration / interval);
    const step = 100 / totalSteps;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress(prev => {
        const next = Math.min(100, +(prev + step).toFixed(2));
        return next;
      });
      if (elapsed >= duration) {
        clearInterval(timer);
        setProgress(100);
        setShowButton(true);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div className="container mx-auto mt-6">
      <div className="max-w-xl mx-auto">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <div
            className="h-3 bg-primary transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 text-center">
          {showButton ? (
            <Button
              asChild
              size="lg"
              className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-bold text-lg px-8 py-4"
            >
              <Link href="/library">Comenzar Aventura</Link>
            </Button>
          ) : (
            <p className="text-sm text-gray-500">Preparando tu aventura...</p>
          )}
        </div>
      </div>
    </div>
  );
}