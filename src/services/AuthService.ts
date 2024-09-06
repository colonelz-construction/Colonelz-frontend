import axios from 'axios';
import ApiService from './ApiService'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    SignUpResponse,
    OtpVerify,
} from '@/@types/auth'
import Cookies from 'js-cookie';
import appConfig from '@/configs/app.config';
import { Alert, Notification, toast } from '@/components/ui';
import { ProjectResponse } from '@/views/crm/AddMemberToProject';
import { UserResponse } from '@/views/crm/AddUserToLead';

const token=localStorage.getItem('auth');   
const userId=localStorage.getItem('userId');

type Response={
    code:number;
    data:any;
    message:string;
    errorMessage:string;
}


 const { apiPrefix } = appConfig

export async function OrgainisationVerify(data:any) {
        const response = await fetch(`${apiPrefix}users/send/otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });


        const responseData = await response.json();
        console.log('Received response from server:', responseData);
        return responseData;
}
export async function orgVerifyOtp(data:any) {
        const response = await fetch(`${apiPrefix}users/verify/otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });


        const responseData = await response.json();
        console.log('Received response from server:', responseData);
        return responseData;
}
export async function registerandSignin(data:any) {
        const response = await fetch(`${apiPrefix}users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });


        const responseData = await response.json();
        console.log('Received response from server:', responseData);
        return responseData;
}

export async function QuotationApproval(data: any) {
    return ApiService.fetchData<Response>({
        url: 'users/approval/client',
        method: 'post',
        data,
    }).then((response) => {
        return response.data;
    });
}

export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchData<any>({
        url: 'users/login',
        method: 'post',
        data,
    }).then((response) => {
        return response.data;
    });
}


export async function apiAddMember(data:any) {
    return ApiService.fetchData<ProjectResponse>({
        url: 'admin/add/member',
        method: 'post',
        data,
    }).then((response) => {
        return response.data;
    });
}

export async function apiAddMemberToLead(data:any) {
    return ApiService.fetchData<UserResponse>({
        url: 'admin/add/member/lead',
        method: 'post',
        data,
    }).then((response) => {
        return response.data;
    });
}


export async function apiSignUp(data:SignUpCredential) {
    data.email=data.email.toLowerCase();
    return ApiService.fetchData<Response>({
        url: 'admin/create/user',
        method: 'post',
        data,
    }).then((response) => {
        return response.data;
    });
}

export async function apiSignOut() {
    return ApiService.fetchData({
        url: 'users/logout',
        method: 'post',
        data: { userId,token },
    }).then((response) => {
        return response.data;
    });
}


export async function apiForgotPassword(data:ForgotPassword) {
    const Data:ForgotPassword={
        email:data.email.toLowerCase(),
     }
    return ApiService.fetchData({
        url: 'users/sendotp/forget/password',
        method: 'post',
        data:Data,
    }).then((response) => {
        return response.data;
    });
}


export async function apiOtpVerify(data: OtpVerify) {
    const Data={
        email:data.email.toLowerCase(),
        otp:data.otp
    }
    return ApiService.fetchData({
        url: 'users/verifyotp/forget/password',
        method: 'post',
        data:Data,
    }).then((response) => {
        return response.data;
    });
}


export async function apiResetPassword(data: ResetPassword) {
    const Data={
        email:data.email.toLowerCase(),
        password:data.password,
        token:data.token
    }
    return ApiService.fetchData({
        url: 'users/reset/password',
        method: 'post',
        data:Data,
    }).then((response) => {
        return response.data;
    });
}
