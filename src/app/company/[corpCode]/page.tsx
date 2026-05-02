'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import YearSelector from '@/components/YearSelector';
import { BalanceSheetChart, IncomeStatementChart, KeyMetricsCards } from '@/components/FinancialCharts';
import AIAnalysis from '@/components/AIAnalysis';
import { FinancialItem, OpenDartResponse, ReportCode } from '@/lib/types';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className ?? ''}`} />;
}

export default function CompanyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const corpCode = params.corpCode as string;
  const corpName = searchParams.get('name') ?? corpCode;
  const stockCode = searchParams.get('stock') ?? '';

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear - 1));
  const [reportCode, setReportCode] = useState<ReportCode>('11011');
  const [fsDiv, setFsDiv] = useState<'CFS' | 'OFS'>('CFS');

  const [items, setItems] = useState<FinancialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    setItems([]);
    setStatus('');

    try {
      const res = await fetch(
        `/api/financial?corp_code=${corpCode}&bsns_year=${year}&reprt_code=${reportCode}`
      );
      const data: OpenDartResponse = await res.json();

      if (data.status !== '000') {
        if (data.status === '013') {
          setStatus('해당 기간에 공시된 데이터가 없습니다. 다른 연도나 보고서 유형을 선택해 보세요.');
        } else {
          setError(`데이터 조회 실패: ${data.message} (코드: ${data.status})`);
        }
        return;
      }

      setItems(data.list ?? []);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [corpCode, year, reportCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = items.filter((i) => i.fs_div === fsDiv);
  const hasCFS = items.some((i) => i.fs_div === 'CFS');
  const hasOFS = items.some((i) => i.fs_div === 'OFS');
  const availableFsDiv = hasCFS ? 'CFS' : hasOFS ? 'OFS' : fsDiv;

  useEffect(() => {
    if (items.length > 0 && !items.some((i) => i.fs_div === fsDiv)) {
      setFsDiv(availableFsDiv);
    }
  }, [items, fsDiv, availableFsDiv]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900 truncate">{corpName}</h1>
              {stockCode && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-mono shrink-0">
                  {stockCode}
                </span>
              )}
              <span className="text-gray-400 text-xs font-mono shrink-0">{corpCode}</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium shrink-0"
          >
            다른 기업 검색
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <YearSelector
            year={year}
            reportCode={reportCode}
            fsDiv={fsDiv}
            onYearChange={setYear}
            onReportCodeChange={setReportCode}
            onFsDivChange={setFsDiv}
          />
          {items.length > 0 && (
            <div className="mt-3 flex gap-2 text-xs text-gray-500">
              {hasCFS && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">연결재무제표 있음</span>}
              {hasOFS && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">별도재무제표 있음</span>}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
            <p className="font-semibold">오류</p>
            <p>{error}</p>
          </div>
        )}

        {/* No Data */}
        {!loading && !error && status && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-700 font-medium">{status}</p>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <Skeleton className="h-5 w-24 mb-4" />
                  <Skeleton className="h-64" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data */}
        {!loading && filteredItems.length > 0 && (
          <>
            {/* Key Metrics */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-500 rounded-full" />
                핵심 지표
                <span className="text-xs font-normal text-gray-400 ml-1">최근 기준</span>
              </h2>
              <KeyMetricsCards items={filteredItems} fsDiv={fsDiv} />
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded-full" />
                  재무상태표
                </h2>
                <p className="text-xs text-gray-400 mb-4">자산·부채·자본 (단위: 조원)</p>
                <BalanceSheetChart items={filteredItems} fsDiv={fsDiv} />
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <span className="w-1 h-5 bg-indigo-500 rounded-full" />
                  손익계산서
                </h2>
                <p className="text-xs text-gray-400 mb-4">매출·이익 추이 (단위: 조원) / 영업이익률 (%)</p>
                <IncomeStatementChart items={filteredItems} fsDiv={fsDiv} />
              </div>
            </div>

            {/* Detail Table */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm overflow-x-auto">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-green-500 rounded-full" />
                주요 계정 상세
              </h2>
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium w-24">구분</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">계정명</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      {filteredItems[0]?.bfefrmtrm_nm ?? '전전기'}
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      {filteredItems[0]?.frmtrm_nm ?? '전기'}
                    </th>
                    <th className="text-right py-2 px-3 text-gray-700 font-semibold">
                      {filteredItems[0]?.thstrm_nm ?? '당기'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems
                    .filter((item) => {
                      const key = ['자산총계', '부채총계', '자본총계', '유동자산', '비유동자산', '유동부채', '비유동부채', '매출액', '영업이익', '당기순이익(손실)', '법인세차감전 순이익'];
                      return key.includes(item.account_nm);
                    })
                    .sort((a, b) => Number(a.ord) - Number(b.ord))
                    .map((item, idx) => (
                      <tr key={`${item.account_nm}-${item.sj_div}-${idx}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${item.sj_div === 'BS' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {item.sj_nm}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-700 font-medium">{item.account_nm}</td>
                        <td className="py-2 px-3 text-right text-gray-500 font-mono text-xs">
                          {item.bfefrmtrm_amount ? Number(item.bfefrmtrm_amount.replace(/,/g, '')).toLocaleString('ko-KR') : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-500 font-mono text-xs">
                          {item.frmtrm_amount ? Number(item.frmtrm_amount.replace(/,/g, '')).toLocaleString('ko-KR') : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-800 font-semibold font-mono text-xs">
                          {item.thstrm_amount ? Number(item.thstrm_amount.replace(/,/g, '')).toLocaleString('ko-KR') : '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* AI Analysis */}
            <AIAnalysis corpName={corpName} items={filteredItems} />
          </>
        )}
      </div>

      <footer className="text-center text-gray-400 text-xs py-8 border-t border-gray-200 mt-8">
        <p>데이터 출처: 금융감독원 전자공시시스템 (OpenDART) · AI 분석은 투자 참고용이며 투자 권유가 아닙니다</p>
      </footer>
    </div>
  );
}
