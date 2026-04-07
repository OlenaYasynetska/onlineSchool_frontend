import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import { AuthService } from '../../../../core/services/auth.service';
import { TeacherDashboardService } from '../../services/teacher-dashboard.service';
import type { TeacherGroupStats } from '../../models/teacher-group-stats.model';

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

  readonly barChartBase: ApexChart = {
    type: 'bar',
    toolbar: { show: false },
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    animations: { enabled: true, speed: 450 },
  };

  readonly barPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '62%',
      borderRadius: 4,
      dataLabels: { position: 'top' },
    },
  };

  readonly barDataLabels: ApexDataLabels = {
    enabled: false,
  };

  readonly barTooltip: ApexTooltip = {
    theme: 'light',
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number) => `${val} ★`,
    },
  };

  readonly barLegend: ApexLegend = {
    position: 'top',
    horizontalAlign: 'left',
    fontSize: '12px',
    fontWeight: 500,
    labels: { colors: '#334155' },
    markers: { strokeWidth: 0 },
  };

  readonly barYaxis: ApexYAxis = {
    min: 0,
    tickAmount: 5,
    labels: { style: { colors: '#64748b', fontSize: '11px' } },
  };

  private readonly colorPalette = [
    '#3b82f6',
    '#22c55e',
    '#d97706',
    '#a855f7',
    '#ec4899',
    '#14b8a6',
    '#f97316',
  ];

  chartColors(count: number): string[] {
    const n = Math.min(Math.max(count, 1), this.colorPalette.length);
    return this.colorPalette.slice(0, n);
  }

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
        this.loading = false;
      },
      error: (err: { status?: number }) => {
        this.loading = false;
        if (err?.status === 404) {
          this.noProfile = true;
        } else {
          this.loadError = 'Could not load group statistics.';
        }
      },
    });
  }

  chartHeight(g: TeacherGroupStats): number {
    const n = Math.max(g.students.length, 1);
    return Math.min(520, 200 + n * 36);
  }

  barSeries(g: TeacherGroupStats) {
    const subs = g.subjectTitles;
    const studs = g.students;
    if (subs.length === 0 || studs.length === 0) {
      return [];
    }
    return subs.map((sub) => ({
      name: sub,
      data: studs.map((s) => s.starsBySubject[sub] ?? 0),
    }));
  }

  barXaxis(g: TeacherGroupStats): ApexXAxis {
    return {
      categories: g.students.map((s) => s.fullName),
      labels: {
        style: { colors: '#64748b', fontSize: '11px' },
        rotate: -35,
        rotateAlways: studsNeedRotate(g),
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    };
  }

  barChartOptions(g: TeacherGroupStats): ApexChart {
    return {
      ...this.barChartBase,
      id: `teacher-group-stats-${g.groupId}`,
      height: this.chartHeight(g),
    };
  }
}

function studsNeedRotate(g: TeacherGroupStats): boolean {
  return g.students.some((s) => s.fullName.length > 14);
}
