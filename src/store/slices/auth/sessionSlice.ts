import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import Cookies from 'js-cookie'

export interface SessionState {
    signedIn: boolean
    token: string 
    userId: string | null
    role:string | null
    refreshToken:string | null 
}
const token=localStorage.getItem('auth');
const initialState: SessionState = {
    signedIn: false,
    token: '',
    userId:  "",
    role:'',
    refreshToken:''
}

interface SignInPayload {
    token: string;
    userId: string;
    role:string
    refreshToken:string
}

const sessionSlice = createSlice({
    name: `${SLICE_BASE_NAME}/session`,
    initialState,
    reducers: {
        signInSuccess(state, action: PayloadAction<SignInPayload>) {
            state.signedIn = true;
            state.token = action.payload.token;
            state.userId = action.payload.userId; 
            state.role=action.payload.role;
            state.refreshToken=action.payload.refreshToken;
            localStorage.setItem('auth', action.payload.token);
            localStorage.setItem('userId', action.payload.userId);
            localStorage.setItem('role', action.payload.role);
},
        signOutSuccess(state) {
            state.signedIn = false;
            state.token = '';
            state.userId = null; 
            state.role='';
            state.refreshToken='';
            localStorage.removeItem('auth');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
        },
    },
});

export const { signInSuccess, signOutSuccess } = sessionSlice.actions
export default sessionSlice.reducer
