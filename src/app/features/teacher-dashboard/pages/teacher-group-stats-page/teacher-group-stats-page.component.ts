import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import { AuthService } from '../../../../core/services/auth.service';
import {
  APEX_LINE_GRID,
  APEX_LINE_LEGEND,
  APEX_LINE_PLOT_OPTIONS,
  APEX_LINE_STROKE,
  APEX_LINE_TOOLTIP,
  APEX_LINE_YAXIS_DEFAULT,
  createApexLineChart,
} from '../../../../shared/charts/apex-line-chart-student-style';
import { TeacherDashboardService } from '../../services/teacher-dashboard.service';
import type { TeacherGroupStats } from '../../models/teacher-group-stats.model';

/** Та сама крива накопичення, що й у учня — масштабується до сумарних зірок по предмету в групі. */
const LINE_TEMPLATE = [22, 45, 52, 68, 82];

@Component({
  selector: 'app-teacher-group-stats-page',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './teacher-group-stats-page.component.html',
})
export class TeacherGroupStatsPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(TeacherDashboardService);

  loading = true;
  loadError: string | null = null;
  noProfile = false;
  groups: TeacherGroupStats[] = [];

  private readonly emptySeries: ApexAxisChartSeries = [];

  /** Стабільні посилання після завантаження API — інакше apx-chart пересоздається щоразу. */
  seriesByGroupId = new Map<string, ApexAxisChartSeries>();
  private chartOptionsByGroupId = new Map<string, ApexChart>();
  yaxisByGroupId = new Map<string, ApexYAxis>();
  private colorsByGroupId = new Map<string, string[]>();
  private xaxisByGroupId = new Map<string, ApexXAxis>();

  private readonly chartMonthsFallback = ['Apr', 'May', 'Jun', 'Jul', 'Aug'];

  private readonly subjectLineColors = ['#2563eb', '#16a34a', '#d97706', '#9333ea'];

  readonly groupStatsStroke = APEX_LINE_STROKE;

  readonly groupStatsPlotOptions: ApexPlotOptions = APEX_LINE_PLOT_OPTIONS;

  readonly groupStatsLegend = APEX_LINE_LEGEND;

  readonly groupStatsGrid = APEX_LINE_GRID;

  readonly groupStatsTooltip = APEX_LINE_TOOLTIP;

  readonly lineYaxisFallback: ApexYAxis = APEX_LINE_YAXIS_DEFAULT;

  readonly lineXaxisFallback: ApexXAxis = {
    categories: this.chartMonthsFallback,
    labels: {
      style: { colors: '#64748b', fontSize: '11px', fontWeight: 500 },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  readonly groupLineChartFallback: ApexChart = createApexLineChart(
    'teacher-group-stats-line'
  );

  ngOnInit(): void {
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.loading = false;
      this.loadError = 'Not signed in.';
      return;
    }
    this.api.listGroupStats(u.id).subscribe({
      next: (g) => {
        this.groups = g;
        this.rebuildChartCaches(g);
        this.loading = false;
      },
      error: (err: { status?: number }) => {
        this.loading = false;
        if (err?.status === 404) {
          this.noProfile = true;
        } else {
          this.loadError = 'Could not load statistics.';
        }
      },
    });
  }

  private rebuildChartCaches(groups: TeacherGroupStats[]): void {
    const nextSeries = new Map<string, ApexAxisChartSeries>();
    const nextCharts = new Map<string, ApexChart>();
    const nextYaxis = new Map<string, ApexYAxis>();
    const nextColors = new Map<string, string[]>();
    const nextXaxis = new Map<string, ApexXAxis>();
    for (const grp of groups) {
      const series = this.buildLineSeries(grp);
      nextSeries.set(grp.groupId, series);
      nextCharts.set(
        grp.groupId,
        createApexLineChart(`teacher-group-line-${grp.groupId}`)
      );
      nextYaxis.set(grp.groupId, this.computeYaxisForSeries(series));
      nextXaxis.set(grp.groupId, this.buildXaxisForGroup(grp));
      nextColors.set(
        grp.groupId,
        grp.subjectTitles.map(
          (_, i) => this.subjectLineColors[i % this.subjectLineColors.length]
        )
      );
    }
    this.seriesByGroupId = nextSeries;
    this.chartOptionsByGroupId = nextCharts;
    this.yaxisByGroupId = nextYaxis;
    this.xaxisByGroupId = nextXaxis;
    this.colorsByGroupId = nextColors;
  }

  private buildXaxisForGroup(g: TeacherGroupStats): ApexXAxis {
    const categories =
      (g.chartMonthLabels?.length ?? 0) > 0
        ? g.chartMonthLabels!
        : this.chartMonthsFallback;
    return {
      categories,
      labels: {
        style: { colors: '#64748b', fontSize: '11px', fontWeight: 500 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    };
  }

  private computeYaxisForSeries(series: ApexAxisChartSeries): ApexYAxis {
    let max = 0;
    for (const s of series) {
      for (const v of s.data as number[]) {
        if (v > max) max = v;
      }
    }
    const cap =
      max <= 0 ? 5 : Math.max(5, Math.ceil(max / 5) * 5);
    return {
      min: 0,
      max: cap,
      tickAmount: 5,
      labels: {
        style: { colors: '#64748b', fontSize: '11px' },
      },
    };
  }

  seriesForGroup(g: TeacherGroupStats): ApexAxisChartSeries {
    return this.seriesByGroupId.get(g.groupId) ?? this.emptySeries;
  }

  chartForGroup(g: TeacherGroupStats): ApexChart {
    return (
      this.chartOptionsByGroupId.get(g.groupId) ?? this.groupLineChartFallback
    );
  }

  yaxisForGroup(g: TeacherGroupStats): ApexYAxis {
    return this.yaxisByGroupId.get(g.groupId) ?? this.lineYaxisFallback;
  }

  colorsForGroup(g: TeacherGroupStats): string[] {
    return this.colorsByGroupId.get(g.groupId) ?? [];
  }

  xaxisForGroup(g: TeacherGroupStats): ApexXAxis {
    return this.xaxisByGroupId.get(g.groupId) ?? this.lineXaxisFallback;
  }

  subjectTotalStars(g: TeacherGroupStats, subject: string): number {
    return g.students.reduce(
      (sum, s) => sum + (s.starsBySubject[subject] ?? 0),
      0
    );
  }

  private scaledLinePoints(total: number): number[] {
    if (total <= 0) {
      return [0, 0, 0, 0, 0];
    }
    const maxT = LINE_TEMPLATE[LINE_TEMPLATE.length - 1];
    return LINE_TEMPLATE.map((t) => Math.round((t / maxT) * total));
  }

  private buildLineSeries(g: TeacherGroupStats): ApexAxisChartSeries {
    if (g.subjectTitles.length === 0) {
      return [];
    }
    const fromDb = g.chartMonthLabels?.length && g.starsBySubjectChartSeries;
    if (fromDb) {
      const n = g.chartMonthLabels!.length;
      return g.subjectTitles.map((sub) => ({
        name: sub,
        data:
          g.starsBySubjectChartSeries![sub] ??
          Array.from({ length: n }, () => 0),
      }));
    }
    return g.subjectTitles.map((sub) => ({
      name: sub,
      data: this.scaledLinePoints(this.subjectTotalStars(g, sub)),
    }));
  }
}
