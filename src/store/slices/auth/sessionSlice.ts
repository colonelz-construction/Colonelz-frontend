import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import Cookies from 'js-cookie'

export interface SessionState {
    signedIn: boolean
    token: string 
    userId: string | null
    role:string | null
    orgId: string | null
}
const token=localStorage.getItem('auth');
const initialState: SessionState = {
    signedIn: false,
    token: '',
    userId:  "",
    role:'',
    orgId: '',
}

interface SignInPayload {
    token: string;
    userId: string;
    role:string
    refreshToken:string,
    orgId: string,
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
            localStorage.setItem('auth', action.payload.token);
            localStorage.setItem('userId', action.payload.userId);
            localStorage.setItem('role', action.payload.role);
            localStorage.setItem('orgId', action.payload.orgId);

},
        signOutSuccess(state) {
            state.signedIn = false;
            state.token = '';
            state.userId = null; 
            state.role='';
            localStorage.removeItem('auth');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
        },
    },
});

export const { signInSuccess, signOutSuccess } = sessionSlice.actions
export default sessionSlice.reducer
