import { useState, useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
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
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">No Course Available</h2>
          <p className="text-muted-foreground">Contact your teacher to get started with lessons.</p>
        </Card>
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
                {selectedUnit.skills.map(skill => {
                  const unlocked = isSkillUnlocked(skill, selectedUnit.skills);
                  const mastery = skill.progress?.mastery || 0;
                  const completed = mastery >= 100;

                  return (
                    <Card 
                      key={skill.id} 
                      className={`p-6 ${!unlocked ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : unlocked ? (
                            <Circle className="w-6 h-6 text-primary" />
                          ) : (
                            <Lock className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>

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

                            <Button
                              onClick={() => handleStartLesson(skill.id)}
                              disabled={!unlocked}
                            >
                              {completed ? 'Practice' : 'Start'}
                            </Button>
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
