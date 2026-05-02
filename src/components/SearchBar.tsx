'use client';

import { useState, useEffect, useRef } from 'react';
import { Corp } from '@/lib/types';

interface Props {
  onSelect: (corp: Corp) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [corps, setCorps] = useState<Corp[]>([]);
  const [results, setResults] = useState<Corp[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/corps.json')
      .then((r) => r.json())
      .then((data: Corp[]) => {
        setCorps(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = corps
        .filter(
          (c) =>
            c.corp_name.toLowerCase().includes(q) ||
            c.corp_eng_name.toLowerCase().includes(q) ||
            c.stock_code.includes(q)
        )
        .slice(0, 20);
      setResults(filtered);
      setOpen(filtered.length > 0);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, corps]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (corp: Corp) => {
    setQuery(corp.corp_name);
    setOpen(false);
    onSelect(corp);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-3">
        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={loading ? '데이터 로딩 중...' : '회사명 또는 종목코드 입력 (예: 삼성전자, 005930)'}
          disabled={loading}
          className="flex-1 outline-none text-gray-800 placeholder-gray-400 bg-transparent text-base"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); }}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <ul className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto">
          {results.map((corp) => (
            <li
              key={corp.corp_code}
              onMouseDown={() => handleSelect(corp)}
              className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-800">{corp.corp_name}</p>
                <p className="text-xs text-gray-500">{corp.corp_eng_name}</p>
              </div>
              <div className="text-right">
                {corp.stock_code && (
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-mono">
                    {corp.stock_code}
                  </span>
                )}
                <p className="text-xs text-gray-400 mt-1">{corp.corp_code}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
