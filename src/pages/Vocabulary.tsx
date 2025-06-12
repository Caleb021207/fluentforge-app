
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const Vocabulary = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Vocabulary Builder
        </h1>
        <p className="text-gray-600">
          Expand your vocabulary with interactive learning exercises and flashcards.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vocabulary Learning</CardTitle>
          <CardDescription>
            Build your vocabulary through structured learning exercises
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-600">Vocabulary learning features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vocabulary;
