
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UploadCloud } from 'lucide-react';
import Image from 'next/image';

const stories = [
  {
    id: 'alice-in-wonderland',
    title: 'Alice in Wonderland',
    coverSeed: 'alice',
    category: 'Cuentos Clásicos',
  },
  {
    id: 'the-hobbit',
    title: 'The Hobbit',
    coverSeed: 'hobbit',
    category: 'Leyendas',
  },
  {
    id: 'fables',
    title: 'Fábulas',
    coverSeed: 'fables',
    category: 'Fábulas',
  },
  {
    id: 'poems',
    title: 'Poesías',
    coverSeed: 'poems',
    category: 'Poesías',
  },
];

export default function LibraryPage() {
  return (
    <div
      className="w-full"
      style={{
        backgroundImage: "url('/blue-abstract-background.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        <div className="relative mb-8 h-48 w-full overflow-hidden rounded-2xl md:h-64">
          <Image
            src="https://picsum.photos/seed/library-banner/1200/400"
            alt="Banner de la biblioteca de cuentos"
            fill
            className="object-cover"
            data-ai-hint="kids reading books"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-4xl font-bold md:text-6xl">
              Cuentos Infantiles
            </h1>
            <p className="mt-2 text-lg md:text-xl">
              Un mundo de aventuras te espera
            </p>
          </div>
        </div>

        <div className="mb-8 mx-auto max-w-lg flex gap-2">
          <Input
            type="search"
            placeholder="Realiza tu búsqueda"
            className="flex-grow bg-white"
          />
          <Button type="submit" className="bg-primary text-primary-foreground">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {stories.map(story => (
            <Link href={`/story/${story.id}`} key={story.id} className="group">
              <Card className="h-full overflow-hidden rounded-2xl shadow-md transition-all hover:shadow-xl hover:-translate-y-1 bg-white">
                <div className="relative h-40">
                  <Image
                    src={`https://picsum.photos/seed/${story.coverSeed}/400/250`}
                    fill
                    alt={`Cover for ${story.title}`}
                    className="w-full object-cover"
                    data-ai-hint="book cover"
                  />
                  <div className="absolute bottom-0 w-full bg-black/50 p-2 text-center text-white">
                    <CardTitle className="text-base font-bold">
                      {story.title}
                    </CardTitle>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          <Card className="flex min-h-[188px] h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center bg-white/80">
            <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
            <h3 className="text-base font-bold">Añadir nuevo</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Sube un archivo .txt
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
