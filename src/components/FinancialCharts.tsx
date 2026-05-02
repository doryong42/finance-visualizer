'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { FinancialItem } from '@/lib/types';
import { parseAmount, formatKoreanAmount, formatChartAmount } from '@/lib/formatters';

interface Props {
  items: FinancialItem[];
  fsDiv: 'CFS' | 'OFS';
}

function getItem(items: FinancialItem[], name: string) {
  return items.find((i) => i.account_nm === name);
}

function buildPeriodData(item: FinancialItem | undefined) {
  if (!item) return null;
  return {
    thstrm: { name: item.thstrm_nm?.replace(' 기', '기'), amount: parseAmount(item.thstrm_amount) },
    frmtrm: { name: item.frmtrm_nm?.replace(' 기', '기'), amount: parseAmount(item.frmtrm_amount) },
    bfefrmtrm: { name: item.bfefrmtrm_nm?.replace(' 기', '기'), amount: parseAmount(item.bfefrmtrm_amount) },
  };
}

const formatYAxis = (value: number) => {
  if (Math.abs(value) >= 100) return `${value}조`;
  if (Math.abs(value) >= 1) return `${value}조`;
  return `${Math.round(value * 10000)}억`;
};

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-medium">{formatKoreanAmount(p.value * 100_000_000_000)}</span>
        </p>
      ))}
    </div>
  );
};

export function BalanceSheetChart({ items, fsDiv }: Props) {
  const filtered = items.filter((i) => i.sj_div === 'BS' && i.fs_div === fsDiv);

  const assetItem = getItem(filtered, '자산총계');
  const liabilityItem = getItem(filtered, '부채총계');
  const equityItem = getItem(filtered, '자본총계');

  if (!assetItem) return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
      재무상태표 데이터가 없습니다
    </div>
  );

  const periods = ['bfefrmtrm', 'frmtrm', 'thstrm'] as const;
  const data = periods.map((p) => ({
    name: assetItem[`${p}_nm`]?.replace(' 기', '기') ?? p,
    자산총계: formatChartAmount(parseAmount(assetItem[`${p}_amount`])),
    부채총계: formatChartAmount(parseAmount(liabilityItem?.[`${p}_amount`] ?? '0')),
    자본총계: formatChartAmount(parseAmount(equityItem?.[`${p}_amount`] ?? '0')),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="자산총계" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="부채총계" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="자본총계" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function IncomeStatementChart({ items, fsDiv }: Props) {
  const filtered = items.filter((i) => i.sj_div === 'IS' && i.fs_div === fsDiv);

  const revenueItem = getItem(filtered, '매출액');
  const opProfitItem = getItem(filtered, '영업이익');
  const netIncomeItem = getItem(filtered, '당기순이익(손실)');

  if (!revenueItem) return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
      손익계산서 데이터가 없습니다
    </div>
  );

  const periods = ['bfefrmtrm', 'frmtrm', 'thstrm'] as const;
  const data = periods.map((p) => {
    const rev = parseAmount(revenueItem[`${p}_amount`]);
    const op = parseAmount(opProfitItem?.[`${p}_amount`] ?? '0');
    return {
      name: revenueItem[`${p}_nm`]?.replace(' 기', '기') ?? p,
      매출액: formatChartAmount(rev),
      영업이익: formatChartAmount(op),
      당기순이익: formatChartAmount(parseAmount(netIncomeItem?.[`${p}_amount`] ?? '0')),
      영업이익률: rev > 0 ? Math.round((op / rev) * 1000) / 10 : 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 40, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="left" tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="left" dataKey="매출액" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="left" dataKey="영업이익" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="left" dataKey="당기순이익" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="영업이익률" stroke="#ef4444" strokeWidth={2} dot={{ r: 5 }} name="영업이익률(%)" />
        <ReferenceLine yAxisId="right" y={0} stroke="#999" strokeDasharray="3 3" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function KeyMetricsCards({ items, fsDiv }: Props) {
  const bs = items.filter((i) => i.sj_div === 'BS' && i.fs_div === fsDiv);
  const is = items.filter((i) => i.sj_div === 'IS' && i.fs_div === fsDiv);

  const asset = parseAmount(getItem(bs, '자산총계')?.thstrm_amount ?? '0');
  const liability = parseAmount(getItem(bs, '부채총계')?.thstrm_amount ?? '0');
  const equity = parseAmount(getItem(bs, '자본총계')?.thstrm_amount ?? '0');
  const revenue = parseAmount(getItem(is, '매출액')?.thstrm_amount ?? '0');
  const opProfit = parseAmount(getItem(is, '영업이익')?.thstrm_amount ?? '0');
  const netIncome = parseAmount(getItem(is, '당기순이익(손실)')?.thstrm_amount ?? '0');

  const debtRatio = equity > 0 ? (liability / equity) * 100 : null;
  const opMargin = revenue > 0 ? (opProfit / revenue) * 100 : null;
  const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : null;
  const roe = equity > 0 ? (netIncome / equity) * 100 : null;

  const metrics = [
    { label: '자산총계', value: formatKoreanAmount(asset), color: 'blue', desc: '회사가 보유한 전체 자산' },
    { label: '부채비율', value: debtRatio !== null ? `${debtRatio.toFixed(1)}%` : '-', color: debtRatio !== null && debtRatio > 200 ? 'red' : 'green', desc: '자본 대비 부채 비율 (낮을수록 안전)' },
    { label: '매출액', value: formatKoreanAmount(revenue), color: 'indigo', desc: '최근 기간 총 매출' },
    { label: '영업이익률', value: opMargin !== null ? `${opMargin.toFixed(1)}%` : '-', color: opMargin !== null && opMargin > 0 ? 'amber' : 'red', desc: '매출 중 영업이익 비중' },
    { label: '순이익률', value: netMargin !== null ? `${netMargin.toFixed(1)}%` : '-', color: netMargin !== null && netMargin > 0 ? 'purple' : 'red', desc: '매출 중 순이익 비중' },
    { label: 'ROE', value: roe !== null ? `${roe.toFixed(1)}%` : '-', color: roe !== null && roe > 10 ? 'green' : 'gray', desc: '자기자본 대비 순이익률' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className={`border rounded-xl p-4 ${colorMap[m.color] ?? colorMap.gray}`}>
          <p className="text-xs font-medium opacity-70 mb-1">{m.label}</p>
          <p className="text-xl font-bold">{m.value}</p>
          <p className="text-xs opacity-60 mt-1">{m.desc}</p>
        </div>
      ))}
    </div>
  );
}
