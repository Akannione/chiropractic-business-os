import { parseInquiryCsv } from './importService.js';

export type IntelligenceReportType =
  | 'appointments'
  | 'patient-list'
  | 'provider-hours'
  | 'referral-sources'
  | 'sales'
  | 'accounts-receivable'
  | 'payments'
  | 'packages-care-plans'
  | 'bank-transactions'
  | 'unknown';

export type IntelligenceFileInput = {
  name: string;
  csvText: string;
};

type ReportRule = {
  type: Exclude<IntelligenceReportType, 'unknown'>;
  label: string;
  filenameHints: string[];
  headerGroups: string[][];
};

const reportRules: ReportRule[] = [
  {
    type: 'appointments',
    label: 'Appointments',
    filenameHints: ['appointment'],
    headerGroups: [['appointment', 'date'], ['status'], ['patient']],
  },
  {
    type: 'patient-list',
    label: 'Patient List',
    filenameHints: ['patient list', 'patients'],
    headerGroups: [['patient'], ['email', 'phone'], ['created', 'first visit', 'last visit']],
  },
  {
    type: 'provider-hours',
    label: 'Provider Hours',
    filenameHints: ['provider hours', 'hours scheduled', 'booked'],
    headerGroups: [['provider'], ['scheduled', 'available', 'hours'], ['booked', 'utilization']],
  },
  {
    type: 'referral-sources',
    label: 'Referral Sources',
    filenameHints: ['referral source', 'referrals'],
    headerGroups: [['referral'], ['source'], ['patient', 'count']],
  },
  {
    type: 'sales',
    label: 'Sales',
    filenameHints: ['sales', 'daily transaction'],
    headerGroups: [['sale', 'transaction'], ['amount', 'total', 'revenue'], ['date']],
  },
  {
    type: 'accounts-receivable',
    label: 'Accounts Receivable',
    filenameHints: ['accounts receivable', 'a r', 'ar export'],
    headerGroups: [['balance', 'amount due', 'outstanding'], ['patient', 'account'], ['aging', 'days']],
  },
  {
    type: 'payments',
    label: 'Payments',
    filenameHints: ['payment', 'payout'],
    headerGroups: [['payment', 'payout'], ['amount', 'total'], ['date']],
  },
  {
    type: 'packages-care-plans',
    label: 'Packages / Care Plans',
    filenameHints: ['package', 'care plan'],
    headerGroups: [['package', 'care plan'], ['remaining', 'used', 'visits'], ['patient']],
  },
  {
    type: 'bank-transactions',
    label: 'Bank Transactions',
    filenameHints: ['bank transaction', 'bank'],
    headerGroups: [['description', 'merchant'], ['amount'], ['date']],
  },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[_-]+/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function headerMatches(header: string, clue: string) {
  const normalized = normalize(header);
  const expected = normalize(clue);
  return normalized === expected || normalized.includes(expected) || expected.includes(normalized);
}

function scoreRule(filename: string, headers: string[], rule: ReportRule) {
  const normalizedFilename = normalize(filename);
  let score = rule.filenameHints.some((hint) => normalizedFilename.includes(normalize(hint))) ? 3 : 0;
  let matchedGroups = 0;
  for (const group of rule.headerGroups) {
    if (group.some((clue) => headers.some((header) => headerMatches(header, clue)))) {
      matchedGroups += 1;
      score += 2;
    }
  }
  return { score, matchedGroups };
}
function numberFrom(row: Record<string, string>, clues: string[]) {
  for (const [key, value] of Object.entries(row)) {
    if (!clues.some((clue) => headerMatches(key, clue))) continue;
    const normalized = String(value || '').replace(/[$,%()]/g, '').replace(/,/g, '').trim();
    if (!normalized) continue;
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function textFrom(row: Record<string, string>, clues: string[]) {
  for (const [key, value] of Object.entries(row)) {
    if (clues.some((clue) => headerMatches(key, clue)) && String(value || '').trim()) {
      return String(value).trim();
    }
  }
  return '';
}

function classifyFile(file: IntelligenceFileInput) {
  const rows = parseInquiryCsv(file.csvText);
  const firstLine = file.csvText.split(/\r?\n/, 1)[0] || '';
  const headers = firstLine
    .split(',')
    .map((header) => header.replace(/^"|"$/g, '').trim())
    .filter(Boolean);

  const candidates = reportRules
    .map((rule) => ({ rule, ...scoreRule(file.name, headers, rule) }))
    .sort((left, right) => right.score - left.score);
  const best = candidates[0];
  const recognized = Boolean(best && best.score >= 4 && best.matchedGroups >= 1);
  const confidence = recognized ? Math.min(0.99, 0.45 + best.score * 0.07) : 0;

  return {
    fileName: file.name,
    reportType: recognized ? best.rule.type : 'unknown' as IntelligenceReportType,
    reportLabel: recognized ? best.rule.label : 'Unknown report',
    confidence: Math.round(confidence * 100),
    recognized,
    rowCount: rows.length,
    headers,
    rows,
    warnings: rows.length ? [] as string[] : ['No data rows were found.'],
  };
}

function buildSignals(classified: ReturnType<typeof classifyFile>[]) {
  const signals: Array<{
    key: string;
    title: string;
    detail: string;
    value: number;
    unit: 'count' | 'currency' | 'percent';
    source: string;
    severity: 'info' | 'attention';
  }> = [];
  for (const report of classified) {
    if (report.reportType === 'appointments') {
      const missed = report.rows.filter((row) => {
        const status = normalize(textFrom(row, ['status', 'appointment status']));
        return status.includes('cancel') || status.includes('no show') || status.includes('missed');
      }).length;
      if (missed > 0) {
        signals.push({
          key: `${report.fileName}:missed-appointments`,
          title: 'Appointments needing recovery review',
          detail: `${missed} cancelled, missed, or no-show appointment rows were detected.`,
          value: missed,
          unit: 'count',
          source: report.fileName,
          severity: 'attention',
        });
      }
    }

    if (report.reportType === 'accounts-receivable') {
      const balances = report.rows
        .map((row) => numberFrom(row, ['balance', 'amount due', 'outstanding']))
        .filter((value): value is number => value !== null && value > 0);
      const total = balances.reduce((sum, value) => sum + value, 0);
      if (total > 0) {
        signals.push({
          key: `${report.fileName}:outstanding-ar`,
          title: 'Outstanding balance exposure',
          detail: `${balances.length} rows contain a positive outstanding balance. This is a review signal, not a collection recommendation.`,
          value: Math.round(total * 100) / 100,
          unit: 'currency',
          source: report.fileName,
          severity: 'attention',
        });
      }
    }

    if (report.reportType === 'provider-hours') {
      const rowsWithCapacity = report.rows.map((row) => ({
        booked: numberFrom(row, ['booked hours', 'booked']),
        available: numberFrom(row, ['available hours', 'scheduled hours', 'hours scheduled', 'available']),
      })).filter((row) => row.booked !== null && row.available !== null && row.available > 0);
      const booked = rowsWithCapacity.reduce((sum, row) => sum + Number(row.booked), 0);
      const available = rowsWithCapacity.reduce((sum, row) => sum + Number(row.available), 0);
      if (available > 0) {
        signals.push({
          key: `${report.fileName}:utilization`,
          title: 'Provider schedule utilization',
          detail: 'Calculated from detected booked and available/scheduled hour columns.',
          value: Math.round((booked / available) * 1000) / 10,
          unit: 'percent',
          source: report.fileName,
          severity: booked / available < 0.75 ? 'attention' : 'info',
        });
      }
    }
  }
  return signals;
}

export function analyzeIntelligenceFiles(files: IntelligenceFileInput[]) {
  const classified = files.map(classifyFile);
  const signals = buildSignals(classified);
  const recognizedReports = classified.filter((file) => file.recognized).length;

  return {
    files: classified.map(({ rows, ...file }) => file),
    signals,
    summary: {
      filesReceived: files.length,
      recognizedReports,
      unrecognizedReports: files.length - recognizedReports,
      totalRows: classified.reduce((sum, file) => sum + file.rowCount, 0),
      signalsFound: signals.length,
    },
    boundary: 'Preview only. No source system is written to and no clinical data model is created.',
  };
}
