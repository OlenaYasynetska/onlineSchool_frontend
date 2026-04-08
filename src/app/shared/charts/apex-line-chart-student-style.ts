/**
 * Єдині налаштування лінійного графіка (ApexCharts), щоб учень і вчитель виглядали однаково.
 */
import type {
  ApexChart,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexYAxis,
} from 'ng-apexcharts';

const FONT =
  'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

export function createApexLineChart(chartId: string): ApexChart {
  return {
    type: 'line',
    height: 300,
    id: chartId,
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: FONT,
    animations: {
      enabled: true,
      speed: 450,
      animateGradually: { enabled: true, delay: 150 },
      dynamicAnimation: { enabled: true, speed: 350 },
    },
  };
}

export const APEX_LINE_STROKE: ApexStroke = {
  curve: 'smooth',
  width: 4,
  lineCap: 'round',
};

export const APEX_LINE_PLOT_OPTIONS: ApexPlotOptions = {
  line: {
    isSlopeChart: false,
  },
};

export const APEX_LINE_YAXIS_DEFAULT: ApexYAxis = {
  min: 0,
  max: 100,
  tickAmount: 5,
  labels: {
    style: { colors: '#64748b', fontSize: '11px' },
  },
};

export const APEX_LINE_LEGEND: ApexLegend = {
  position: 'top',
  horizontalAlign: 'left',
  offsetY: 0,
  fontSize: '12px',
  fontWeight: 500,
  labels: { colors: '#334155' },
  markers: { strokeWidth: 0 },
};

export const APEX_LINE_GRID: ApexGrid = {
  borderColor: '#e2e8f0',
  strokeDashArray: 4,
  padding: { top: 8, right: 0, bottom: 0, left: 12 },
  xaxis: { lines: { show: false } },
};

export const APEX_LINE_TOOLTIP: ApexTooltip = {
  theme: 'light',
  shared: true,
  intersect: false,
};
