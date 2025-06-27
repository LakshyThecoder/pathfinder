import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History as HistoryIcon } from "lucide-react";
import Link from "next/link";

const dummyHistory = [
  { id: 1, title: "My UI/UX Journey", query: "UI/UX Design", date: "2023-10-26" },
  { id: 2, title: "Python for Data Science", query: "Python", date: "2023-10-22" },
  { id: 3, title: "Startup Basics", query: "Entrepreneurship", date: "2023-10-20" },
];

export default function HistoryPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-8">
        <HistoryIcon className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold">Your Roadmap History</h1>
        <p className="text-muted-foreground mt-2">Revisit and continue your learning journeys.</p>
      </div>
      <div className="flex items-center gap-4 mb-8 max-w-lg mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search by keyword..." className="pl-10" />
        </div>
        <Button>Search</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dummyHistory.map((item) => (
          <Card key={item.id} className="hover:shadow-lg hover:border-primary/50 transition-all flex flex-col">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>Original query: "{item.query}"</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">Created on: {new Date(item.date).toLocaleDateString()}</p>
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/roadmap?query=${encodeURIComponent(item.query)}`}>Revisit Roadmap</Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
