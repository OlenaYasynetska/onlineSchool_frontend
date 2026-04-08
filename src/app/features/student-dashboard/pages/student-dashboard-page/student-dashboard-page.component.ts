import { Component, inject, OnInit, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CommonModule } from '@angular/common';

import { NavigationEnd, Router } from '@angular/router';

import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';

import { NgApexchartsModule } from 'ng-apexcharts';

import type {

  ApexAxisChartSeries,

  ApexChart,

  ApexPlotOptions,

  ApexXAxis,

  ApexYAxis,

} from 'ng-apexcharts';

import { AuthService } from '../../../../core/services/auth.service';

import { StudentHomeworkService } from '../../services/student-homework.service';

import type {
  StudentDashboardContextDto,
  StudentGroupOption,
  StudentMyStarsDto,
} from '../../models/student-homework.model';

import {

  APEX_LINE_GRID,

  APEX_LINE_LEGEND,

  APEX_LINE_PLOT_OPTIONS,

  APEX_LINE_STROKE,

  APEX_LINE_TOOLTIP,

  APEX_LINE_YAXIS_DEFAULT,

  createApexLineChart,

} from '../../../../shared/charts/apex-line-chart-student-style';



export type StudentRewardRow = {

  date: string;

  teacher: string;

  subject: string;

  change: number;

  reason: string;

};

export type StudentSubjectRow = {

  id: string;

  subject: string;

  teacher: string;

  starsTotal: number;

  course: string;

};



@Component({

  selector: 'app-student-dashboard-page',

  standalone: true,

  imports: [CommonModule, NgApexchartsModule],

  templateUrl: './student-dashboard-page.component.html',

})

export class StudentDashboardPageComponent implements OnInit {

  private readonly auth = inject(AuthService);

  private readonly router = inject(Router);

  private readonly homeworkApi = inject(StudentHomeworkService);



  /** Перший сегмент після `/student`. */

  readonly cabinetSegment = signal<string>('');



  loadingStars = true;

  starsLoadError: string | null = null;

  schoolName = '';

  enrolledGroups: StudentGroupOption[] = [];



  totalStars = 0;

  weekGain = 0;

  monthGain = 0;



  rewardLog: StudentRewardRow[] = [];



  subjects: StudentSubjectRow[] = [];



  groupStatsSeries: ApexAxisChartSeries = [];



  private readonly subjectLineColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea'];



  groupStatsColors: string[] = [];



  readonly groupStatsChart: ApexChart = createApexLineChart(

    'student-dashboard-stars-time'

  );



  readonly groupStatsStroke = APEX_LINE_STROKE;



  readonly groupStatsPlotOptions: ApexPlotOptions = APEX_LINE_PLOT_OPTIONS;



  groupStatsXaxis: ApexXAxis = {

    categories: [],

    labels: {

      style: { colors: '#64748b', fontSize: '11px', fontWeight: 500 },

    },

    axisBorder: { show: false },

    axisTicks: { show: false },

  };



  groupStatsYaxis: ApexYAxis = APEX_LINE_YAXIS_DEFAULT;



  readonly groupStatsLegend = APEX_LINE_LEGEND;



  readonly groupStatsGrid = APEX_LINE_GRID;



  readonly groupStatsTooltip = APEX_LINE_TOOLTIP;



  constructor() {

    this.router.events

      .pipe(

        filter((e): e is NavigationEnd => e instanceof NavigationEnd),

        takeUntilDestroyed()

      )

      .subscribe(() => {

        this.updateCabinetSegment();

        this.scheduleScrollToRouteSection();

      });

  }



  get displayName(): string {

    const u = this.auth.currentUser();

    if (!u) return 'Student';

    const full = `${u.firstName} ${u.lastName}`.trim();

    return full || 'Student';

  }



  ngOnInit(): void {

    this.updateCabinetSegment();

    queueMicrotask(() => this.scheduleScrollToRouteSection());

    this.loadDashboardFromApi();

  }

