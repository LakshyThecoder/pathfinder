"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BrainCircuit, Code, PenTool } from "lucide-react";

export default function Home() {
  const [goal, setGoal] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (goal.trim()) {
      router.push(`/roadmap?query=${encodeURIComponent(goal.trim())}`);
    }
  };

  const trendingTopics = [
    { name: "UI/UX Design", icon: <PenTool className="h-8 w-8 text-primary" />, description: "Craft beautiful and intuitive user experiences." },
    { name: "Data Science", icon: <BrainCircuit className="h-8 w-8 text-primary" />, description: "Uncover insights from data to drive decisions." },
    { name: "Web Development", icon: <Code className="h-8 w-8 text-primary" />, description: "Build modern, responsive websites and apps." },
  ];

  const handleCardClick = (name: string) => {
    router.push(`/roadmap?query=${encodeURIComponent(name)}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
       <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#3b82f633,transparent)]"></div>
      </div>

      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary to-accent">
          Chart Your Course to Mastery
        </h1>
        <p className="text-lg text-muted-foreground mt-4 mb-8 max-w-xl mx-auto">
          From 'Hello World' to expert, PathFinder generates dynamic, visual roadmaps for any skill you want to master.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-lg mx-auto items-center space-x-2"
        >
          <Input
            type="text"
            placeholder="What do you want to learn?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="flex-1 py-6 text-base rounded-full bg-background/50 backdrop-blur-sm"
            aria-label="Learning Goal Input"
          />
          <Button type="submit" size="lg" className="py-6 rounded-full">
            Generate
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </div>
      <div className="mt-24 w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-8">
          Or Explore a Trending Path
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingTopics.map((topic) => (
            <Card
              key={topic.name}
              className="group cursor-pointer bg-card/80 backdrop-blur-sm hover:border-primary transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 border-transparent border-2"
              onClick={() => handleCardClick(topic.name)}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(topic.name)}
              tabIndex={0}
            >
              <CardHeader className="flex flex-col items-center text-center gap-4 pb-2">
                {topic.icon}
                <CardTitle className="text-xl font-semibold">{topic.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  {topic.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
