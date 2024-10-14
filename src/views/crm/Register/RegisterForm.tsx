import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'

import Alert from '@/components/ui/Alert'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, FieldProps, Form, Formik } from 'formik'
import * as Yup from 'yup'
import useAuth from '@/utils/hooks/useAuth'
import type { CommonProps } from '@/@types/common'
import { Notification, Select, toast,Button } from '@/components/ui'
import { useRoleContext } from '../Roles/RolesContext'
import { useNavigate } from 'react-router-dom';


interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    signInUrl?: string
}

type SignUpFormSchema = {
    id: string | null
    user_name: string
    email: string
    role:string
}

const validationSchema = Yup.object().shape({
    user_name: Yup.string().required('Please enter your user name'),
    email: Yup.string()
        .email('Invalid email')
        .required('Please enter your email'),
    role:Yup.string().required('Please enter your role'),   
    
})


const   SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, signInUrl = '/sign-in' } = props
    const id=localStorage.getItem('userId')
    const orgId=localStorage.getItem('orgId')

    const { signUp } = useAuth()
    const {rolelist}=useRoleContext()
    const navigate = useNavigate();
    
    

    const [message, setMessage] = useTimeOutMessage()

    const onSignUp = async (
        values: SignUpFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const { id,user_name, role, email } = values
        
        setSubmitting(true)
        const result = await signUp({ id,user_name, role, email, org_id: orgId })
        if (result.code===200) {
            values.user_name = ''
            values.email = ''
            values.role = ''
          toast.push(
            <Notification closable type="success" duration={2000}>
                User Registered Successfully
            </Notification>,{placement:'top-center'})
        }
        else{
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    {result.errorMessage}
                </Notification>,{placement:'top-center'}
            )
        }

        setSubmitting(false)
    }
    ;

    const rolesOptions = rolelist?.map((role) => ({
        label: role,
        value: role,
    }))

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    id:id,
                    user_name: '',
                    email: '',
                    role:'',
                  
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignUp(values, setSubmitting)
                      
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({values, touched, errors, isSubmitting }) => (
                    <Form className='w-2/5'>
                     
                            <FormItem
                                label="User Name"
                                invalid={errors.user_name && touched.user_name}
                                errorMessage={errors.user_name}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="user_name"
                                    placeholder="User Name"
                                    component={Input}
                                    
                                />
                            </FormItem>
                            <FormItem
                                label="Email"
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
                                label="Role"
                                invalid={errors.role && touched.role}
                                errorMessage={errors.role}>
                                      <Field name="role">
                                    {({ field, form }: FieldProps<SignUpFormSchema>) => (
                                        <Select
                                            field={field}
                                            form={form}
                                            options={rolesOptions}
                                            value={rolesOptions?.filter(
                                                (option) =>
                                                    option.value ===
                                                    values.role
                                            )}
                                            onChange={(option) =>
                                                form.setFieldValue(
                                                    field.name,
                                                    option?.value
                                                )
                                            }
                                        />
                                    )}
                                </Field>
                                </FormItem>
                          <div className='gap-4 flex items-center'>

                          
                          
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                className='w-auto'
                                style={{width:"auto"}}

                            >
                                {isSubmitting
                                    ? 'Creating Account...'
                                    : 'Register'}
                            </Button>
                            <Button
                                        size='md'
                                        type="button"
                                        onClick={() => navigate('/app/crm/profile?type=users')}
                                    >
                                        Back
                                    </Button>

                                    </div>
                 
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignUpForm
