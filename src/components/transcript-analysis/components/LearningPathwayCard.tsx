import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target, Calendar, BookOpen, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface LearningPathwayCardProps {
  learningPathway?: {
    immediateGoals: string[];
    mediumTermGoals: string[];
    practiceActivities: Array<{
      activity: string;
      focus: string;
      frequency: string;
    }>;
    resourceRecommendations: string[];
  };
  progressIndicators?: {
    recentImprovements: string[];
    consistentStrengths: string[];
    emergingSkills: string[];
    priorityAreas: string[];
  };
}

const LearningPathwayCard: React.FC<LearningPathwayCardProps> = ({ learningPathway, progressIndicators }) => {
  if (!learningPathway && !progressIndicators) return null;

  return (
    <div className="space-y-6">
      {/* Learning Pathway */}
      {learningPathway && (
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Your Personalized Learning Pathway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Immediate Goals */}
            {learningPathway.immediateGoals && learningPathway.immediateGoals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20"
              >
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Immediate Goals (Next 2 Weeks)
                </h4>
                <ul className="space-y-2">
                  {learningPathway.immediateGoals.map((goal, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">{idx + 1}.</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Medium Term Goals */}
            {learningPathway.mediumTermGoals && learningPathway.mediumTermGoals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20"
              >
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
                  <Target className="h-5 w-5" />
                  Medium-Term Goals (3 Months)
                </h4>
                <ul className="space-y-2">
                  {learningPathway.mediumTermGoals.map((goal, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">→</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Practice Activities */}
            {learningPathway.practiceActivities && learningPathway.practiceActivities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Recommended Practice Activities
                </h4>
                <div className="grid gap-3">
                  {learningPathway.practiceActivities.map((activity, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{activity.activity}</p>
                          <p className="text-xs text-muted-foreground">Focus: {activity.focus}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          {activity.frequency}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Resource Recommendations */}
            {learningPathway.resourceRecommendations && learningPathway.resourceRecommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20"
              >
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-700">
                  <BookOpen className="h-5 w-5" />
                  Recommended Resources
                </h4>
                <div className="flex flex-wrap gap-2">
                  {learningPathway.resourceRecommendations.map((resource, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Indicators */}
      {progressIndicators && (
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Progress Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Recent Improvements */}
              {progressIndicators.recentImprovements && progressIndicators.recentImprovements.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                  <h4 className="font-semibold mb-2 text-green-700 text-sm">Recent Improvements</h4>
                  <ul className="space-y-1.5">
                    {progressIndicators.recentImprovements.map((item, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-green-600">↗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Consistent Strengths */}
              {progressIndicators.consistentStrengths && progressIndicators.consistentStrengths.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                  <h4 className="font-semibold mb-2 text-blue-700 text-sm">Consistent Strengths</h4>
                  <ul className="space-y-1.5">
                    {progressIndicators.consistentStrengths.map((item, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-blue-600">★</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Emerging Skills */}
              {progressIndicators.emergingSkills && progressIndicators.emergingSkills.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <h4 className="font-semibold mb-2 text-purple-700 text-sm">Emerging Skills</h4>
                  <ul className="space-y-1.5">
                    {progressIndicators.emergingSkills.map((item, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-purple-600">✦</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Priority Areas */}
              {progressIndicators.priorityAreas && progressIndicators.priorityAreas.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-lg border border-orange-500/20">
                  <h4 className="font-semibold mb-2 text-orange-700 text-sm">Priority Focus Areas</h4>
                  <ul className="space-y-1.5">
                    {progressIndicators.priorityAreas.map((item, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-orange-600">!</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningPathwayCard;
