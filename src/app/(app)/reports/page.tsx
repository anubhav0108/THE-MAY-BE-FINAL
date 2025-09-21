
"use client";

import { useContext } from "react";
import Link from "next/link";
import { DataContext } from "@/context/data-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Wand2 } from "lucide-react";

export default function ReportPage() {
  const { timetableResult } = useContext(DataContext);

  if (!timetableResult || !timetableResult.report) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mx-auto bg-secondary p-3 rounded-full mb-4">
              <FileText className="h-8 w-8 text-secondary-foreground" />
            </div>
            <CardTitle className="font-headline text-2xl">Generation Report</CardTitle>
            <CardDescription>No report found. Please generate a timetable from the dashboard to create a report.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>
                <Wand2 className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-headline font-bold">Generation Report</h1>
        <p className="text-muted-foreground">
          A detailed analysis of the most recently generated timetable, including efficiency metrics and conflict resolution.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Timetable Analysis</CardTitle>
          <CardDescription>
            This report provides insights into the structure and efficiency of the schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none text-foreground/90 whitespace-pre-wrap">
            {timetableResult.report}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
