'use server';

import { ChapterList } from '@/components/story/chapter-list';
import { CharacterList } from '@/components/story/character-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzeStory } from '@/ai/flows/analyze-story-flow';
import { Chapter } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';

// This is a mock database. In a real app, you'd fetch from a real database.
const storyCache: Record<
  string,
  { title: string; content: string; chapters: Chapter[] }
> = {
  'alice-in-wonderland': {
    title: 'Alice in Wonderland',
    content:
      'Alice was beginning to get very tired of sitting by her sister on the bank...',
    chapters: [
      {
        id: 1,
        title: 'Down the Rabbit-Hole',
        summary:
          'Alice follows a White Rabbit down a hole and enters Wonderland.',
        characters: [
          { name: 'Alice', description: 'A curious young girl.' },
          {
            name: 'White Rabbit',
            description: 'An anxious rabbit in a waistcoat.',
          },
        ],
        settings: [
          {
            name: 'The river bank',
            description: 'A peaceful spot where Alice and her sister were sitting.',
          },
          {
            name: 'The rabbit-hole',
            description: 'The entrance to Wonderland.',
          },
        ],
      },
      {
        id: 2,
        title: 'The Pool of Tears',
        summary: 'Alice shrinks and grows and cries a pool of tears.',
        characters: [{ name: 'Alice', description: 'A curious young girl.' }],
        settings: [
          {
            name: 'A long hall with many doors',
            description: 'A hall inside the rabbit-hole.',
          },
        ],
      },
    ],
  },
  'the-hobbit': {
    title: 'The Hobbit',
    content:
      'In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole...',
    chapters: [
      {
        id: 1,
        title: 'An Unexpected Party',
        summary:
          'Bilbo Baggins is visited by Gandalf and a company of dwarves.',
        characters: [
          {
            name: 'Bilbo Baggins',
            description: 'A hobbit who enjoys a comfortable, unambitious life.',
          },
          { name: 'Gandalf', description: 'A powerful wizard.' },
        ],
        settings: [
          {
            name: 'Bag End',
            description: "Bilbo's comfortable hobbit-hole.",
          },
        ],
      },
      {
        id: 2,
        title: 'Roast Mutton',
        summary: 'The dwarves are captured by trolls.',
        characters: [
          { name: 'Bilbo Baggins', description: 'A hobbit on an adventure.' },
          { name: 'Trolls', description: 'Large, dim-witted creatures.' },
        ],
        settings: [
          { name: 'A forest', description: 'The woods where the trolls live.' },
        ],
      },
    ],
  },
};

async function getStory(id: string, content?: string) {
  if (storyCache[id]) {
    return storyCache[id];
  }

  if (!content) {
    return null;
  }

  try {
    const analysis = await analyzeStory({ storyContent: content });
    const chaptersWithIds = analysis.chapters.map((chapter, index) => ({
      ...chapter,
      id: index + 1,
    }));

    storyCache[id] = {
      title: analysis.title,
      content,
      chapters: chaptersWithIds,
    };

    return storyCache[id];
  } catch (error) {
    console.error('Failed to analyze story:', error);
    return null;
  }
}

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const content = searchParams?.content as string | undefined;
  const storyData = await getStory(params.id, content);

  if (!storyData) {
    notFound();
  }

  return (
    <div>
      <div className="relative mb-8 h-64 w-full md:h-80">
        <Image
          src={`https://picsum.photos/seed/${params.id}/1200/400`}
          alt={`Banner for ${storyData.title}`}
          fill
          className="object-cover"
          data-ai-hint="story banner"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="container absolute bottom-0 mx-auto max-w-7xl px-4 pb-4 md:px-8 md:pb-8">
          <h1 className="font-headline mb-2 text-4xl font-bold tracking-tighter text-foreground md:text-6xl">
            {storyData.title}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Explora los elementos de tu historia.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <Tabs defaultValue="chapters" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl md:w-[300px]">
            <TabsTrigger value="chapters" className="rounded-lg">
              Capítulos
            </TabsTrigger>
            <TabsTrigger value="characters" className="rounded-lg">
              Personajes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chapters" className="mt-6">
            <ChapterList chapters={storyData.chapters} />
          </TabsContent>
          <TabsContent value="characters" className="mt-6">
            <CharacterList chapters={storyData.chapters} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
