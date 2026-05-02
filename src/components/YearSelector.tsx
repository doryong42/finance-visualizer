'use client';

import { ReportCode, REPORT_CODE_LABELS } from '@/lib/types';

interface Props {
  year: string;
  reportCode: ReportCode;
  fsDiv: 'CFS' | 'OFS';
  onYearChange: (y: string) => void;
  onReportCodeChange: (r: ReportCode) => void;
  onFsDivChange: (f: 'CFS' | 'OFS') => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => String(currentYear - i));

export default function YearSelector({
  year, reportCode, fsDiv,
  onYearChange, onReportCodeChange, onFsDivChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">사업연도</label>
        <select
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">보고서</label>
        <select
          value={reportCode}
          onChange={(e) => onReportCodeChange(e.target.value as ReportCode)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {Object.entries(REPORT_CODE_LABELS).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">재무제표</label>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          {(['CFS', 'OFS'] as const).map((div) => (
            <button
              key={div}
              onClick={() => onFsDivChange(div)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                fsDiv === div
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {div === 'CFS' ? '연결' : '별도'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
