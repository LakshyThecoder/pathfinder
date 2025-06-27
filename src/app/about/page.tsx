import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

export default function AboutPage() {
    const teamMembers = [
        {
          name: "Jane Doe",
          role: "Founder & CEO",
          avatar: "https://placehold.co/150x150.png",
          dataAiHint: "woman ceo",
        },
        {
          name: "John Smith",
          role: "Lead AI Engineer",
          avatar: "https://placehold.co/150x150.png",
          dataAiHint: "man engineer",
        },
        {
          name: "Emily White",
          role: "Head of Design",
          avatar: "https://placehold.co/150x150.png",
          dataAiHint: "woman designer",
        },
      ];
  return (
    <div className="container mx-auto py-16 px-4">
      <section className="text-center mb-24">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">About PathFinder</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          PathFinder is your personal guide to mastering new skills. We believe learning should be a clear, visual, and motivating journey. Our platform generates dynamic, interactive roadmaps tailored to your goals, complemented by AI-powered insights to keep you on track. Start your journey today and unlock your full potential.
        </p>
      </section>

      <section className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                Our mission is to democratize learning by making it accessible, engaging, and effective for everyone. We want to empower individuals to take control of their personal and professional development by providing them with clear, actionable learning paths.
                </p>
                <p>
                In a world overflowing with information, finding the right path can be overwhelming. PathFinder cuts through the noise, offering structured guidance to help you achieve your goals faster and with more confidence. Whether you're changing careers, picking up a new hobby, or deepening your expertise, we're here to light the way.
                </p>
            </div>
            <div>
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Team working together" 
                data-ai-hint="team collaboration"
                width={600} 
                height={400} 
                className="rounded-lg shadow-2xl"
              />
            </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
            <Card key={member.name} className="text-center border-0 shadow-none bg-transparent">
                <CardContent>
                <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarImage src={member.avatar} data-ai-hint={member.dataAiHint} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-primary">{member.role}</p>
                </CardContent>
            </Card>
            ))}
        </div>
      </section>
    </div>
  );
}
