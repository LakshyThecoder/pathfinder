
"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { RoadmapNodeData, NodeStatus } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { getRoadmapInsight, getFollowUpAnswer, getSuggestion } from "@/app/actions";
import type { RoadmapInsightOutput } from "@/ai/flows/roadmap-insight-generator";
import { CornerDownLeft, Bot, User, Check, CircleDashed, X, RotateCcw, Zap, Lightbulb, AlertTriangle, BookOpen, Clock, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { marked } from "marked";

interface ChatbotProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedNode: RoadmapNodeData | null;
  onStatusChange: (nodeId: string, status: NodeStatus) => void;
  currentNodeStatus: NodeStatus;
}

type Message = {
  id: string;
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
    <Avatar className="h-8 w-8 bg-primary/10 border border-primary/20">
       <AvatarFallback className="bg-transparent"><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
    </Avatar>
    <div className="flex items-center space-x-1 bg-secondary p-3 rounded-lg">
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
    </div>
  </motion.div>
);

const InsightCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
        <div className="flex items-center gap-3 mb-2">
            {icon}
            <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-ul:list-disc prose-ul:pl-5 prose-li:my-1 whitespace-pre-wrap">{children}</div>
    </div>
);


const InitialInsight = ({ insight }: { insight: any }) => (
  <div className="space-y-3">
    <InsightCard icon={<Lightbulb className="h-5 w-5 text-primary" />} title="Key Concept">
        <div dangerouslySetInnerHTML={{ __html: insight.keyConcept }} />
    </InsightCard>
    <InsightCard icon={<Zap className="h-5 w-5 text-primary" />} title="Practical Tip">
        <div dangerouslySetInnerHTML={{ __html: insight.practicalTip }} />
    </InsightCard>
     <InsightCard icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} title="Common Pitfall">
        <div dangerouslySetInnerHTML={{ __html: insight.commonPitfall }} />
    </InsightCard>
    <InsightCard icon={<BookOpen className="h-5 w-5 text-primary" />} title="Recommended Resources">
        <div dangerouslySetInnerHTML={{ __html: insight.resources }} />
    </InsightCard>
    <InsightCard icon={<Clock className="h-5 w-5 text-primary" />} title="Estimated Duration">
        {insight.durationEstimate}
    </InsightCard>
  </div>
);

