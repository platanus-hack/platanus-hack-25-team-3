'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UploadCloud, Loader2, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UploadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const router = useRouter();

  const handleFileSelect = async (file: File | null) => {
    if (file && file.type === 'text/plain') {
      setFileName(file.name);
      setIsUploading(true);
      
      const fileReader = new FileReader();
      fileReader.readAsText(file, 'UTF-8');
      
      fileReader.onload = async (e) => {
        const content = e.target?.result as string;
        
        setIsUploading(false);
        setIsAnalyzing(true);
        
        // In a real app, you might have a backend that does the analysis
        // and returns an ID. Here we pass the content via query params
        // for demonstration purposes. This has limitations on content size.
        const storyId = file.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace('.txt', '');

        // Use setTimeout to give the user feedback on what's happening.
        setTimeout(() => {
          setIsAnalyzing(false);
          setIsOpen(false);
          setFileName(null);
          
          const queryParams = new URLSearchParams({ content });
          router.push(`/story/${storyId}?${queryParams.toString()}`);
        }, 3000);
      };

      fileReader.onerror = () => {
        console.error("Failed to read file");
        resetState();
      }
    } else {
      alert("Please upload a .txt file.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files?.[0] || null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileSelect(event.dataTransfer.files?.[0] || null);
  };

  const resetState = () => {
    setIsOpen(false);
    setIsUploading(false);
    setIsAnalyzing(false);
    setFileName(null);
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-16 w-16 rounded-full shadow-lg"
        size="icon"
      >
        <UploadCloud size={28} />
        <span className="sr-only">Upload Story</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={(open) => !open && resetState()}>
        <DialogContent className="rounded-lg sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload your Story</DialogTitle>
            <DialogDescription>
              Drag and drop your .txt file or click to browse.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {isUploading || isAnalyzing ? (
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-semibold">
                  {isUploading ? 'Reading file...' : 'Analyzing story...'}
                </p>
                <p className="text-sm text-muted-foreground">{fileName}</p>
                {isAnalyzing && (
                  <div className="w-full text-left text-sm text-muted-foreground">
                    <p
                      className="animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    >
                      Scanning chapters...
                    </p>
                    <p
                      className="animate-pulse"
                      style={{ animationDelay: '0.7s' }}
                    >
                      Identifying characters...
                    </p>
                    <p
                      className="animate-pulse"
                      style={{ animationDelay: '1.2s' }}
                    >
                      Mapping settings...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary hover:bg-accent"
              >
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="font-semibold">Drag & drop a .txt file here</p>
                <p className="text-sm text-muted-foreground">or</p>
                <Button variant="default">Browse Files</Button>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
