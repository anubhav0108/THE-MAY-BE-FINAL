import { mockEditorials } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const editorialContent: { [key: string]: string[] } = {
  E001: [
    "The integration of Artificial Intelligence into our educational frameworks represents a paradigm shift not seen since the advent of the internet. For academic administration, AI-powered tools like Timetable Ace can solve complex logistical puzzles in minutes, a task that previously took committees weeks. This efficiency allows institutions to focus on student outcomes rather than administrative overhead.",
    "In the classroom, AI tutors can provide personalized learning paths for students, adapting to their pace and identifying areas where they struggle. This doesn't replace the teacher but empowers them, freeing them from repetitive grading and allowing them to focus on higher-level instruction and mentorship. The future of education is a collaborative one, where human educators and AI work in tandem to create a more effective and equitable learning environment for all."
  ],
  E002: [
    "Green engineering is no longer a niche specialization but a core principle that must be integrated across all engineering disciplines. Our latest departmental projects focus on three key areas: biodegradable materials, renewable energy solutions, and sustainable urban infrastructure. One team is developing a new form of bioplastic from agricultural waste, which could significantly reduce our reliance on petroleum-based plastics.",
    "Another project involves the design of low-cost, high-efficiency solar panels specifically for rural communities, aiming to provide clean energy independence. These initiatives are not just academic exercises; they are real-world solutions to pressing global problems, driven by the innovation and passion of our students and faculty. By embedding sustainability into our curriculum, we are preparing the next generation of engineers to build a better, cleaner world."
  ],
  E003: [
    "This past year has been a vibrant tapestry of events, triumphs, and shared experiences that have strengthened our campus community. From the roaring success of our annual tech fest, 'Innovate 2025,' which saw record participation, to the colorful celebrations of our cultural night, 'Spectrum,' our students have shown incredible talent and spirit.",
    "The Student Council has worked to introduce new initiatives, including a peer mentorship program and expanded mental health resources. We've seen clubs and societies flourish, providing spaces for students to explore their passions outside the classroom. This retrospective is a celebration of that spirit—a reminder that a college is more than just its buildings and courses; it's the people who make it come alive."
  ],
  E004: [
    "In an era dominated by code and algorithms, it is easy to overlook the enduring value of the humanities. However, subjects like philosophy, literature, and history are more critical than ever. They teach us not just what to think, but how to think. They cultivate the skills of critical analysis, empathy, and ethical reasoning—skills that are essential for navigating a complex and often ambiguous world.",
    "A software engineer who has studied ethics is better equipped to consider the societal impact of their creations. A business leader who has studied history can draw on a deeper well of knowledge to make strategic decisions. The humanities provide the context, the 'why' behind the 'what' of technology and commerce, creating well-rounded individuals who are not just skilled professionals, but also thoughtful citizens."
  ],
  E005: [
    "The pressures of academic life are immense, and acknowledging the importance of mental health is the first step toward building a supportive and resilient campus community. The Wellness Center is here to provide confidential, professional support to all students. We offer one-on-one counseling, group therapy sessions, and workshops on stress management, mindfulness, and healthy study habits.",
    "It is a sign of strength, not weakness, to seek help when you need it. We encourage students to make use of these free resources. Your well-being is paramount, and a healthy mind is the foundation for academic and personal success. Remember, you are not alone, and our team is here to support you on your journey."
  ],
};


export default function EditorialPage({ params }: { params: { id: string } }) {
  const editorial = mockEditorials.find((e) => e.id === params.id);
  
  if (!editorial) {
    notFound();
  }

  const imageData = PlaceHolderImages.find(
    (img) => img.id === editorial.coverImageId
  );
  
  const content = editorialContent[editorial.id] || [];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="p-0">
          {imageData && (
            <div className="aspect-video w-full relative">
              <Image
                src={imageData.imageUrl}
                alt={editorial.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <Badge variant="secondary">{editorial.publishDate}</Badge>
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
              {editorial.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              By {editorial.author}
            </p>
          </div>
          <div className="prose prose-invert max-w-none text-foreground/90 space-y-4">
              <p className="lead text-lg italic">{editorial.excerpt}</p>
              {content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