  private loadDashboardFromApi(): void {
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.loadingStars = false;
      return;
    }
    this.loadingStars = true;
    this.starsLoadError = null;
    forkJoin({
      stars: this.homeworkApi.myStars(u.id),
      context: this.homeworkApi.dashboardContext(u.id),
    }).subscribe({
      next: ({
        stars,
        context,
      }: {
        stars: StudentMyStarsDto;
        context: StudentDashboardContextDto;
      }) => {
        this.applyMyStars(stars);
        this.schoolName = context.schoolName?.trim() || '—';
        this.enrolledGroups = context.groups ?? [];
        this.loadingStars = false;
      },
      error: () => {
        this.loadingStars = false;
        this.starsLoadError = 'Could not load dashboard data from the server.';
      },
    });
  }



  private applyMyStars(data: StudentMyStarsDto): void {

    this.totalStars = data.totalStars ?? 0;

    this.weekGain = data.weekGain ?? 0;

    this.monthGain = data.monthGain ?? 0;



    const totals = data.subjectTotals ?? [];

    this.subjects = totals.map((r, i) => ({

      id: `sub-${i}-${r.subject}`,

      subject: r.subject,

      teacher: '',

      starsTotal: r.starsTotal,

      course: '',

    }));



    const labels = data.chartMonthLabels ?? [];

    const seriesMap = data.starsBySubjectChartSeries ?? {};

    let keys = Object.keys(seriesMap).sort((a, b) =>

      a.localeCompare(b, undefined, { sensitivity: 'base' })

    );

    if (keys.length === 0) {

      keys = totals.map((t) => t.subject);

    }



    this.groupStatsSeries = keys.map((sub) => ({

      name: sub,

      data:

        seriesMap[sub] ??

        (labels.length > 0 ? labels.map(() => 0) : [0]),

    }));



    this.groupStatsColors = keys.map(

      (_, i) => this.subjectLineColors[i % this.subjectLineColors.length]

    );



    this.groupStatsXaxis = {

      ...this.groupStatsXaxis,

      categories: labels.length > 0 ? labels : ['—'],

    };



    this.groupStatsYaxis = this.computeYaxisForSeries(this.groupStatsSeries);



    this.rewardLog = (data.rewardLog ?? []).map((r) => ({

      date: new Date(r.gradedAt).toLocaleString(),

      teacher: r.teacherName,

      subject: r.subject,

      change: r.stars,

      reason: (r.feedback && r.feedback.trim()) || 'Graded homework',

    }));

  }



  private computeYaxisForSeries(series: ApexAxisChartSeries): ApexYAxis {

    let max = 0;

    for (const s of series) {

      for (const v of s.data as number[]) {

        if (v > max) max = v;

      }

    }

    const cap = max <= 0 ? 5 : Math.max(5, Math.ceil(max / 5) * 5);

    return {

      min: 0,

      max: cap,

      tickAmount: 5,

      labels: {

        style: { colors: '#64748b', fontSize: '11px' },

      },

    };

  }



  /** Предмети за спаданням зірок (для картки поруч із графіком). */

  subjectsByStars(): StudentSubjectRow[] {

    return [...this.subjects].sort((a, b) => b.starsTotal - a.starsTotal);

  }



  private updateCabinetSegment(): void {

    const url = this.router.url.split('?')[0].split('#')[0];

    if (!url.startsWith('/student')) {

      this.cabinetSegment.set('');

      return;

    }

    const rest = url.slice('/student'.length).replace(/^\//, '');

    this.cabinetSegment.set((rest.split('/')[0] ?? '').trim());

  }



  private routeSectionAnchorId(): string | null {

    const seg = this.cabinetSegment();

    const map: Record<string, string> = {

      '': 'student-top',

      'group-stats': 'student-group-stats',

      groups: 'student-groups',

      schedule: 'student-schedule',

    };

    return map[seg] ?? null;

  }



  private scheduleScrollToRouteSection(): void {

    const id = this.routeSectionAnchorId();

    if (!id || typeof document === 'undefined') return;

    const scroll = () =>

      document.getElementById(id)?.scrollIntoView({

        behavior: 'smooth',

        block: 'start',

      });

    queueMicrotask(scroll);

    setTimeout(scroll, 120);

  }

}


