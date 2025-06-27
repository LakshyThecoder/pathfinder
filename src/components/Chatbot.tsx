"use client";

import { useEffect, useState, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { RoadmapNodeData } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { getRoadmapInsight } from "@/app/actions";
import type { RoadmapInsightOutput } from "@/ai/flows/roadmap-insight-generator";
import { CornerDownLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ChatbotProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedNode: RoadmapNodeData | null;
  query: string;
}

const TypingIndicator = () => (
    <motion.div 
      className="flex items-center space-x-2 p-4 bg-secondary rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
        <span className="text-sm text-muted-foreground ml-2">Generating insights...</span>
    </motion.div>
  );

export default function Chatbot({ isOpen, onOpenChange, selectedNode }: ChatbotProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [insight, setInsight] = useState<RoadmapInsightOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (selectedNode) {
      setInsight(null);
      startTransition(async () => {
        const result = await getRoadmapInsight({ nodeContent: `${selectedNode.title} in a ${selectedNode.level} context` });
        if ("error" in result) {
          console.error(result.error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load AI insights. Please try again later.",
          });
        } else {
          setInsight(result);
        }
      });
    }
  }, [selectedNode, toast]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className="w-full md:max-w-md lg:max-w-lg p-0 flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="p-6 pb-2 border-b">
          <SheetTitle className="text-2xl">AI Insights</SheetTitle>
          {selectedNode && 
          <SheetDescription>
            Insights for: <span className="font-semibold text-primary">{selectedNode.title}</span>
          </SheetDescription>
          }
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
            {isPending ? <TypingIndicator /> : (
                insight && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Key Insight</h4>
                            <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-lg">{insight.insight}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Recommended Resources</h4>
                            <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-lg whitespace-pre-wrap">{insight.resources}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Estimated Duration</h4>
                            <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-lg">{insight.durationEstimate}</p>
                        </div>
                    </motion.div>
                )
            )}
            </AnimatePresence>
        </div>
        <div className="p-4 border-t bg-background">
            <form>
                <div className="relative">
                    <Input placeholder="Ask a follow-up question..." className="pr-10" disabled />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" type="submit" disabled>
                        <CornerDownLeft className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">Follow-up questions coming soon!</p>
            </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
