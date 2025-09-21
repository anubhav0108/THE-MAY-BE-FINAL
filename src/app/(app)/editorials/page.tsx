
"use client";

import Image from "next/image";
import Link from "next/link";
import { mockEditorials } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { DataContext } from "@/context/data-context";

export default function EditorialsPage() {
  const { searchTerm } = useContext(DataContext);

  const getImage = (id: string) => {
    return PlaceHolderImages.find((img) => img.id === id);
  };

  const filteredEditorials = mockEditorials.filter(editorial => 
    editorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    editorial.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    editorial.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">College Editorials</h1>
      <p className="text-muted-foreground">
        A section dedicated to college editorials and publications.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEditorials.map((editorial) => {
          const imageData = getImage(editorial.coverImageId);
          return (
            <Card key={editorial.id} className="flex flex-col interactive-element">
              <CardHeader>
                <div className="aspect-video w-full relative">
                  {imageData && (
                    <Image
                      src={imageData.imageUrl}
                      alt={editorial.title}
                      fill
                      className="rounded-t-lg object-cover"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1">
                <h3 className="font-headline text-xl">{editorial.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{`By ${editorial.author} on ${editorial.publishDate}`}</p>
                <p className="mt-4 text-base text-muted-foreground">{editorial.excerpt}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                 <Link href={`/editorials/${editorial.id}`}>
                    <Button variant="outline">Read More</Button>
                 </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

    