
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const Vocabulary = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
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
        <CardContent className="p-6">
          <p className="text-gray-600">Vocabulary learning features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vocabulary;
