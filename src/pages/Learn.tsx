import { useState, useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import type { Unit, Skill, UserSkillProgress } from '@/types/exercises';

const Learn = () => {
  const { isAuthenticated } = useAuthGuard();
  const navigate = useNavigate();
  const [units, setUnits] = useState<(Unit & { skills: (Skill & { progress?: UserSkillProgress })[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoadmap();
    }
  }, [isAuthenticated]);

  const fetchRoadmap = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch first course and its units
      const { data: course } = await supabase
        .from('courses')
        .select('*')
        .single();

      if (!course) {
        setLoading(false);
        return;
      }

      // Fetch units with skills
      const { data: unitsData } = await supabase
        .from('units')
        .select('*')
        .eq('course_id', course.id)
        .order('idx');

      if (!unitsData) {
        setLoading(false);
        return;
      }

      // Fetch skills for all units
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
        .in('unit_id', unitsData.map(u => u.id))
        .order('idx');

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_skill_progress')
        .select('*')
        .eq('user_id', user.id);

      // Combine data
      const unitsWithSkills = unitsData.map(unit => ({
        ...unit,
        skills: (skillsData || [])
          .filter(s => s.unit_id === unit.id)
          .map(skill => ({
            ...skill,
            progress: progressData?.find(p => p.skill_id === skill.id)
          }))
      }));

      setUnits(unitsWithSkills);
      if (unitsWithSkills.length > 0) {
        setSelectedUnitId(unitsWithSkills[0].id);
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSkillUnlocked = (skill: Skill & { progress?: UserSkillProgress }, skills: (Skill & { progress?: UserSkillProgress })[]) => {
    const skillIndex = skills.findIndex(s => s.id === skill.id);
    if (skillIndex === 0) return true;
    
    const previousSkill = skills[skillIndex - 1];
    return (previousSkill.progress?.mastery || 0) >= 60;
  };

  const handleStartLesson = async (skillId: string) => {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('skill_id', skillId)
      .order('idx')
      .limit(1);

    if (lessons && lessons.length > 0) {
      navigate(`/lesson/${lessons[0].id}`);
    }
  };

  const selectedUnit = units.find(u => u.id === selectedUnitId);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-12 text-center max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Circle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-3">No Learning Path Yet</h2>
              <p className="text-muted-foreground text-lg">
                Your learning journey is about to begin! Contact your teacher to get started with lessons.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Learning Path</h1>
        <p className="text-muted-foreground">Follow the structured path to mastery</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Units sidebar */}
        <div className="md:col-span-1 space-y-2">
          {units.map(unit => (
            <Button
              key={unit.id}
              variant={selectedUnitId === unit.id ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setSelectedUnitId(unit.id)}
            >
              <div className="flex flex-col items-start w-full">
                <span className="font-semibold">{unit.title}</span>
                {unit.cefr_target && (
                  <span className="text-xs opacity-70">{unit.cefr_target}</span>
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* Skills roadmap */}
        <div className="md:col-span-3">
          {selectedUnit && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">{selectedUnit.title}</h2>
                {selectedUnit.description && (
                  <p className="text-muted-foreground mt-1">{selectedUnit.description}</p>
                )}
              </div>

              <div className="space-y-4">
                {selectedUnit.skills.map((skill, index) => {
                  const unlocked = isSkillUnlocked(skill, selectedUnit.skills);
                  const mastery = skill.progress?.mastery || 0;
                  const completed = mastery >= 100;

                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className={`p-6 transition-all duration-300 hover:shadow-lg ${
                          !unlocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'
                        } ${completed ? 'border-green-500/50 bg-green-500/5' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          <motion.div 
                            className="flex-shrink-0 mt-1"
                            animate={completed ? { rotate: [0, 360] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            {completed ? (
                              <div className="relative">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
                              </div>
                            ) : unlocked ? (
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Circle className="w-5 h-5 text-primary" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Lock className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </motion.div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold">{skill.title}</h3>
                              {skill.description && (
                                <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                {skill.grammar_point && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                    {skill.grammar_point}
                                  </span>
                                )}
                                {skill.vocab_theme && (
                                  <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                                    {skill.vocab_theme}
                                  </span>
                                )}
                                {skill.cefr_target && (
                                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                                    {skill.cefr_target}
                                  </span>
                                )}
                              </div>
                            </div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => handleStartLesson(skill.id)}
                                disabled={!unlocked}
                                size="lg"
                              >
                                {completed ? '🔄 Practice Again' : '▶️ Start'}
                              </Button>
                            </motion.div>
                          </div>

                          {mastery > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Mastery</span>
                                <span>{Math.round(mastery)}%</span>
                              </div>
                              <Progress value={mastery} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Learn;
