
"use client";

import Image from "next/image";
import { mockBooks as initialBooks } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useContext, useState } from "react";
import { DataContext } from "@/context/data-context";
import { Book } from "@/lib/types";

export default function LibraryPage() {
  const { toast } = useToast();
  const { searchTerm } = useContext(DataContext);
  const [books, setBooks] = useState<Book[]>(initialBooks);
  
  const getImage = (id: string) => {
    return PlaceHolderImages.find((img) => img.id === id);
  };

  const handleBorrow = (bookId: string, title: string) => {
    let bookWasBorrowed = false;
    setBooks(currentBooks =>
      currentBooks.map(book => {
        if (book.id === bookId && book.availableCopies > 0 && !bookWasBorrowed) {
          bookWasBorrowed = true; // Ensure we only decrement once per click
          return { ...book, availableCopies: book.availableCopies - 1 };
        }
        return book;
      })
    );

    if (bookWasBorrowed) {
      toast({
        title: "Book Borrowed!",
        description: `You have successfully borrowed "${title}".`,
      });
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">College Library</h1>
      <p className="text-muted-foreground">
        Browse the collection of books available in the library.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredBooks.map((book) => {
          const imageData = getImage(book.coverImageId);
          return (
            <Card key={book.id} className="flex flex-col interactive-element">
              <CardHeader className="p-4">
                <div className="aspect-[3/4] w-full relative">
                  {imageData && (
                    <Image
                      src={imageData.imageUrl}
                      alt={book.title}
                      fill
                      className="rounded-md object-cover"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1">
                <CardTitle className="text-base font-bold leading-snug">{book.title}</CardTitle>
                <CardDescription className="text-xs mt-1">{book.author}</CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex-col items-start gap-2">
                 <Badge variant={book.availableCopies > 0 ? "secondary" : "destructive"} className="mb-2">
                   {book.availableCopies > 0 ? `${book.availableCopies} available` : "Checked Out"}
                 </Badge>
                 <Button 
                    className="w-full" 
                    onClick={() => handleBorrow(book.id, book.title)} 
                    disabled={book.availableCopies === 0}
                  >
                    Borrow
                  </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

    