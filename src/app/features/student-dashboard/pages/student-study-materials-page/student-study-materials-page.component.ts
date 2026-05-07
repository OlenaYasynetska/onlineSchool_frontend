import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import {
  StudyMaterialsService,
  type StudyMaterialLessonDto,
  type StudyMaterialSetDto,
} from '../../../../core/services/study-materials.service';
import { StudyMaterialPdfViewerComponent } from '../../../../shared/components/study-material-pdf-viewer/study-material-pdf-viewer.component';
import { IssuuEmbedFrameComponent } from '../../../../shared/components/issuu-embed-frame/issuu-embed-frame.component';
import { useStudyMaterialLessonPreview } from '../../../../shared/hooks/use-study-material-lesson-preview.hook';

@Component({
  selector: 'app-student-study-materials-page',
  standalone: true,
  imports: [CommonModule, StudyMaterialPdfViewerComponent, IssuuEmbedFrameComponent],
  templateUrl: './student-study-materials-page.component.html',
})
export class StudentStudyMaterialsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(StudyMaterialsService);

  readonly lessonPreview = useStudyMaterialLessonPreview({
    fetchPdfBlob: (lesson) => {
      const u = this.auth.currentUser();
      return u?.id ? this.api.getStudentLessonPdfBlob(u.id, lesson.id, true) : null;
    },
  });

  loading = true;
  notLinked = false;
  sets: StudyMaterialSetDto[] = [];
  selectedSet: StudyMaterialSetDto | null = null;
  lessons: StudyMaterialLessonDto[] = [];
  lessonsLoading = false;
  lessonsError: string | null = null;

  constructor() {
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.loading = false;
      this.notLinked = true;
      return;
    }
    this.api.listStudentSets(u.id).subscribe({
      next: (s) => {
        this.sets = s;
        this.loading = false;
      },
      error: (err: { status?: number }) => {
        this.loading = false;
        this.sets = [];
        if (err?.status === 404) {
          this.notLinked = true;
        }
      },
    });
  }

  selectSet(row: StudyMaterialSetDto): void {
    if (this.selectedSet?.id !== row.id) {
      this.lessonPreview.closePdf();
    }
    this.selectedSet = row;
    this.lessons = [];
    this.lessonsError = null;
    const u = this.auth.currentUser();
    if (!u?.id) {
      return;
    }
    this.lessonsLoading = true;
    this.api.listStudentLessons(u.id, row.id).subscribe({
      next: (list) => {
        this.lessons = list;
        this.lessonsLoading = false;
      },
      error: () => {
        this.lessons = [];
        this.lessonsLoading = false;
        this.lessonsError = 'Could not load lessons.';
      },
    });
  }
}
