import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Pin, BookText } from 'lucide-react';

interface Character {
  name: string;
  description: string;
}

interface Setting {
  name: string;
  description: string;
}

interface Chapter {
  id: number;
  title: string;
  summary: string;
  characters: Character[];
  settings: Setting[];
}

export function ChapterList({ chapters }: { chapters: Chapter[] }) {
  const chapterIcons = [
    PlaceHolderImages.find(p => p.id === 'chapter-icon-1'),
    PlaceHolderImages.find(p => p.id === 'chapter-icon-2'),
    PlaceHolderImages.find(p => p.id === 'chapter-icon-3'),
  ].filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <Accordion type="single" collapsible className="w-full">
      {chapters.map((chapter, index) => {
        const icon = chapterIcons[index % chapterIcons.length];
        return (
          <AccordionItem value={`item-${index}`} key={chapter.id}>
            <AccordionTrigger className="rounded-lg p-4 transition-colors hover:bg-accent">
              <div className="flex items-center gap-4">
                {icon && (
                  <div className="rounded-lg bg-muted p-2">
                    <Image
                      src={icon.imageUrl}
                      alt={icon.description}
                      width={40}
                      height={40}
                      className="rounded-md"
                      data-ai-hint={icon.imageHint}
                    />
                  </div>
                )}
                <div>
                  <p className="text-left font-semibold text-lg">
                    Capítulo {chapter.id}
                  </p>
                  <p className="text-left text-muted-foreground">
                    {chapter.title}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6">
              <div className="mb-6">
                <h4 className="mb-2 flex items-center text-lg font-semibold">
                  <BookText className="mr-2 h-5 w-5" /> Trama del Capítulo
                </h4>
                <p className="text-base text-foreground/80">
                  {chapter.summary}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-4 flex items-center text-lg font-semibold">
                    <Users className="mr-2 h-5 w-5" /> Personajes
                  </h4>
                  <div className="space-y-4">
                    {chapter.characters.map(character => (
                      <div
                        key={character.name}
                        className="flex items-center gap-3"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`https://picsum.photos/seed/${character.name.replace(
                              /\s+/g,
                              '-'
                            )}/100/100`}
                            alt={character.name}
                            data-ai-hint="character portrait"
                          />
                          <AvatarFallback>
                            {character.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{character.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {character.description}
                          </p>
                        </div>
                      </div>
                    ))}
                    {chapter.characters.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No se identificaron personajes en este capítulo.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 flex items-center text-lg font-semibold">
                    <Pin className="mr-2 h-5 w-5" /> Escenarios
                  </h4>
                  <div className="space-y-3">
                    {chapter.settings.map(setting => (
                      <div key={setting.name}>
                        <p className="font-bold">{setting.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                    ))}
                    {chapter.settings.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No se identificaron escenarios en este capítulo.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
