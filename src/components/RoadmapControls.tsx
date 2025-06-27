"use client";

import { Share2, Star, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

interface RoadmapControlsProps {
    roadmapTitle: string;
    onSaveClick: () => void;
    isSaved: boolean;
    isSaving: boolean;
}

export default function RoadmapControls({ roadmapTitle, onSaveClick, isSaved, isSaving }: RoadmapControlsProps) {
    const { toast } = useToast();

    const handleShare = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: 'Link Copied!',
            description: 'Roadmap link has been copied to your clipboard.',
        });
    }, [toast]);

    const handleDownload = useCallback(() => {
        const roadmapElement = document.getElementById('roadmap-container');
        if (roadmapElement) {
            toast({
                title: 'Preparing Download',
                description: 'Your roadmap image is being generated...',
            });
            toPng(roadmapElement, { cacheBust: true, backgroundColor: '#0A0A0A', pixelRatio: 2 })
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.download = `${roadmapTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-roadmap.png`;
                    link.href = dataUrl;
                    link.click();
                })
                .catch((err) => {
                    console.error(err);
                    toast({
                        variant: 'destructive',
                        title: 'Download Failed',
                        description: 'Could not generate image. Please try again.',
                    });
                });
        }
    }, [roadmapTitle, toast]);

    return (
        <TooltipProvider>
            <div className="absolute top-6 right-6 z-20">
                <div className="flex items-center gap-1 p-1 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full h-10 w-10 group" 
                                onClick={onSaveClick}
                                disabled={isSaving || isSaved}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Star className={cn(
                                        "h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors",
                                        isSaved && "fill-primary text-primary"
                                    )} />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isSaved ? 'Saved' : (isSaving ? 'Saving...' : 'Save Roadmap')}</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Share Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 group" onClick={handleShare}>
                                <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Share</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Download Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 group" onClick={handleDownload}>
                                <Download className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Download</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}
