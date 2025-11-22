
'use server';

/**
 * @fileOverview A flow that analyzes a story's text to extract chapters, characters, and settings.
 *
 * - analyzeStory - A function that handles the story analysis process.
 * - AnalyzeStoryInput - The input type for the analyzeStory function.
 * - AnalyzeStoryOutput - The return type for the analyzeStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CharacterSchema = z.object({
  name: z.string().describe('The name of the character.'),
  description: z.string().describe('A brief description of the character.'),
});

const SettingSchema = z.object({
  name: z.string().describe('The name of the setting.'),
  description: z.string().describe('A brief description of the setting.'),
});

const ChapterSchema = z.object({
  title: z.string().describe('The title of the chapter.'),
  summary: z
    .string()
    .describe(
      'A complete narration of the chapter\'s plot, telling the full story of what happens from beginning to end. It must be detailed and comprehensive.'
    ),
  characters: z
    .array(CharacterSchema)
    .describe('A list of all characters that appear in this chapter.'),
  settings: z
    .array(SettingSchema)
    .describe('A list of all settings that appear in this chapter.'),
});

const AnalyzeStoryInputSchema = z.object({
  storyContent: z.string().describe('The full text content of the story.'),
});
export type AnalyzeStoryInput = z.infer<typeof AnalyzeStoryInputSchema>;

const AnalyzeStoryOutputSchema = z.object({
  title: z.string().describe('The title of the story.'),
  chapters: z.array(ChapterSchema),
});
export type AnalyzeStoryOutput = z.infer<typeof AnalyzeStoryOutputSchema>;

export async function analyzeStory(
  input: AnalyzeStoryInput
): Promise<AnalyzeStoryOutput> {
  return analyzeStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeStoryPrompt',
  input: { schema: AnalyzeStoryInputSchema },
  output: { schema: AnalyzeStoryOutputSchema },
  prompt: `You are a master storyteller and literary analyst. Your task is to analyze the provided story content and reconstruct it into a complete, compelling narrative, divided by chapters.

  First, identify the title of the story.

  Then, break the story down into its natural chapters. For each chapter, you must provide:
  1. A concise and fitting title for the chapter.
  2. A complete and detailed narration of the chapter's plot. This should not be a brief summary; you must tell the entire story of the chapter from start to finish, capturing all key events, actions, and dialogues.
  3. A comprehensive list of ALL characters that appear or are mentioned in that chapter, each with a short, descriptive profile.
  4. A complete list of ALL settings where the events of that chapter take place, each with a short description.

  The goal is to recreate the full story experience for the reader, just structured in a clear, chapter-by-chapter format.

  Story Content:
  {{{storyContent}}}
  `,
});

const analyzeStoryFlow = ai.defineFlow(
  {
    name: 'analyzeStoryFlow',
    inputSchema: AnalyzeStoryInputSchema,
    outputSchema: AnalyzeStoryOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
