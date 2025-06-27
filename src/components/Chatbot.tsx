"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { RoadmapNodeData } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { getRoadmapInsight, getFollowUpAnswer } from "@/app/actions";
import type { RoadmapInsightOutput } from "@/ai/flows/roadmap-insight-generator";
import { CornerDownLeft, Bot, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatbotProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedNode: RoadmapNodeData | null;
  query: string;
}

type Message = {
  id: number;
  role: "user" | "assistant";
  content: React.ReactNode;
  isInsight?: boolean;
};

const TypingIndicator = () => (
  <motion.div
    className="flex items-center space-x-2 p-4"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    <Avatar className="h-8 w-8">
      <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
    </Avatar>
    <div className="flex items-center space-x-1 bg-secondary p-3 rounded-lg">
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
    </div>
  </motion.div>
);

const InitialInsight = ({ insight }: { insight: RoadmapInsightOutput }) => (
  <div className="space-y-4 bg-secondary/50 p-4 rounded-lg border">
    <div>
        <h4 className="font-semibold mb-2 text-primary">Key Insight</h4>
        <p className="text-sm text-muted-foreground">{insight.insight}</p>
    </div>
    <div>
        <h4 className="font-semibold mb-2 text-primary">Recommended Resources</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{insight.resources}</p>
    </div>
    <div>
        <h4 className="font-semibold mb-2 text-primary">Estimated Duration</h4>
        <p className="text-sm text-muted-foreground">{insight.durationEstimate}</p>
    </div>
  </div>
);

export default function Chatbot({ isOpen, onOpenChange, selectedNode }: ChatbotProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isInsightPending, startInsightTransition] = useTransition();
  const [isFollowUpPending, startFollowUpTransition] = useTransition();

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedNode && isOpen) {
      setMessages([]);
      startInsightTransition(async () => {
        const result = await getRoadmapInsight({ nodeContent: `${selectedNode.title} in a ${selectedNode.level} context` });
        if ("error" in result) {
          console.error(result.error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load AI insights. Please try again later.",
          });
        } else {
          setMessages([{
            id: Date.now(),
            role: "assistant",
            content: <InitialInsight insight={result} />,
            isInsight: true,
          }]);
        }
      });
    }
  }, [selectedNode, isOpen, toast]);
  
  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isFollowUpPending || !selectedNode) return;

    const userMessage: Message = { id: Date.now(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    startFollowUpTransition(async () => {
      const result = await getFollowUpAnswer({ nodeContent: selectedNode.title, question: input });
      if ("error" in result) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        setMessages(prev => prev.slice(0, -1)); // remove user message on error
      } else {
        const assistantMessage: Message = { id: Date.now() + 1, role: "assistant", content: result.answer };
        setMessages(prev => [...prev, assistantMessage]);
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className="w-full md:max-w-md lg:max-w-lg p-0 flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="p-6 pb-2 border-b">
          <SheetTitle className="text-2xl flex items-center gap-2"><Bot className="text-primary"/> AI Assistant</SheetTitle>
          {selectedNode && 
          <SheetDescription>
            Asking about: <span className="font-semibold text-primary">{selectedNode.title}</span>
          </SheetDescription>
          }
        </SheetHeader>
        <ScrollArea className="flex-1" ref={scrollAreaRef as any}>
            <div className="p-6 space-y-6">
                <AnimatePresence>
                    {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                        "flex items-start gap-3",
                        message.role === "user" && "justify-end"
                        )}
                    >
                        {message.role === "assistant" && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                        )}
                        <div className={cn(
                            "p-3 rounded-lg max-w-[85%]",
                             message.role === "assistant" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
                             message.isInsight && "bg-transparent p-0 w-full max-w-full"
                             )}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>

                        {message.role === "user" && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                        )}
                    </motion.div>
                    ))}
                    {(isInsightPending || isFollowUpPending) && <TypingIndicator />}
                </AnimatePresence>
            </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Input 
                        placeholder="Ask a follow-up question..." 
                        className="pr-12" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isInsightPending || isFollowUpPending || messages.length === 0}
                    />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" type="submit" disabled={!input.trim() || isFollowUpPending}>
                        <CornerDownLeft className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
