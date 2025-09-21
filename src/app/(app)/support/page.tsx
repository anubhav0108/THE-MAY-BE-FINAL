
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const faqs = [
    {
        question: "How do I generate a new timetable?",
        answer: "Navigate to the Dashboard, input all required data in the 'Data Import' section, define your constraints in the 'Constraints' section, and then click the 'Generate Timetable' button."
    },
    {
        question: "Can I manually edit the generated timetable?",
        answer: "Yes. Once a timetable is generated, you can click the 'Manual Override' button to make direct adjustments to the schedule. Remember to save your changes."
    },
    {
        question: "How do I add new student or faculty data?",
        answer: "Go to the 'Data Import' page. Select the appropriate tab (e.g., 'Student Data') and paste the new data in JSON format. Click 'Save' to update the records."
    },
    {
        question: "Where can I see analytics and reports?",
        answer: "The 'Analytics' page provides detailed visualizations and statistics on resource utilization, faculty load, and more."
    }
]

export default function SupportPage() {
    const { toast } = useToast();

    const handleSubmitTicket = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Support Ticket Submitted",
            description: "Our team will get back to you shortly.",
        });
        (e.target as HTMLFormElement).reset();
    }

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-headline font-bold">Support & Help</h1>
        <p className="text-muted-foreground">
            Find answers to common questions or submit a support ticket.
        </p>
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                        <CardDescription>
                            Quick answers to the most common questions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent>{faq.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Submit a Ticket</CardTitle>
                        <CardDescription>
                            Can't find an answer? Our support team is here to help.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmitTicket} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Your Name" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="your.email@example.com" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="e.g., Timetable generation failed" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Please describe your issue in detail..." required />
                            </div>
                            <Button type="submit" className="w-full">
                                <Send className="mr-2 h-4 w-4" />
                                Submit Ticket
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
