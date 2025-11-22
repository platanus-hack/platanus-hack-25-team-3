'use client';

import { useState, useRef } from 'react'; // Agregamos useRef por si se necesita para algo, aunque no es crítico aquí
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger, // ¡Importante! Añadir DialogTrigger
} from '@/components/ui/dialog';
import { UploadCloud, Loader2, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UploadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null); // Todavía útil para el input de archivo

  const handleFileSelect = async (file: File | null) => {
    if (file && file.type === 'text/plain') {
      setFileName(file.name);
      setIsUploading(true);

      const fileReader = new FileReader();
      fileReader.readAsText(file, 'UTF-8');

      fileReader.onload = async (e) => {
        const content = e.target?.result as string;

        setIsUploading(false);
        setIsAnalyzing(true);

        const storyId = file.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace('.txt', '');

        // Usar setTimeout para simular el tiempo de análisis
        setTimeout(() => {
          setIsAnalyzing(false);
          setIsOpen(false); // Cierra el diálogo al finalizar
          setFileName(null);
          
          const queryParams = new URLSearchParams({ content });
          router.push(`/story/${storyId}?${queryParams.toString()}`);
        }, 3000);
      };

      fileReader.onerror = () => {
        console.error("Failed to read file");
        alert("Failed to read file. Please try again."); // Feedback al usuario
        resetState();
      }
    } else {
      alert("Please upload a .txt file.");
      resetState();
    }
    // Siempre resetear el input del archivo para permitir subir el mismo archivo de nuevo
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files?.[0] || null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-primary', 'bg-accent'); // Resaltar área de drop
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('border-primary', 'bg-accent'); // Quitar resaltado
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-primary', 'bg-accent'); // Quitar resaltado
    handleFileSelect(event.dataTransfer.files?.[0] || null);
  };

  const resetState = () => {
    setIsOpen(false);
    setIsUploading(false);
    setIsAnalyzing(false);
    setFileName(null);
  }

  // Si está cargando o analizando, el diálogo de progreso debería bloquear la interacción
  // Se mostrará un diálogo diferente o una superposición.
  // El estado de `isOpen` controla el diálogo principal.

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        // Solo resetear si el diálogo se cierra y no estamos en medio de una carga/análisis
        if (!open && !isUploading && !isAnalyzing) {
          resetState();
        } else {
          setIsOpen(open); // Abrir/cerrar normalmente
        }
      }}>
        <DialogTrigger asChild>
          {/* Este es el botón que se queda donde lo coloques */}
          {/* Se han quitado las clases 'fixed', 'bottom-6', 'right-6', 'z-40' */}
          <Button
            className="h-12 px-6 rounded-lg shadow-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2" // Estilo más de botón normal
          >
            <UploadCloud size={20} />
            Añadir Nuevo Cuento
          </Button>
        </DialogTrigger>

        <DialogContent className="rounded-lg sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sube tu Cuento</DialogTitle>
            <DialogDescription>
              Arrastra y suelta tu archivo .txt o haz clic para buscar.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {isUploading || isAnalyzing ? (
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-semibold">
                  {isUploading ? 'Leyendo archivo...' : 'Analizando cuento...'}
                </p>
                <p className="text-sm text-muted-foreground">{fileName}</p>
                {isAnalyzing && (
                  <div className="w-full text-left text-sm text-muted-foreground mt-2">
                    <p
                      className="animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    >
                      Escaneando capítulos...
                    </p>
                    <p
                      className="animate-pulse"
                      style={{ animationDelay: '0.7s' }}
                    >
                      Identificando personajes...
                    </p>
                    <p
                      className="animate-pulse"
                      style={{ animationDelay: '1.2s' }}
                    >
                      Mapeando escenarios...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave} // Añadido
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()} // Haz clic en el área para abrir el selector
                className="relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary hover:bg-accent"
              >
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="font-semibold">Arrastra y suelta un archivo .txt aquí</p>
                <p className="text-sm text-muted-foreground">o</p>
                {/* El botón interno de "Browse Files" ya no es necesario si el div completo es clickeable */}
                {/* <Button variant="default">Browse Files</Button> */}
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}