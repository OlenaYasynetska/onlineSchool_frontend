/** Тіло POST/PUT для слота розкладу. */
export interface UpsertSchedulePayload {
  groupId: string;
  teacherId: string;
  subjectId?: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  validFrom?: string | null;
  validUntil?: string | null;
  notes?: string | null;
  room?: string | null;
}

/** Відповідає `ScheduleSlotResponse` на бекенді. */
export interface ScheduleSlot {
  id: string;
  groupId: string;
  groupName: string;
  teacherId: string;
  teacherDisplayName: string;
  subjectId: string | null;
  subjectTitle: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  validFrom: string | null;
  validUntil: string | null;
  notes: string | null;
  room: string | null;
}
