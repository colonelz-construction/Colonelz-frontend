import { useEffect, useState } from 'react'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { QuotationApproval, apiForgotPassword } from '@/services/AuthService'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import Simple from '@/components/layouts/AuthLayout/Simple'
import { useLocation } from 'react-router-dom'
import { Notification, toast } from '@/components/ui'
import Thank from './thank'
interface QuotationApproval extends CommonProps {
    disableSubmit?: boolean
    signInUrl?: string
}

type QuotationApprovalFormSchema = {
    file_id:string| null
    project_id:string | null
    status:string
    org_id: string | null
    remark:string
}

const validationSchema = Yup.object().shape({
    email: Yup.string().required('Please enter your email'),
})

const ClientApproval = (props: QuotationApproval) => {
    const { disableSubmit = false, className } = props
    const [status, setStatus] = useState('')

    const [emailSent, setEmailSent] = useState(false)
    const location=useLocation()
    const queryParams = new URLSearchParams(location.search);
    const project_id=queryParams.get('project_id')
    const org_id=queryParams.get('org_id')
    const file_id=queryParams.get('file_id')
    const [message, setMessage] = useState(false)
    const onSendMail = async (
        values: QuotationApprovalFormSchema,
        setSubmitting: (isSubmitting: boolean) => void,
        status: string
    ) => {
       
        
        try {
            values.status=status
            setStatus(status)
            const resp = await QuotationApproval(values )
            
            if (resp.code===200) {
                setSubmitting(false)
                setMessage(true)
                toast.push(
                    <Notification type='success' duration={2000}>
                            {resp.message}
                    </Notification>
                )
                
            }
            else{
                toast.push(
                    <Notification type='danger' duration={2000}>
                            {resp.errorMessage}
                    </Notification>
                )
            }
        } catch (errors) {
            toast.push(
                <Notification type='danger' duration={2000}>
                        Internal server error
                </Notification>
            )
        }
    }

    return (
        <Simple className='w-1/2'>
        {!message?<><div className={className}>
        <h3 className="mb-4">Quotation Approval</h3>
            
            <Formik
                initialValues={{
                    file_id:file_id,
                    project_id:project_id,
                    org_id,
                    status:'',
                    remark:''
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        // onSendMail(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                            {({ touched, errors, isSubmitting, values, setSubmitting,setFieldValue }) => (
                <Form>
                    <FormContainer>
                        <div className={emailSent ? 'hidden' : ''}>
                            <FormItem
                               label='Remarks'
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="remark"
                                    placeholder="Remarks"
                                    
                                >
                                    {({ field, form }:any) => (
                                        <Input
                                        textArea
                                            {...field}
                                            error={touched.remark && errors.remark}
                                            placeholder="Remarks"
                                        />
                                    )}
                                </Field>
                            </FormItem>
                        </div>
                        <div className='grid grid-cols-3 gap-3'>
                        <Button
                            block
                            loading={isSubmitting}
                            variant="solid"
                            type="button"
                            
                            onClick={() => {
                               
                                onSendMail(values, setSubmitting, 'approved')}}
                        >
                            Accept
                        </Button>
                        
                        <Button
                            block
                            loading={isSubmitting}
                            variant="solid"
                            type="button"
                            onClick={() => {
                            
                                onSendMail(values, setSubmitting, 'amended');
                            }}
                        >
                            Amend
                        </Button>

                        <Button
                            block
                            loading={isSubmitting}
                            variant="solid"
                            type="button"
                            onClick={() => {
                                
                                onSendMail(values, setSubmitting, 'rejected');
                            }}
                        >
                            Reject
                        </Button>
                        </div>
                    </FormContainer>
                </Form>
            )}
                </Formik>
        </div></>:
        <>
        {status==='approved'?
       <Thank data={"Thank you for accepting the Contract. Welcome onboard, we're excited to begin this journey with you."}/>:status==='amended'?
    <Thank data={'Thank you for your feedback. Please allow us some time to get back to you.'}/>:<Thank data={'Thank you for your feedback. Please share with us your concerns; we would like to address them on priority.'}/>}

        </>}
        </Simple>
    )
}

export default ClientApproval
