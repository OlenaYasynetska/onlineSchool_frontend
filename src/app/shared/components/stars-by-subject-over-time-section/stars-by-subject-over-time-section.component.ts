import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import {
  APEX_LINE_GRID,
  APEX_LINE_LEGEND,
  APEX_LINE_PLOT_OPTIONS,
  APEX_LINE_STROKE,
  APEX_LINE_TOOLTIP,
  createApexLineChart,
} from '../../charts/apex-line-chart-student-style';
import { buildHomeworkStarsChartXAxis } from '../../charts/homework-stars-chart-xaxis.util';

export type StarsChartPreset =
  | 'thisMonth'
  | 'last3mo'
  | 'last6mo'
  | 'last12mo'
  | 'custom';

@Component({
  selector: 'app-stars-by-subject-over-time-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgApexchartsModule],
  templateUrl: './stars-by-subject-over-time-section.component.html',
})
export class StarsBySubjectOverTimeSectionComponent {
  /** Stable Apex chart id (DOM / instance). */
  chartId = input.required<string>();
  /** Optional `id` on the root section (anchors / scroll). */
  sectionDomId = input<string>('');
  hostSectionClass = input(
    'scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6'
  );

  detailRouterLink = input<string>('');

  dateFrom = input.required<string>();
  dateTo = input.required<string>();
  dateFromChange = output<string>();
  dateToChange = output<string>();

  /** Teacher: static preset buttons; student: highlights active preset. */
  presetStyle = input<'teacher' | 'student'>('student');
  chartPreset = input<StarsChartPreset>('thisMonth');

  dateRangeError = input<string | null>(null);
  chartError = input<string | null>(null);
  loading = input(false);
  chartRefreshing = input(false);

  bucketLabels = input.required<string[]>();
  series = input.required<ApexAxisChartSeries>();
  colors = input.required<string[]>();
  yaxis = input.required<ApexYAxis>();

  applyRange = output<void>();
  presetThisMonth = output<void>();
  presetLastMonths = output<3 | 6 | 12>();

  readonly chartConfig = computed<ApexChart>(() =>
    createApexLineChart(this.chartId())
  );

  readonly stroke = APEX_LINE_STROKE;
  readonly plotOptions: ApexPlotOptions = APEX_LINE_PLOT_OPTIONS;
  readonly legend = APEX_LINE_LEGEND;
  readonly grid = APEX_LINE_GRID;
  readonly tooltip = APEX_LINE_TOOLTIP;

  readonly xaxis = computed<ApexXAxis>(() =>
    buildHomeworkStarsChartXAxis(
      this.bucketLabels(),
      this.dateFrom(),
      this.dateTo()
    )
  );

  readonly showChart = computed(
    () => !this.loading() && !this.chartRefreshing() && this.series().length > 0
  );

  readonly showEmpty = computed(
    () =>
      !this.loading() &&
      !this.chartRefreshing() &&
      this.series().length === 0 &&
      !this.chartError()
  );

  readonly showLoading = computed(
    () => this.loading() || this.chartRefreshing()
  );

  onPresetMonths(n: 3 | 6 | 12): void {
    this.presetLastMonths.emit(n);
  }
}
