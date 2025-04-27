
import { useCreateClassroom } from './useCreateClassroom';
import { useJoinClassroom } from './useJoinClassroom';

export function useClassroomManagement() {
  const { createClassroom } = useCreateClassroom();
  const { joinClassroom } = useJoinClassroom();

  return {
    createClassroom,
    joinClassroom
  };
}
