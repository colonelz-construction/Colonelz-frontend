import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const authRoute: Routes = [
    {
        key: 'signIn',
        path: `/sign-in`,
        component: lazy(() => import('@/views/auth/SignIn')),
        authority: [],
    },
 
   
    {
        key: 'forgotPassword',
        path: `/forgot-password`,
        component: lazy(() => import('@/views/auth/ForgotPassword')),
        authority: [],
    },
    {
        key: 'otpVerify',
        path: `/otp-verify`,
        component: lazy(() => import('@/views/auth/OtpVerify')),
        authority: [],
    },
    {
        key: 'resetPassword',
        path: `/reset-password`,
        component: lazy(() => import('@/views/auth/ResetPassword')),
        authority: [],
    },
    {
        key: 'Organization',
        path: `/register`,
        component: lazy(() => import('@/views/auth/Oraganisation')),
        authority: [],
    },
    {
        key: 'publicView',
        path: `/publicView`,
        component: lazy(() => import('@/views/auth/publicView')),
        authority: [],
    }
  
   
]

export default authRoute
