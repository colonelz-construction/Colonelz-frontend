// data.ts

export interface MainQuotationItem {
  qutation_id: string;
  type: string;
  total_price: number;
}

export interface MainQuotationData {
  message: string;
  status: boolean;
  errorMessage: string;
  code: number;
  data: {
    main_quotation: MainQuotationItem[];
    total_price: number;
  };
}


