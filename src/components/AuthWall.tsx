import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

interface AuthWallProps {
    title: string;
    description: string;
}

export default function AuthWall({ title, description }: AuthWallProps) {
  return (
    <div className="w-full text-center py-16 flex flex-col items-center">
      <Lock className="h-16 w-16 text-primary mb-4" />
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
