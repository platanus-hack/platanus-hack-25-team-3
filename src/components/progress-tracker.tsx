import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Progress } from '@/components/ui/progress';

export function ProgressTracker({ progress }: { progress: number }) {
  const getChestState = () => {
    if (progress >= 100) return 'treasure-chest-full';
    if (progress > 0) return 'treasure-chest-filling';
    return 'treasure-chest-empty';
  }
  const chest = PlaceHolderImages.find((p) => p.id === getChestState());

  const getStatusText = () => {
    if (progress >= 100)
      return "Goal achieved! You're a true StoryQuest champion!";
    if (progress > 0) return `${progress}% of the way there. Keep reading!`;
    return 'Read 1 story this week to fill the chest!';
  };

  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Weekly Goal</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative">
          {chest && (
            <Image
              src={chest.imageUrl}
              alt={chest.description}
              width={150}
              height={150}
              data-ai-hint={chest.imageHint}
              className="transition-transform duration-500 hover:scale-110"
            />
          )}
        </div>
        <div className="w-full">
          <p className="flex h-10 items-center justify-center text-center text-sm text-muted-foreground mb-2">
            {getStatusText()}
          </p>
          <Progress value={progress} className="h-3 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
