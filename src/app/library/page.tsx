// "use client"; // Esta página no usa hooks de cliente directamente, por lo que no es necesario aquí a menos que UploadButton o Link (si son client components) lo requieran.

import Link from 'next/link';
import {
  Card,
  CardContent, // Generalmente no se usa directamente, sino como parte del componente Card
  CardHeader, // Generalmente no se usa directamente, sino como parte del componente Card
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UploadCloud } from 'lucide-react';
import { UploadButton } from '@/components/upload-button';

import Image from 'next/image';

// --- NUEVA DATA SIMULADA CON RUTAS LOCALES ---
// Asegúrate de que estas imágenes existan en public/img/
const stories = [
  {
    id: 'alice-in-wonderland',
    title: 'Alicia en el País de las Maravillas',
    imageUrl: '/img/Alice.png', // Ruta local
    category: 'Cuentos Clásicos',
  },
  {
    id: 'the-hobbit',
    title: 'El Hobbit',
    imageUrl: '/img/Hobbit.png', // Ruta local
    category: 'Leyendas',
  },
  {
    id: 'little-red-riding-hood',
    title: 'Caperucita Roja',
    imageUrl: '/img/Caperuza.png', // Ruta local
    category: 'Cuentos Clásicos',
  },
  {
    id: 'three-little-pigs',
    title: 'Los Tres Cerditos',
    imageUrl: '/img/cerdo.png', // Ruta local
    category: 'Cuentos Clásicos',
  },
];

export default function LibraryPage() {
  return (
    <div
      className="w-full min-h-screen pb-12" // Añadimos min-h-screen y padding-bottom
      style={{
        backgroundImage: "url('/blue-abstract-background.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        {/* Banner de la biblioteca */}
        <div className="relative mb-8 h-48 w-full overflow-hidden rounded-2xl md:h-64 shadow-lg"> {/* Añadimos sombra */}
          <Image
            src="/img/biblioteca.png" // Asegúrate que esta imagen exista
            alt="Banner de la biblioteca de cuentos"
            fill
            className="object-cover"
            data-ai-hint="kids reading books"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4"> {/* Añadido padding */}
            <h1 className="text-3xl font-bold md:text-5xl drop-shadow-lg"> {/* Ajuste de tamaño y sombra de texto */}
              Kippu Cuentos
            </h1>
            <p className="mt-2 text-lg md:text-xl drop-shadow-md">
              Un mundo de aventuras te espera
            </p>
          </div>
        </div>

        {/* --- NUEVA UBICACIÓN DEL BOTÓN AÑADIR NUEVO --- */}
        <div className="mb-6 flex justify-end"> {/* Ajusta justificación para el botón */}
            <UploadButton />
        </div>

        {/* Buscador */}
        <div className="mb-8 mx-auto max-w-lg flex gap-2">
          <Input
            type="search"
            placeholder="Busca tus cuentos favoritos..." // Texto más amigable
            className="flex-grow bg-white border border-gray-300 rounded-full py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Button type="submit" className="bg-primary hover:bg-blue-600 text-primary-foreground rounded-full px-6 py-2 shadow-sm">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>

        {/* Cuadrícula de Cuentos */}
        {/* Cambiado a grid-cols-2 para móvil y md, y grid-cols-3 para lg */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {stories.map(story => (
            <Link href={`/story/${story.id}`} key={story.id} className="group">
              <Card className="h-full overflow-hidden rounded-2xl shadow-md transition-all hover:shadow-xl hover:-translate-y-1 bg-white border-2 border-transparent hover:border-blue-400"> {/* Efecto hover en borde */}
                <div className="relative h-40 w-full"> {/* Añadido w-full explícitamente */}
                  <Image
                    src={story.imageUrl} // Usando la URL local
                    fill
                    alt={`Portada de ${story.title}`}
                    className="object-cover rounded-t-xl" // Bordes redondeados superiores
                    data-ai-hint="book cover"
                  />
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3 text-center text-white"> {/* Gradiente más suave */}
                    <CardTitle className="text-base font-bold drop-shadow-md">
                      {story.title}
                    </CardTitle>
                  </div>
                </div>
                <div className="p-4 text-center"> {/* Padding para el texto debajo de la imagen */}
                  <p className="text-sm text-gray-600">{story.category}</p>
                </div>
              </Card>
            </Link>
          ))}
          {/* Este "Añadir nuevo" ya no es necesario aquí porque lo movimos arriba */}
          {/* <Card className="flex min-h-[188px] h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center bg-white/80">
            <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
            <h3 className="text-base font-bold">Añadir nuevo</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Sube un archivo .txt
            </p>
          </Card> */}
        </div>
      </div>
    </div>
  );
}