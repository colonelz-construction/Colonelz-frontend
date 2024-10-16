import { useState } from 'react'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import ActionLink from '@/components/shared/ActionLink'
import { apiForgotPassword, apiOtpVerify } from '@/services/AuthService'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import type { AxiosError } from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { Notification, toast } from '@/components/ui'

interface ForgotPasswordFormProps extends CommonProps {
    disableSubmit?: boolean
    resetPassword?: string
}

type OtpVerifyFormSchema = {
    email: string | null
    otp: string
}

const validationSchema = Yup.object().shape({
    email: Yup.string().required('Please enter your email'),
})

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const { disableSubmit = false, className, resetPassword = '/reset-passowrd' } = props
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const email = queryParams.get('email')
    const [message, setMessage] = useTimeOutMessage()
    const navigate = useNavigate()
    const onSendMail = async (
        values: OtpVerifyFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        setSubmitting(true)
            const resp:any = await apiOtpVerify(values)
            
            
            if (resp.code === 200) {
                setSubmitting(false)
                Cookies.set('auth', resp.data.token)
                navigate('/reset-password?email='+values.email)
            }
            else{
                setSubmitting(false)    
                toast.push(
                    <Notification closable type='danger' duration={2000}> {resp.errorMessage}</Notification>
                    )
            }
        
    }

    const initValues : OtpVerifyFormSchema = {

        email: email,
        otp:''

    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={initValues}
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
                                    invalid={errors.email && touched.email}
                                    errorMessage={errors.email}
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
