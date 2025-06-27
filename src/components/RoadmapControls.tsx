"use client";

import { Share2, Bookmark, Star, Download, BookmarkPlus } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCallback, useState } from 'react';
import LoginPromptDialog from './LoginPromptDialog';
import { cn } from '@/lib/utils';

interface RoadmapControlsProps {
    roadmapTitle: string;
    isSaved: boolean;
}

export default function RoadmapControls({ roadmapTitle, isSaved }: RoadmapControlsProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);

    const handleShare = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: 'Link Copied!',
            description: 'Roadmap link has been copied to your clipboard.',
        });
    }, [toast]);

    const handleSave = useCallback(() => {
        if (!user) {
            setLoginDialogOpen(true);
        } else {
             toast({
                title: isSaved ? 'Roadmap Already Saved' : 'Roadmap Saved!',
                description: isSaved ? 'This roadmap is in your history.' : 'You can find it in your history.',
            });
        }
    }, [user, toast, isSaved]);

    const handleRate = useCallback(() => {
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

    const controls = [
        { label: 'Share', icon: Share2, action: handleShare },
        { label: 'Save', icon: isSaved ? Bookmark : BookmarkPlus, action: handleSave },
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
                                    <control.icon className={cn("h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors", isSaved && control.label === 'Save' && "text-primary fill-primary")} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{control.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
            <LoginPromptDialog isOpen={isLoginDialogOpen} onOpenChange={setLoginDialogOpen} />
        </TooltipProvider>
    );
}
