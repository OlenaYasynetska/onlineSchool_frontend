import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import {
  StudyMaterialsService,
  type StudyMaterialLessonDto,
  type StudyMaterialSetDto,
} from '../../../../core/services/study-materials.service';
import {
  normalizeSchoolId,
  SESSION_STORAGE_SCHOOL_ID_KEY,
} from '../../../school-admin/utils/school-id.util';
import { StudyMaterialPdfViewerComponent } from '../../../../shared/components/study-material-pdf-viewer/study-material-pdf-viewer.component';
import { IssuuEmbedFrameComponent } from '../../../../shared/components/issuu-embed-frame/issuu-embed-frame.component';
import { useStudyMaterialLessonPreview } from '../../../../shared/hooks/use-study-material-lesson-preview.hook';

@Component({
  selector: 'app-school-admin-study-materials-page',
  standalone: true,
  imports: [CommonModule, StudyMaterialPdfViewerComponent, IssuuEmbedFrameComponent],
  templateUrl: './school-admin-study-materials-page.component.html',
})
export class SchoolAdminStudyMaterialsPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(StudyMaterialsService);

  readonly lessonPreview = useStudyMaterialLessonPreview({
    fetchPdfBlob: (lesson) =>
      this.schoolId ? this.api.getAdminLessonPdfBlob(this.schoolId, lesson.id, true) : null,
  });

  loading = true;
  noSchool = false;
  schoolId = '';
  sets: StudyMaterialSetDto[] = [];
  selectedSet: StudyMaterialSetDto | null = null;
  lessons: StudyMaterialLessonDto[] = [];
  lessonsLoading = false;
  lessonsError: string | null = null;

  ngOnInit(): void {
    const fromAuth = normalizeSchoolId(this.auth.currentUser()?.schoolId);
    const fromSession =
      typeof sessionStorage !== 'undefined'
        ? normalizeSchoolId(sessionStorage.getItem(SESSION_STORAGE_SCHOOL_ID_KEY))
        : '';
    this.schoolId = fromAuth || fromSession;
    if (!this.schoolId) {
      this.noSchool = true;
      this.loading = false;
      return;
    }
    this.api.listAdminSets(this.schoolId).subscribe({
      next: (s) => {
        this.sets = s;
        this.loading = false;
      },
      error: () => {
        this.sets = [];
        this.loading = false;
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
    if (!this.schoolId) {
      return;
    }
    this.lessonsLoading = true;
    this.api.listAdminLessons(this.schoolId, row.id).subscribe({
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
