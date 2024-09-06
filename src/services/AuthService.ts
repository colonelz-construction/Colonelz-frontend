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

const token=localStorage.getItem('auth');   
const userId=localStorage.getItem('userId');


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
    return ApiService.fetchData({
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


export async function apiAddMember(data:any,token:string | null) {
    return ApiService.fetchData({
        url: 'admin/add/member',
        method: 'post',
        data,
    }).then((response) => {
        return response.data;
    });
}
export async function apiAddMemberToLead(data:any,token:string | null) {
    
    
        const response = await fetch(`${apiPrefix}admin/add/member/lead`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

       
        return response;
}
export async function apiSignUp(data: SignUpCredential,token:string) {
   data.email=data.email.toLowerCase();
    const response = await fetch(`${apiPrefix}admin/create/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        
        return responseData;
}

export async function apiSignOut() {
     const token=localStorage.getItem('auth');
     const userId=localStorage.getItem('userId');
        const response = await fetch(`${apiPrefix}users/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Add the token to the Authorization header
            },
            body: JSON.stringify({ userId,token })
        });
        const responseData = await response.json();
        console.log('Received response from server:', responseData);
        
        return responseData;
}

export async function apiForgotPassword(data: ForgotPassword) {
     const Data:ForgotPassword={
        email:data.email.toLowerCase(),
     }
        const response = await fetch(`${apiPrefix}users/sendotp/forget/password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Data)
        });        
        return response.json();
}
export async function apiOtpVerify(data: OtpVerify) {
    const Data={
        email:data.email.toLowerCase(),
        otp:data.otp
    }
        const response = await fetch(`${apiPrefix}users/verifyotp/forget/password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Data)
        });
        const responseData = await response.json();
        return responseData;
    
}

export async function apiResetPassword(data: ResetPassword) {
    const Data={
        email:data.email.toLowerCase(),
        password:data.password,
        token:data.token
    }
      
    try {
        const response = await fetch(`${apiPrefix}users/reset/password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Data)
        });

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error sending request to server:', error);
        throw error;
    }
}
