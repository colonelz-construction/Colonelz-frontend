export type Attendees = {
  client_name: string[] | null;
  organisor: string[];
  designer: string[];
  attendees: string[];
};

export type MomData = {
  mom_id: string;
  meetingdate: string;
  client_name:string;
  location: string;
  attendees: Attendees;
  remark: string;
  important_note: string;
  files: any[]; // Add a proper type for files if needed
};
export type Data={
  client_name:string;
  mom_data:MomData[]
}
export type ApiResponse = {
  message: string;
  status: boolean;
  errorMessage: string;
  code: number;
  data:Data;
  subrow:ApiResponse[]
};




