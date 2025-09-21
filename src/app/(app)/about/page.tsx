
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import data from "@/lib/problem-statement.json";
import { CheckCircle } from "lucide-react";

export default function AboutPage() {
  const { problem_statement: ps } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-headline font-bold text-primary">{ps.title}</h1>
        <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{ps.organization}</Badge>
            <Badge variant="secondary">{ps.department}</Badge>
            <Badge variant="outline">{ps.category}</Badge>
            <Badge variant="outline">{ps.theme}</Badge>
        </div>
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Background</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{ps.description.background}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Project Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{ps.description.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expected Solution</CardTitle>
          <CardDescription>{ps.expected_solution.overview}</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-3">
                {ps.expected_solution.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-foreground/90">{feature}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
