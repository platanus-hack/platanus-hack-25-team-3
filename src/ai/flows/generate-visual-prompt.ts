'use server';

/**
 * @fileOverview A flow that generates a visual prompt suggestion based on a selected text from the story.
 *
 * - generateVisualPrompt - A function that generates the visual prompt.
 * - GenerateVisualPromptInput - The input type for the generateVisualPrompt function.
 * - GenerateVisualPromptOutput - The return type for the generateVisualPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisualPromptInputSchema = z.object({
  selectedText: z.string().describe('The text selected by the user from the story.'),
  storyTheme: z.string().optional().describe('The theme of the story, if known.'),
  storySetting: z.string().optional().describe('The setting of the story, if known.'),
});
export type GenerateVisualPromptInput = z.infer<typeof GenerateVisualPromptInputSchema>;

const GenerateVisualPromptOutputSchema = z.object({
  visualPromptSuggestion: z.string().describe('A suggestion for a visual prompt based on the selected text.'),
});
export type GenerateVisualPromptOutput = z.infer<typeof GenerateVisualPromptOutputSchema>;

export async function generateVisualPrompt(input: GenerateVisualPromptInput): Promise<GenerateVisualPromptOutput> {
  return generateVisualPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVisualPromptPrompt',
  input: {schema: GenerateVisualPromptInputSchema},
  output: {schema: GenerateVisualPromptOutputSchema},
  prompt: `You are a visual prompt generator. You will generate a visual prompt suggestion based on the selected text from the story.

  Selected Text: {{{selectedText}}}
  Story Theme: {{storyTheme}}
  Story Setting: {{storySetting}}

  Visual Prompt Suggestion: `,
});

const generateVisualPromptFlow = ai.defineFlow(
  {
    name: 'generateVisualPromptFlow',
    inputSchema: GenerateVisualPromptInputSchema,
    outputSchema: GenerateVisualPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
