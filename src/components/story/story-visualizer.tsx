'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { generateVisualPrompt } from '@/ai/flows/generate-visual-prompt';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      Generate Prompt
    </Button>
  );
}

export function StoryVisualizer({ content }: { content: string }) {
  const [selectedText, setSelectedText] = useState('');
  const { toast } = useToast();

  const [state, formAction] = useFormState(
    async (_prevState, formData: FormData) => {
      const textToProcess = formData.get('selectedText') as string;
      if (!textToProcess) {
        return {
          visualPromptSuggestion: '',
          error: 'Please select some text from the story.',
        };
      }
      try {
        const result = await generateVisualPrompt({
          selectedText: textToProcess,
        });
        return {
          visualPromptSuggestion: result.visualPromptSuggestion,
          error: '',
        };
      } catch (e) {
        return {
          visualPromptSuggestion: '',
          error: 'Failed to generate prompt. Please try again.',
        };
      }
    },
    { visualPromptSuggestion: '', error: '' }
  );
  
  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
  }, [state.error, toast]);


  const handleTextSelection = () => {
    const text = window.getSelection()?.toString() || '';
    if (text.trim()) {
      setSelectedText(text);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Story Text</CardTitle>
            <CardDescription>
              Click and drag to select text from the story.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onMouseUp={handleTextSelection}
              className="h-96 cursor-text select-text overflow-y-auto rounded-lg border p-4 leading-relaxed text-foreground/90"
            >
              <p>{content}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>AI Visual Prompt Generator</CardTitle>
            <CardDescription>
              Create an image prompt from your selected text.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="selectedText" value={selectedText} />
              <Textarea
                readOnly
                value={selectedText}
                placeholder="Select text from the story on the left to get started..."
                className="h-48"
              />
              <SubmitButton />
            </form>

            {state.visualPromptSuggestion && (
              <Card className="mt-4 rounded-xl bg-muted">
                <CardHeader>
                  <CardTitle className="text-base">
                    Suggested Prompt:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{state.visualPromptSuggestion}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
