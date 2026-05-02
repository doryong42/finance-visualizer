'use client';

import { useState } from 'react';
import { FinancialItem } from '@/lib/types';

interface Props {
  corpName: string;
  items: FinancialItem[];
}

export default function AIAnalysis({ corpName, items }: Props) {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis('');
    setError('');
    setDone(false);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corpName, items }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
        setError(errData.error || `오류가 발생했습니다 (${res.status})`);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setError('스트림을 읽을 수 없습니다.'); return; }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (text) setAnalysis((prev) => prev + text);
          } catch {
            // skip malformed SSE lines
          }
        }
      }
      setDone(true);
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-gray-800 mt-4 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-gray-900 mt-5 mb-2">{line.slice(3)}</h2>;
        if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-gray-900 mt-5 mb-2">{line.slice(2)}</h1>;
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-gray-800 mt-3">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={i} className="ml-4 text-gray-700 list-disc">{line.slice(2)}</li>;
        }
        if (line.trim() === '') return <br key={i} />;
        // inline bold
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-gray-700 leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        );
      });
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">AI 재무 분석</h3>
          <p className="text-xs text-gray-500">Gemini가 쉽게 설명해 드립니다</p>
        </div>
      </div>

      {!analysis && !loading && !error && (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4 text-sm">
            복잡한 재무 데이터를 누구나 이해할 수 있는 언어로 분석해 드립니다.
          </p>
          <button
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 분석 시작
          </button>
        </div>
      )}

      {loading && !analysis && (
        <div className="flex items-center gap-3 py-6 justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-violet-600 text-sm font-medium">AI가 분석 중입니다...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          <p className="font-semibold mb-1">오류 발생</p>
          <p>{error}</p>
          <button
            onClick={handleAnalyze}
            className="mt-3 text-red-600 underline text-xs hover:no-underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {analysis && (
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="prose prose-sm max-w-none">
            {renderMarkdown(analysis)}
          </div>
          {loading && (
            <span className="inline-block w-1 h-4 bg-violet-500 animate-pulse ml-0.5 align-text-bottom" />
          )}
          {done && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Gemini AI 분석 완료 · 투자 참고용으로만 활용하세요</p>
              <button
                onClick={handleAnalyze}
                className="text-xs text-violet-600 hover:text-violet-800 underline"
              >
                재분석
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
