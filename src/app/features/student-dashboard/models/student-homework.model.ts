export interface TeacherOptionShort {
  id: string;
  displayName: string;
}

export interface StudentGroupOption {
  id: string;
  name: string;
  code: string;
}

export interface HomeworkSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  subjectTitle: string;
  messageText: string | null;
  fileName: string;
  status: string;
  stars: number | null;
  teacherFeedback: string | null;
  groupName: string | null;
  submittedAt: string;
  gradedAt: string | null;
}
