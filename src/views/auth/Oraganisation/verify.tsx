import { useState } from 'react'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import ActionLink from '@/components/shared/ActionLink'
import { apiForgotPassword, apiOtpVerify, orgVerifyOtp, registerandSignin } from '@/services/AuthService'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import type { AxiosError } from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { Notification, toast } from '@/components/ui'
import { signInSuccess, useAppDispatch } from '@/store'

interface ForgotPasswordFormProps extends CommonProps {
    disableSubmit?: boolean
    resetPassword?: string
    userData?: any
}

type OtpVerifyFormSchema = {
    email: string | null
    otp: string
    userData?: any
}

const validationSchema = Yup.object().shape({
    email: Yup.string().required('Please enter your email'),
})

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const { disableSubmit = false, className, resetPassword = '/reset-passowrd',userData} = props
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const email = queryParams.get('email')
    const [message, setMessage] = useTimeOutMessage()
    const navigate = useNavigate()
    const dispatch=useAppDispatch()
    const onSendMail = async (
        values: OtpVerifyFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        setSubmitting(true)
            const resp = await orgVerifyOtp(values)
            
            
            if (resp.code === 200) {
                setSubmitting(false)
                Cookies.set('auth', resp.data.token)
                const resposne=await registerandSignin(userData)
                if(resposne.code===200){
                    dispatch(signInSuccess({ token:resposne.data.token, userId: resposne.data.userId,role:resp.data.role }))
                    navigate('/app/crm/dashboard')
                localStorage.setItem('userId',resposne.data.id)  
                localStorage.setItem('auth',resposne.data.token)  
                localStorage.setItem('role',resposne.data.role)  
                window.location.href = '/app/crm/dashboard'
            }
            else{
                toast.push(
                    <Notification closable type='danger' duration={2000}> {resposne.errorMessage}</Notification>
                    )}
            }
            else{
                setSubmitting(false)    
                toast.push(
                    <Notification closable type='danger' duration={2000}> {resp.errorMessage}</Notification>
                    )
            }
        
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    email: userData.email,
                    otp:''
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSendMail(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <div className='' >
                                <FormItem
                                   
                                >
                                    <Field
                                        type="email"
                                        autoComplete="off"
                                        name="email"
                                        placeholder="Email"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    invalid={errors.otp && touched.otp}
                                    errorMessage={errors.otp}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="otp"
                                        placeholder="Otp"
                                        component={Input}
                                    />
                                </FormItem>
                            </div>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                Verify
                            </Button>
                           
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default ForgotPasswordForm
