import { NextRequest, NextResponse } from 'next/server';
import { FinancialItem } from '@/lib/types';
import { parseAmount, formatKoreanAmount } from '@/lib/formatters';

function buildPrompt(corpName: string, items: FinancialItem[]): string {
  const bsItems = items.filter((i) => i.sj_div === 'BS' && i.fs_div === 'CFS');
  const isItems = items.filter((i) => i.sj_div === 'IS' && i.fs_div === 'CFS');

  const getAmount = (list: FinancialItem[], name: string, period: 'thstrm' | 'frmtrm' | 'bfefrmtrm') =>
    list.find((i) => i.account_nm === name)?.[`${period}_amount`] ?? '-';

  const bsAccounts = ['자산총계', '부채총계', '자본총계', '유동자산', '비유동자산', '유동부채', '비유동부채'];
  const isAccounts = ['매출액', '영업이익', '법인세차감전 순이익', '당기순이익(손실)'];

  const bsRef = bsItems[0];
  const isRef = isItems[0];

  const rows: string[] = [];

  if (bsRef) {
    rows.push(`[재무상태표] 기준: ${bsRef.thstrm_nm}(${bsRef.thstrm_dt}), ${bsRef.frmtrm_nm}, ${bsRef.bfefrmtrm_nm}`);
    for (const acc of bsAccounts) {
      const t = parseAmount(getAmount(bsItems, acc, 'thstrm'));
      const f = parseAmount(getAmount(bsItems, acc, 'frmtrm'));
      const b = parseAmount(getAmount(bsItems, acc, 'bfefrmtrm'));
      if (t !== 0) rows.push(`  ${acc}: ${formatKoreanAmount(t)} / ${formatKoreanAmount(f)} / ${formatKoreanAmount(b)}`);
    }
  }

  if (isRef) {
    rows.push(`[손익계산서] 기준: ${isRef.thstrm_nm}(${isRef.thstrm_dt}), ${isRef.frmtrm_nm}, ${isRef.bfefrmtrm_nm}`);
    for (const acc of isAccounts) {
      const t = parseAmount(getAmount(isItems, acc, 'thstrm'));
      const f = parseAmount(getAmount(isItems, acc, 'frmtrm'));
      const b = parseAmount(getAmount(isItems, acc, 'bfefrmtrm'));
      if (t !== 0) rows.push(`  ${acc}: ${formatKoreanAmount(t)} / ${formatKoreanAmount(f)} / ${formatKoreanAmount(b)}`);
    }

    const revenue = parseAmount(getAmount(isItems, '매출액', 'thstrm'));
    const operatingProfit = parseAmount(getAmount(isItems, '영업이익', 'thstrm'));
    if (revenue > 0) {
      const margin = (operatingProfit / revenue) * 100;
      rows.push(`  영업이익률(최근): ${margin.toFixed(1)}%`);
    }
  }

  return `당신은 주식 투자와 재무제표를 처음 접하는 일반인을 위한 친절한 재무 분석가입니다.
아래 ${corpName}의 최근 3개년 재무 데이터를 보고, 다음 항목을 **쉬운 한국어**로 설명해 주세요.

1. **회사 재무 건전성** – 빚이 많은지, 재정이 튼튼한지 쉽게 설명
2. **수익성 추이** – 매출과 이익이 늘고 있는지, 줄고 있는지 흐름 설명
3. **투자 포인트 3가지** – 이 회사의 강점 또는 주목할 점
4. **주의할 점** – 투자 시 유의해야 할 리스크

전문 용어는 최대한 피하고, 비유나 예시를 활용해 누구나 이해할 수 있게 작성해 주세요.
숫자는 이미 제공되어 있으므로 추가 계산 없이 인사이트 위주로 서술해 주세요.

---
${rows.join('\n')}
---`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key not configured' },
      { status: 500 }
    );
  }

  let body: { corpName: string; items: FinancialItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { corpName, items } = body;
  if (!corpName || !items?.length) {
    return NextResponse.json({ error: 'corpName and items are required' }, { status: 400 });
  }

  const prompt = buildPrompt(corpName, items);

  const models = ['gemini-2.0-flash', 'gemini-2.5-flash'];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        lastError = new Error(`Gemini ${model} error ${res.status}: ${errText}`);
        continue;
      }

      return new Response(res.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch (err) {
      lastError = err as Error;
    }
  }

  console.error('Gemini error:', lastError);
  return NextResponse.json({ error: 'Failed to call Gemini API' }, { status: 500 });
}
