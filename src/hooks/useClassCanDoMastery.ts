import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  buildCurriculumIndex,
  computeCoverage,
  computeStudentReadiness,
  groupNeedsHelp,
  type CanDoLink,
  type CanDoStatement,
  type CoverageRow,
  type LearnerEvidence,
  type NeedsHelpGroup,
  type StudentReadiness,
} from "@/utils/benchmarkReadiness";

/**
 * Class-level can-do mastery, practiced-vs-tested coverage and benchmark
 * readiness projections.
 *
 * Every read here is RLS-scoped: a teacher only receives rows for students in
 * their own classes (is_teacher_of_student / is_teacher_of_class), and a student
 * can only ever read their own rows.
 */

export interface ClassCanDoData {
  statements: CanDoStatement[];
  students: StudentReadiness[];
  coverage: CoverageRow[];
  needsHelp: NeedsHelpGroup[];
  domains: string[];
}

export function useClassCanDoMastery(classId?: string) {
  return useQuery<ClassCanDoData>({
    queryKey: ["class-candos", classId],
    enabled: !!classId,
    queryFn: async () => {
      const empty: ClassCanDoData = {
        statements: [],
        students: [],
        coverage: [],
        needsHelp: [],
        domains: [],
      };

      const [{ data: enrollments, error: enrollErr }, statementsRes, linksRes, unitsRes] =
        await Promise.all([
          supabase
            .from("student_enrollments")
            .select("student_id, profiles:student_id (display_name, email)")
            .eq("class_id", classId!)
            .eq("status", "active"),
          supabase
            .from("can_do_statements")
            .select("id, framework, skill_or_mode, level, statement")
            .order("framework", { ascending: true })
            .order("level", { ascending: true }),
          supabase.from("content_can_do_map").select("can_do_id, content_type, content_id"),
          supabase
            .from("units")
            .select("id, title, position, skills (id, lessons (id))")
            .order("position", { ascending: true }),
        ]);

      if (enrollErr) throw enrollErr;
      const statements = (statementsRes.data ?? []) as CanDoStatement[];
      const links = (linksRes.data ?? []) as CanDoLink[];
      const index = buildCurriculumIndex((unitsRes.data ?? []) as any);

      const studentIds = (enrollments ?? []).map((e: any) => e.student_id).filter(Boolean);
      if (!studentIds.length || !statements.length) {
        return { ...empty, statements };
      }

      const [masteryRes, cardsRes, certsRes] = await Promise.all([
        supabase
          .from("skill_mastery")
          .select("user_id, skill_id, mastery, attempts")
          .in("user_id", studentIds),
        supabase
          .from("vocab_card_state")
          .select("user_id, reps, lapses, state, due")
          .in("user_id", studentIds),
        supabase
          .from("certification_attempts")
          .select("user_id, level, score")
          .in("user_id", studentIds),
      ]);

      const byUser = <T extends { user_id: string }>(rows: T[] | null) => {
        const map: Record<string, T[]> = {};
        for (const row of rows ?? []) (map[row.user_id] ??= []).push(row);
        return map;
      };
      const mastery = byUser(masteryRes.data as any);
      const cards = byUser(cardsRes.data as any);
      const certs = byUser(certsRes.data as any);

      const students = (enrollments ?? []).map((enrollment: any) => {
        const id = enrollment.student_id as string;
        const evidence: LearnerEvidence = {
          studentId: id,
          studentName:
            enrollment.profiles?.display_name || enrollment.profiles?.email || "Student",
          mastery: (mastery[id] ?? []) as any,
          cards: (cards[id] ?? []) as any,
          assessments: (certs[id] ?? []).map((c: any) => ({ level: c.level, score: c.score })),
        };
        return computeStudentReadiness(evidence, statements, links, index);
      });

      const domains = [...new Set(statements.map((s) => s.skill_or_mode || "General"))];

      return {
        statements,
        students,
        coverage: computeCoverage(students, statements),
        needsHelp: groupNeedsHelp(students, statements),
        domains,
      };
    },
  });
}

/** The signed-in learner's own can-do mastery + readiness projection. */
export function useMyCanDoReadiness() {
  return useQuery({
    queryKey: ["my-candos"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return null;

      const [statementsRes, linksRes, unitsRes, masteryRes, cardsRes, certsRes] = await Promise.all([
        supabase.from("can_do_statements").select("id, framework, skill_or_mode, level, statement"),
        supabase.from("content_can_do_map").select("can_do_id, content_type, content_id"),
        supabase.from("units").select("id, skills (id, lessons (id))"),
        supabase.from("skill_mastery").select("skill_id, mastery, attempts").eq("user_id", userId),
        supabase.from("vocab_card_state").select("reps, lapses, state, due").eq("user_id", userId),
        supabase.from("certification_attempts").select("level, score").eq("user_id", userId),
      ]);

      const statements = (statementsRes.data ?? []) as CanDoStatement[];
      const index = buildCurriculumIndex((unitsRes.data ?? []) as any);
      const readiness = computeStudentReadiness(
        {
          studentId: userId,
          studentName: "You",
          mastery: (masteryRes.data ?? []) as any,
          cards: (cardsRes.data ?? []) as any,
          assessments: (certsRes.data ?? []).map((c: any) => ({ level: c.level, score: c.score })),
        },
        statements,
        (linksRes.data ?? []) as CanDoLink[],
        index,
      );

      const nextTargets = statements
        .filter((s) => {
          const cell = readiness.cells[s.id];
          return cell && !cell.unmapped && !cell.mastered;
        })
        .slice(0, 3);

      return { readiness, statements, nextTargets };
    },
  });
}
