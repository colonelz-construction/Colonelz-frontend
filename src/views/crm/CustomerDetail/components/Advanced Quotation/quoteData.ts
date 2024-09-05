// Assuming 'Person' type structure
// data.ts

export interface QuotationItem {
    item_id: string;
    item: string;
    description: string;
    unit: string;
    quantity: string;
    rate: string;
    discount: string;
    offer_price: string;
    total_price: string;
    files: string[];
    remark: string;
    client_notes: string;
  }
  
  export interface Quotation {
    project_id: string;
    quotation_id: string;
    type: string;
    items: QuotationItem[];
  }
  
  export interface QuotationData {
    message: string;
    status: boolean;
    errorMessage: string;
    code: number;
    data: {
      quotation: Quotation[];
      total_price: number;
    };
  }
  
  export const data10: QuotationData = {
    message: "Quotation data found",
    status: true,
    errorMessage: "",
    code: 200,
    data: {
      quotation: [
        {
            project_id: "COLP-865017",
            quotation_id: "CCPL/536831",
            type: "civip",
            items: [
                {
                    item_id: "ITM/415194",
                    item: "fan",
                    description: "hello",
                    unit: "abcd",
                    quantity: "50",
                    rate: "100",
                    discount: "10%",
                    offer_price: "500",
                    total_price: "4500",
                    files: [],
                    remark: "sadfgh",
                    client_notes: "sadzfxcgh"
                }
            ]
        }
      ],
      total_price: 180000,
    },
  };


  
  