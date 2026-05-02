export interface Corp {
  corp_code: string;
  corp_name: string;
  corp_eng_name: string;
  stock_code: string;
}

export interface FinancialItem {
  rcept_no: string;
  reprt_code: string;
  bsns_year: string;
  corp_code: string;
  stock_code: string;
  fs_div: 'CFS' | 'OFS';
  fs_nm: string;
  sj_div: 'BS' | 'IS' | 'SCF' | 'AOCI';
  sj_nm: string;
  account_nm: string;
  thstrm_nm: string;
  thstrm_dt: string;
  thstrm_amount: string;
  frmtrm_nm: string;
  frmtrm_dt: string;
  frmtrm_amount: string;
  bfefrmtrm_nm: string;
  bfefrmtrm_dt: string;
  bfefrmtrm_amount: string;
  ord: string;
  currency: string;
}

export interface OpenDartResponse {
  status: string;
  message: string;
  list?: FinancialItem[];
}

export type ReportCode = '11011' | '11012' | '11013' | '11014';
export type FsDiv = 'CFS' | 'OFS';

export const REPORT_CODE_LABELS: Record<ReportCode, string> = {
  '11011': '사업보고서 (연간)',
  '11012': '반기보고서',
  '11013': '1분기보고서',
  '11014': '3분기보고서',
};
