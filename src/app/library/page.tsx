"use client"; // Esta página no usa hooks de cliente directamente, por lo que no es necesario aquí a menos que UploadButton o Link (si son client components) lo requieran.

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
// Cada cuento ahora incluye gameDsl y assetUrls necesarios para renderizar el juego
const stories = [
  {
    id: 'alice-in-wonderland',
    title: 'Alicia en el País de las Maravillas',
    imageUrl: '/img/Alice.png',
    category: 'Cuentos Clásicos',
    gameDsl: null, // Se llenará con el DSL del juego
    assetUrls: null, // Se llenará con las URLs de los assets generados
  },
  {
    id: 'the-hobbit',
    title: 'El gato con botas',
    imageUrl: '/img/Hobbit.png',
    category: 'Leyendas',
    gameDsl: {
        "players": {
            "sprites": [
                "gato_con_botas"
            ]
        },
        "scenes": {
            "scene_01": {
                "background": "bg_forest_clearing",
                "music": "happy",
                "narrator": {
                    "lines": [
                        "El gato, usando su ingenio, atrapa un conejo y lo presenta al rey como un regalo de su amo, el Marqués de Carabás."
                    ]
                },
                "npcs": [
                    {
                        "id": "rey",
                        "x": 0.75,
                        "y": 0.5,
                        "dialog": "dialog_01",
                        "gives_item": null
                    }
                ],
                "items_ground": [
                    {
                        "item": "bolsa",
                        "x": 0.25,
                        "y": 0.5,
                        "dialog": null
                    }
                ],
                "branches": [
                    {
                        "direction": "north",
                        "target": "scene_02"
                    },
                    {
                        "direction": "south",
                        "target": "scene_03"
                    }
                ]
            },
            "scene_02": {
                "background": "bg_riverbank",
                "music": "emotional",
                "narrator": {
                    "lines": [
                        "El gato convence a su amo de bañarse en el río como parte de un ardid para impresionar al rey."
                    ]
                },
                "npcs": [],
                "items_ground": [],
                "branches": [
                    {
                        "direction": "south",
                        "target": "scene_01"
                    },
                    {
                        "direction": "north",
                        "target": "scene_04"
                    }
                ]
            },
            "scene_03": {
                "background": "bg_castle_exterior",
                "music": "suspense",
                "narrator": {
                    "lines": [
                        "El gato amenaza a los campesinos para que declaren que sus tierras pertenecen al Marqués de Carabás."
                    ]
                },
                "npcs": [],
                "items_ground": [],
                "branches": [
                    {
                        "direction": "west",
                        "target": "scene_04"
                    },
                    {
                        "direction": "east",
                        "target": "scene_02"
                    }
                ]
            },
            "scene_04": {
                "background": "bg_castle_exterior",
                "music": "melancholic",
                "narrator": {
                    "lines": [
                        "El gato derrota al ogro y reclama el castillo para su amo, culminando su astuto plan."
                    ]
                },
                "npcs": [
                    {
                        "id": "ogro",
                        "x": 0.6,
                        "y": 0.5,
                        "dialog": "dialog_02",
                        "gives_item": "botas"
                    }
                ],
                "items_ground": [],
                "branches": [
                    {
                        "direction": "south",
                        "target": "scene_03"
                    },
                    {
                        "direction": "east",
                        "target": "scene_02"
                    }
                ]
            }
        },
        "dialogs": {
            "dialog_01": [
                {
                    "character": "rey",
                    "text": "¡Vaya! Un conejo de campo, ¿dices que es un regalo del Marqués de Carabás? Le estoy muy agradecido."
                },
                {
                    "character": "narrator",
                    "text": "El rey recibe el regalo con agrado, impresionado por la generosidad del Marqués."
                }
            ],
            "dialog_02": [
                {
                    "character": "ogro",
                    "text": "¡Rrraugh! Puedo transformarme en cualquier criatura que desee, ¡observa!"
                },
                {
                    "character": "narrator",
                    "text": "El ogro se transforma para demostrar su poder, pero es engañado y derrotado por el astuto gato."
                }
            ]
        }
    },
    assetUrls: [
      {
          "asset_id": "6d5f3b3b-1f9b-4781-98f4-582972f258d4",
          "name": "rey",
          "image_url": "https://fvskofzzinfydpebayih.supabase.co/storage/v1/object/public/characters/perrault-charles-el-gato-con-botas/rey.png"
      },
      {
          "asset_id": "86648113-5acc-49fa-a7b9-9563f93bd84d",
          "name": "princesa",
          "image_url": "https://fvskofzzinfydpebayih.supabase.co/storage/v1/object/public/characters/perrault-charles-el-gato-con-botas/princesa.png"
      },
      {
          "asset_id": "08fa5275-ed8f-49fc-9c8e-a6b63eb5cc3a",
          "name": "ogro",
          "image_url": "https://fvskofzzinfydpebayih.supabase.co/storage/v1/object/public/characters/perrault-charles-el-gato-con-botas/ogro.png"
      },
      {
          "asset_id": "abc43ca0-4b9b-4492-a400-c258d0dfa8da",
          "name": "botas",
          "image_url": "https://fvskofzzinfydpebayih.supabase.co/storage/v1/object/public/characters/perrault-charles-el-gato-con-botas/botas.png"
      },
      {
          "asset_id": "a18965cc-c82a-4b42-98d9-188c90dc69e6",
          "name": "bolsa",
          "image_url": "https://fvskofzzinfydpebayih.supabase.co/storage/v1/object/public/characters/perrault-charles-el-gato-con-botas/bolsa.png"
      },
      {
          "asset_id": "3c376aef-0a7e-4a81-8f83-af4e92145c50",
          "name": "bg_forest_clearing",
          "image_url": "https://fvskofzzinfydpebayih.supabase.co/storage/v1/object/public/characters/perrault-charles-el-gato-con-botas/bg_forest_clearing.png"
      },
      {
          "asset_id": "c05f6755-a836-43d4-8b71-59fd5bc75621",
          "name": "bg_riverbank",
          "image_url": "https://fvskofzzinfydpebayih.supabase.co/storage/v1/object/public/characters/perrault-charles-el-gato-con-botas/bg_riverbank.png"
      },
      {
          "asset_id": "fedff3b1-5053-48ca-9410-bafdff6e68fc",
          "name": "bg_castle_exterior",
          "image_url": "https://fvskofzzinfydpebayih.supabase.co/storage/v1/object/public/characters/perrault-charles-el-gato-con-botas/bg_castle_exterior.png"
      }
    ],
  },
  {
    id: 'little-red-riding-hood',
    title: 'Caperucita Roja',
    imageUrl: '/img/Caperuza.png',
    category: 'Cuentos Clásicos',
    gameDsl: null,
    assetUrls: null,
  },
  {
    id: 'three-little-pigs',
    title: 'Los Tres Cerditos',
    imageUrl: '/img/cerdo.png',
    category: 'Cuentos Clásicos',
    gameDsl: null,
    assetUrls: null,
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
        <div className="relative mb-8 w-full overflow-hidden rounded-2xl h-80">
          <Image
            src="/img/logo.jpg"
            alt="Banner de la biblioteca de cuentos"
            fill
            className="object-contain" // ¡Cambiado de 'object-cover' a 'object-contain'!
            data-ai-hint="kids reading books"
            priority
          />
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
            <button
              key={story.id}
              onClick={() => {
                // Guardar datos del juego en sessionStorage y navegar
                if (story.gameDsl && story.assetUrls) {
                  sessionStorage.setItem('currentGameData', JSON.stringify({
                    assetUrls: story.assetUrls,
                    gameDsl: story.gameDsl
                  }));
                  window.location.href = '/play';
                } else {
                  alert('Este cuento aún no está disponible para jugar');
                }
              }}
              className="group text-left"
            >
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
            </button>
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
