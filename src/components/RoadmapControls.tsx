"use client";

import { Share2, Bookmark, Star, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCallback } from 'react';

interface RoadmapControlsProps {
    query: string;
    roadmapTitle: string;
}

export default function RoadmapControls({ query, roadmapTitle }: RoadmapControlsProps) {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleShare = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: 'Link Copied!',
            description: 'Roadmap link has been copied to your clipboard.',
        });
    }, [toast]);

    const handleSave = useCallback(() => {
        if (user) {
            // In a real app, you'd save this to a database
            toast({
                title: 'Roadmap Saved!',
                description: 'You can find it in your history.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Required',
                description: 'Please log in to save your roadmaps.',
            });
        }
    }, [user, toast]);

    const handleRate = useCallback(() => {
        // In a real app, you'd store this rating
        toast({
            title: 'Thank You!',
            description: 'We appreciate your feedback.',
        });
    }, [toast]);

    const handleDownload = useCallback(() => {
        const roadmapElement = document.getElementById('roadmap-container');
        if (roadmapElement) {
            toast({
                title: 'Preparing Download',
                description: 'Your roadmap image is being generated...',
            });
            toPng(roadmapElement, { cacheBust: true, backgroundColor: '#09090b', pixelRatio: 2 })
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.download = `${roadmapTitle.replace(/\s+/g, '-').toLowerCase()}-roadmap.png`;
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

    const controls = [
        { label: 'Share', icon: Share2, action: handleShare },
        { label: 'Save', icon: Bookmark, action: handleSave },
        { label: 'Rate', icon: Star, action: handleRate },
        { label: 'Download', icon: Download, action: handleDownload },
    ];

    return (
        <TooltipProvider>
            <div className="absolute top-6 right-6 z-20">
                <div className="flex items-center gap-1 p-1 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg">
                    {controls.map((control) => (
                        <Tooltip key={control.label}>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 group" onClick={control.action}>
                                    <control.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{control.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}
