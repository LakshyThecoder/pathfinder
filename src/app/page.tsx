"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BrainCircuit, Code, PenTool, Sparkles, GitMerge, Eye, Target, Shuffle, Play } from "lucide-react";

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
  };

  const features = [
    {
      icon: <GitMerge className="h-10 w-10 text-primary" />,
      title: "Dynamic Roadmaps",
      description: "Generate personalized, step-by-step learning paths that adapt to your progress and goals."
    },
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: "AI-Powered Insights",
      description: "Get smart suggestions, resource recommendations, and estimated timelines for each step of your journey."
    },
    {
      icon: <Eye className="h-10 w-10 text-primary" />,
      title: "Visual Learning",
      description: "Understand complex topics easily with our interactive and visually engaging tree-like roadmaps."
    }
  ];

  const howItWorksSteps = [
    {
      icon: <Target className="h-10 w-10 text-primary" />,
      title: "1. Define Your Goal",
      description: "Simply tell us what skill you want to master, from programming languages to design principles."
    },
    {
      icon: <Shuffle className="h-10 w-10 text-primary" />,
      title: "2. Generate Your Path",
      description: "Our AI analyzes your goal and instantly creates a comprehensive, structured roadmap for you."
    },
    {
      icon: <Play className="h-10 w-10 text-primary" />,
      title: "3. Start Learning",
      description: "Follow the path, track your progress, and dive into curated resources to achieve mastery."
    }
  ];


  return (
    <main className="flex flex-col items-center px-4 pt-12 sm:px-6 lg:px-8 relative overflow-x-hidden">
       <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#3b82f633,transparent)]"></div>
      </div>
      
      <section className="w-full max-w-3xl text-center min-h-[calc(100vh-8rem)] flex flex-col justify-center items-center">
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
      </section>

      <section className="py-24 w-full max-w-5xl">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              Or Explore a Trending Path
            </h2>
            <p className="text-muted-foreground mt-2">Get started instantly with one of our popular learning journeys.</p>
        </div>
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
      </section>

      <section className="py-24 w-full max-w-5xl bg-card/50 rounded-2xl">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Unlock Your Potential</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">PathFinder provides the tools you need to succeed on your learning adventure.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-transparent backdrop-blur-sm p-6 border-0 shadow-none">
                  <CardHeader className="p-0 pb-4 flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
      </section>

      <section className="py-24 w-full max-w-5xl">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12 tracking-tight">Get Started in Seconds</h2>
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/50 -translate-y-1/2 hidden md:block" aria-hidden="true"></div>
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-12 md:gap-8">
                {howItWorksSteps.map((step) => (
                  <div key={step.title} className="flex flex-col items-center text-center max-w-xs w-full">
                    <div className="bg-background border-2 border-primary rounded-full p-4 mb-4 z-10">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </section>
    </main>
  );
}
