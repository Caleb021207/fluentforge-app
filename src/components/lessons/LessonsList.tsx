
import React from "react";
import { Lesson } from "./types";
import LessonCard from "./LessonCard";

interface LessonsListProps {
  lessons: Lesson[];
  onSelectLesson: (lessonId: number) => void;
  isLoading: boolean;
}

const LessonsList: React.FC<LessonsListProps> = ({ 
  lessons, 
  onSelectLesson, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 max-w-md mx-auto w-full">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-start">
            <div className="text-primary text-xl mr-3">{lesson.icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{lesson.title}</h3>
              <div className="text-sm text-gray-600 mb-2">
                <span className="inline-block mr-3 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                  {lesson.difficulty || "Easy"}
                </span>
                <span>{lesson.duration}</span>
              </div>
              <p className="text-sm text-gray-700 mb-3">{lesson.description}</p>
              
              {lesson.challenges && lesson.challenges.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-2">Challenges:</h4>
                  <div>
                    {lesson.challenges.map((challenge, idx) => (
                      <div key={idx} className="flex items-center mb-1">
                        <div className="flex-1 flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-sm">{challenge.description}</span>
                        </div>
                        {challenge.xp && (
                          <span className="text-yellow-600 font-medium text-xs">+{challenge.xp} XP</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{lesson.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${lesson.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <button 
                  onClick={() => onSelectLesson(lesson.id)} 
                  className="bg-gray-900 text-white text-sm px-4 py-1.5 rounded-md hover:bg-gray-800"
                >
                  Start {lesson.progress ? "(" + lesson.progress + "% XP)" : "(50 XP)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LessonsList;
