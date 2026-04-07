export interface TeacherGroupStudentStatRow {
  studentId: string;
  fullName: string;
  starsBySubject: Record<string, number>;
}

export interface TeacherGroupStats {
  groupId: string;
  groupName: string;
  groupCode: string;
  subjectTitles: string[];
  students: TeacherGroupStudentStatRow[];
}
