'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { Corp } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<Corp[]>([]);

  const handleSelect = (corp: Corp) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((c) => c.corp_code !== corp.corp_code);
      return [corp, ...filtered].slice(0, 5);
    });
    router.push(`/company/${corp.corp_code}?name=${encodeURIComponent(corp.corp_name)}&stock=${corp.stock_code}`);
  };

  const popularCompanies: Corp[] = [
    { corp_code: '00126380', corp_name: '삼성전자', corp_eng_name: 'SAMSUNG ELECTRONICS', stock_code: '005930' },
    { corp_code: '00164779', corp_name: 'SK하이닉스', corp_eng_name: 'SK Hynix', stock_code: '000660' },
    { corp_code: '00401731', corp_name: 'NAVER', corp_eng_name: 'NAVER Corporation', stock_code: '035420' },
    { corp_code: '00293886', corp_name: '카카오', corp_eng_name: 'Kakao Corp.', stock_code: '035720' },
    { corp_code: '00155608', corp_name: 'LG에너지솔루션', corp_eng_name: 'LG Energy Solution', stock_code: '373220' },
    { corp_code: '00164742', corp_name: 'LG전자', corp_eng_name: 'LG Electronics', stock_code: '066570' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            OpenDART 실시간 데이터 연동
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            누구나 쉽게 이해하는<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              재무 데이터 분석
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            회사명을 검색하면 3개년 재무제표를 차트로 보여드리고,
            AI가 쉬운 말로 설명해 드립니다.
          </p>

          <SearchBar onSelect={handleSelect} />

          <p className="text-gray-500 text-sm mt-4">
            3,864개 상장 기업 · 연결/별도 재무제표 지원
          </p>
        </div>
      </div>

      {/* Popular Companies */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <h2 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">인기 기업</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {popularCompanies.map((corp) => (
            <button
              key={corp.corp_code}
              onClick={() => handleSelect(corp)}
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-left transition-all group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-sm">
                {corp.corp_name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate group-hover:text-blue-300 transition-colors">
                  {corp.corp_name}
                </p>
                {corp.stock_code && (
                  <p className="text-gray-500 text-xs font-mono">{corp.stock_code}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <h2 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">최근 검색</h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((corp) => (
              <button
                key={corp.corp_code}
                onClick={() => handleSelect(corp)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm px-3 py-1.5 rounded-lg transition-all"
              >
                <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {corp.corp_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: '🔍',
              title: '빠른 검색',
              desc: '3,864개 상장기업을 회사명이나 종목코드로 즉시 검색',
            },
            {
              icon: '📊',
              title: '시각화 차트',
              desc: '재무상태표·손익계산서를 3개년 비교 차트로 한눈에',
            },
            {
              icon: '🤖',
              title: 'AI 해설',
              desc: 'Gemini AI가 복잡한 재무 데이터를 쉬운 말로 설명',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="text-white font-semibold mb-1">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
