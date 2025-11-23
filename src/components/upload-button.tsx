'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UploadCloud, Loader2, FileSearch } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Importación del SDK de Supabase
import { createClient } from '@supabase/supabase-js';

// Inicialización del cliente Supabase (Cliente/Browser)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificamos y creamos el cliente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing.");
}
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');


export function UploadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false); // Nuevo estado
  const [fileName, setFileName] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Restablece todos los estados del componente a su valor inicial.
   */
  const resetState = () => {
    setIsOpen(false);
    setIsUploading(false);
    setIsGeneratingAssets(false);
    setFileName(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  /**
   * Maneja la selección y procesamiento del archivo (TXT o PDF).
   */
  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      resetState();
      return;
    }

    const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (!isTxt && !isPdf) {
      alert("Por favor, sube un archivo .txt o .pdf.");
      resetState();
      return;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
        alert("Error de configuración: Las claves de Supabase no están disponibles.");
        resetState();
        return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setIsOpen(true);

    try {
      const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const storyId = fileNameWithoutExt.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let textContent = '';

      const storagePath = `stories/${storyId}-${Date.now()}.${isPdf ? 'pdf' : 'txt'}`;

      if (isTxt) {
        textContent = await new Promise<string>((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = (e) => resolve(e.target?.result as string);
          fileReader.onerror = reject;
          fileReader.readAsText(file, 'UTF-8');
        });
      } else if (isPdf) {
        setIsUploading(true);
        const { error: uploadError } = await supabase.storage
          .from('cuentos')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Error al subir a Storage: ${uploadError.message}`);
        }
      }

      // 1. LLAMADA A LA FUNCIÓN 1: PROCESAMIENTO DE TEXTO Y GENERACIÓN DE JSON RPG
      setIsUploading(false);
      setIsGeneratingAssets(true); // Cambiamos el estado de carga/análisis

      const EDGE_FUNCTION_NAME_1 = 'process-story';
      const edgeFunctionUrl1 = `${supabaseUrl}/functions/v1/${EDGE_FUNCTION_NAME_1}`;

      const processResponse = await fetch(edgeFunctionUrl1, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
            filePath: storagePath,
            storyId: storyId,
            isPdf: isPdf,
            textContent: isTxt ? textContent : null
        }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.error || 'Error en el Paso 1 (Texto/JSON RPG).');
      }

      const { text: processedText, rpg_data } = await processResponse.json();

      // 2. LLAMADAS PARALELAS: GENERACIÓN DE PROMPTS Y CREACIÓN DEL DSL DE JUEGO
      // Ambas funciones pueden ejecutarse en paralelo ya que no dependen una de la otra.

      const EDGE_FUNCTION_NAME_2 = 'generate-asset-prompts';
      const edgeFunctionUrl2 = `${supabaseUrl}/functions/v1/${EDGE_FUNCTION_NAME_2}`;

      const EDGE_FUNCTION_NAME_3 = 'create-game-dsl';
      const edgeFunctionUrl3 = `${supabaseUrl}/functions/v1/${EDGE_FUNCTION_NAME_3}`;

      // Ejecutar ambas llamadas en paralelo
      const [assetResponse, dslResponse] = await Promise.all([
        fetch(edgeFunctionUrl2, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
              story_id: storyId,
              rpg_assets_json: rpg_data
          }),
        }),
        fetch(edgeFunctionUrl3, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
              storyId: storyId,
              text: processedText,
              rpg_data: rpg_data
          }),
        })
      ]);

      if (!assetResponse.ok) {
        const errorData = await assetResponse.json();
        throw new Error(errorData.error || 'Error en el Paso 2 (Generación de Prompts).');
      }

      if (!dslResponse.ok) {
        const errorData = await dslResponse.json();
        throw new Error(errorData.error || 'Error en el Paso 2 (Creación del DSL de Juego).');
      }

      // Obtener los resultados de ambas llamadas
      const assetData = await assetResponse.json();
      const dslData = await dslResponse.json();

      console.log('=== ASSET RESPONSE ===');
      console.log(JSON.stringify(assetData, null, 2));

      console.log('=== DSL RESPONSE ===');
      console.log(JSON.stringify(dslData, null, 2));

      const asset_urls = assetData.asset_urls;
      const gameDsl = dslData.game_json; // Extract game_json from response

      console.log('=== EXTRACTED DATA ===');
      console.log('Asset URLs:', JSON.stringify(asset_urls, null, 2));
      console.log('Game DSL:', JSON.stringify(gameDsl, null, 2));

      // Guardar datos en sessionStorage para pasarlos a la página de juego
      sessionStorage.setItem('currentGameData', JSON.stringify({
        assetUrls: asset_urls,
        gameDsl: gameDsl
      }));

      // --- NAVEGACIÓN ---
      // Navegar a la página del juego

      setTimeout(() => {
        setIsGeneratingAssets(false);
        setIsOpen(false);
        setFileName(null);

        router.push(`/play`);
      }, 1000); // Reducimos la simulación de tiempo

    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      alert(`Error crítico en el pipeline: ${error instanceof Error ? error.message : "Error desconocido"}`);
      resetState();
    }
  };

  /**
   * Manejador para el input de archivo estándar.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files?.[0] || null);
  };

  // Funciones de Drag and Drop (sin cambios)
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-primary', 'bg-accent');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('border-primary', 'bg-accent');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-primary', 'bg-accent');
    handleFileSelect(event.dataTransfer.files?.[0] || null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isUploading && !isGeneratingAssets) { // Usamos el nuevo estado
          resetState();
        } else if (open) {
          setIsOpen(open);
        }
      }}>
        <DialogTrigger asChild>
          <Button
            className="h-12 px-6 rounded-lg shadow-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
            onClick={() => setIsOpen(true)}
          >
            <UploadCloud size={20} />
            Añadir Nuevo Cuento
          </Button>
        </DialogTrigger>

        <DialogContent className="rounded-lg sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sube tu Cuento</DialogTitle>
            <DialogDescription>
              Arrastra y suelta tu archivo **.txt o .pdf**, o haz clic para buscar.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {isUploading || isGeneratingAssets ? ( // Mostramos el estado de carga unificado
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-semibold">
                  {isUploading
                    ? 'Subiendo y extrayendo texto...'
                    : 'Generando prompts de imagen con IA...'}
                </p>
                <p className="text-sm text-muted-foreground">{fileName}</p>
                {isGeneratingAssets && (
                  <div className="w-full text-left text-sm text-muted-foreground mt-2">
                    <p className="animate-pulse" style={{ animationDelay: '0.2s' }}>
                      Analizando elementos de RPG...
                    </p>
                    <p className="animate-pulse" style={{ animationDelay: '0.7s' }}>
                      Creando descripciones visuales...
                    </p>
                    <p className="animate-pulse" style={{ animationDelay: '1.2s' }}>
                      Almacenando recetas de arte en DB...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary hover:bg-accent"
              >
                <FileSearch className="h-12 w-12 text-muted-foreground" />
                <p className="font-semibold">Arrastra y suelta un archivo **.txt o .pdf** aquí</p>
                <p className="text-sm text-muted-foreground">o</p>
                <input
                  type="file"
                  accept=".txt,.pdf"
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
