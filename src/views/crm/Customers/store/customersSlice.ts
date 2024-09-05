import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
   
} from '@/services/CrmService'
import type { TableQueries } from '@/@types/common'






export type Client={
    client_name:string
    client_email:string
    client_contact:string
}
export type Project = {
    id: string;
  project_name: string;
  client: Client[];
  project_id: string;
  project_type: string;
  client_name: string;
  description: string;
  files: Array<string>;
  mom: Array<string>;
  leadmanager: string;
  designers: Array<string>;
  superviser: string;
  visualizer: string;
  project_status: string;
  project_start_date: string; 
  timeline_date: string;
  project_end_date: string;
  project_budget: string;
  project_location: string;
  createdAt: string;
  __v: number;
}

type Statistic = {
    value: number
    growShrink: number
}

type CustomerStatistic = {
    totalCustomers: Statistic
    activeCustomers: Statistic
    newCustomers: Statistic
}

type Filter = {
    status: string
}

type GetCrmCustomersResponse = {
    data: Project[]
    total: number
}

type GetCrmCustomersStatisticResponse = CustomerStatistic

export type CustomersState = {
    loading: boolean
    statisticLoading: boolean
    customerList: Project[]
    statisticData: Partial<CustomerStatistic>
    tableData: TableQueries
    filterData: Filter
    drawerOpen: boolean
    selectedCustomer: Partial<Project>
}

export const SLICE_NAME = 'crmCustomers'





export const initialTableData: TableQueries = {
    total: 0,
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: {
        order: '',
        key: '',
    },
}

export const initialFilterData = {
    status: '',
}

const initialState: CustomersState = {
    loading: false,
    statisticLoading: false,
    customerList: [],
    statisticData: {},
    tableData: initialTableData,
    filterData: initialFilterData,
    drawerOpen: false,
    selectedCustomer: {},
}

const customersSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setTableData: (state, action) => {
            state.tableData = action.payload
        },
        setCustomerList: (state, action) => {
            state.customerList = action.payload
        },
        setFilterData: (state, action) => {
            state.filterData = action.payload
        },
        setSelectedCustomer: (state, action) => {
            state.selectedCustomer = action.payload
        },
        setDrawerOpen: (state) => {
            state.drawerOpen = true
        },
        setDrawerClose: (state) => {
            state.drawerOpen = false
        },
    },
   
})

export const {
    setTableData,
    setCustomerList,
    setFilterData,
    setSelectedCustomer,
    setDrawerOpen,
    setDrawerClose,
} = customersSlice.actions

export default customersSlice.reducer