export default function Chatbot({ isOpen, onOpenChange, selectedNode, onStatusChange, currentNodeStatus }: ChatbotProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isInsightPending, startInsightTransition] = useTransition();
  const [isFollowUpPending, startFollowUpTransition] = useTransition();
  const [isChallengePending, startChallengeTransition] = useTransition();

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
            title: "Error fetching insights",
            description: result.error,
          });
        } else {
            const parsedInsight = {
                ...result,
                keyConcept: await marked.parse(result.keyConcept),
                practicalTip: await marked.parse(result.practicalTip),
                commonPitfall: await marked.parse(result.commonPitfall),
                resources: await marked.parse(result.resources),
            };
          setMessages([{
            id: `insight-${Date.now()}`,
            role: "assistant",
            content: <InitialInsight insight={parsedInsight} />,
            isInsight: true,
          }]);
        }
      });
    }
  }, [selectedNode, isOpen, toast]);
  
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isInsightPending, isFollowUpPending, isChallengePending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isFollowUpPending || !selectedNode) return;

    const userMessage: Message = { id: `user-${Date.now()}`, role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    startFollowUpTransition(async () => {
      const result = await getFollowUpAnswer({ nodeContent: selectedNode.title, question: input });
      if ("error" in result) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        setMessages(prev => prev.slice(0, -1)); 
      } else {
        const html = await marked.parse(result.answer);
        const assistantMessage: Message = { id: `assistant-${Date.now()}`, role: "assistant", content: <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-ul:list-disc prose-ul:pl-5 prose-li:my-1" dangerouslySetInnerHTML={{ __html: html }} /> };
        setMessages(prev => [...prev, assistantMessage]);
      }
    });
  };

  const handleChallengeClick = () => {
    if (!selectedNode || isChallengePending) return;

    startChallengeTransition(async () => {
        const result = await getSuggestion({ topic: selectedNode.title, level: selectedNode.level });
        if ("error" in result) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            const challengeMessage: Message = { 
                id: `challenge-${Date.now()}`, 
                role: "assistant", 
                content: (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-primary flex items-center gap-2"><Sparkles className="h-5 w-5" /> Here's a Challenge:</h4>
                        <p className="text-sm">{result.challenge}</p>
                        <p className="text-xs text-muted-foreground">Est. time: {result.estimatedTime}</p>
                    </div>
                ) 
            };
            setMessages(prev => [...prev, challengeMessage]);
        }
    });
  };

  const handleStatusClick = (status: NodeStatus) => {
    if (selectedNode) {
        onStatusChange(selectedNode.id, status);
    }
  };

  const statusActions = [
    { status: 'completed' as NodeStatus, label: 'Complete', icon: Check, className: 'hover:bg-green-500/10 text-green-500 border-green-500/20' },
    { status: 'in-progress' as NodeStatus, label: 'In Progress', icon: CircleDashed, className: 'hover:bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { status: 'skipped' as NodeStatus, label: 'Skip', icon: X, className: 'hover:bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' },
    { status: 'not-started' as NodeStatus, label: 'Reset', icon: RotateCcw, className: 'hover:bg-amber-500/10 text-amber-500 border-amber-500/20' },
  ];

  const isPending = isInsightPending || isFollowUpPending || isChallengePending;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={cn("w-full md:max-w-md lg:max-w-lg p-0 flex flex-col bg-card/80 backdrop-blur-sm", isMobile && "h-full")}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-4 border-b border-border/50">
          <SheetTitle className="text-xl flex items-center gap-2 font-bold"><Bot className="text-primary h-6 w-6"/> AI Learning Assistant</SheetTitle>
          {selectedNode && 
          <SheetDescription className="text-sm">
            You're learning about: <span className="font-semibold text-primary">{selectedNode.title}</span>
          </SheetDescription>
          }
        </SheetHeader>

        {selectedNode && (
            <div className="px-4 py-3 border-b border-border/50">
                <p className="text-xs font-medium mb-2 text-muted-foreground">Mark your progress:</p>
                <div className="flex items-center justify-around gap-2">
                    {statusActions.map(action => (
                        <Button
                            key={action.status}
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusClick(action.status)}
                            className={cn('flex-1 text-xs gap-1.5 transition-all duration-200 border', action.className, currentNodeStatus === action.status ? 'bg-primary/20 text-primary' : 'bg-transparent')}
                            title={action.label}
                        >
                            <action.icon className="h-4 w-4" />
                            {action.label}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-6">
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={cn(
                        "flex items-start gap-3",
                        message.role === "user" && "justify-end"
                        )}
                    >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8 bg-primary/10 border border-primary/20">
                            <AvatarFallback className="bg-transparent"><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn(
                            "p-3 rounded-xl max-w-[85%] shadow-sm",
                             message.role === "assistant" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
                             message.isInsight && "bg-transparent p-0 w-full max-w-full shadow-none"
                             )}>
                            <div className="text-sm leading-relaxed">{message.content}</div>
                        </div>

                        {message.role === "user" && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt="User" />
                            <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                          </Avatar>
                        )}
                    </motion.div>
                    ))}
                    {isPending && <TypingIndicator />}
                </AnimatePresence>
            </div>
        </ScrollArea>
        <div className="p-4 border-t border-border/50 bg-background/50 space-y-2">
            <Button variant="outline" size="sm" className="w-full" onClick={handleChallengeClick} disabled={isPending || messages.length === 0}>
                <Sparkles className="mr-2 h-4 w-4" />
                Suggest a Practical Challenge
            </Button>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Input 
                        placeholder="Ask a follow-up question..." 
                        className="pr-12 rounded-full py-5 bg-secondary" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isPending || messages.length === 0}
                    />
                    <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground disabled:bg-muted disabled:text-muted-foreground" type="submit" disabled={!input.trim() || isFollowUpPending}>
                        <CornerDownLeft className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
