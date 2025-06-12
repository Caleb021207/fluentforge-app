
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const Classroom = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600" />
          Classroom Management
        </h1>
        <p className="text-gray-600">
          Manage your classes and track student progress.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classroom Features</CardTitle>
          <CardDescription>
            Create and manage virtual classrooms for language learning
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-600">Classroom management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Classroom;
