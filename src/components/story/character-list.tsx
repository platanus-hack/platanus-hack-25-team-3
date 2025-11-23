import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Chapter } from '@/lib/types';

interface Character {
  name: string;
  description: string;
}

export function CharacterList({ chapters }: { chapters: Chapter[] }) {
  const allCharacters = chapters.reduce((acc, chapter) => {
    chapter.characters.forEach(character => {
      if (!acc.find(c => c.name === character.name)) {
        acc.push(character);
      }
    });
    return acc;
  }, [] as Character[]);

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allCharacters.map((character, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`https://picsum.photos/seed/${character.name.replace(
                    /\s+/g,
                    '-'
                  )}/100/100`}
                  alt={character.name}
                  data-ai-hint="character portrait"
                />
                <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold">{character.name}</p>
                <p className="text-sm text-muted-foreground">
                  {character.description}
                </p>
              </div>
            </div>
          ))}
           {allCharacters.length === 0 && <p className="col-span-full text-center text-muted-foreground">No characters found in this story.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
