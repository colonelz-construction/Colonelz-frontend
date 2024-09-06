import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useAuth from '@/utils/hooks/useAuth'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import { OrgainisationVerify } from '@/services/AuthService'
import { useNavigate } from 'react-router-dom'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    userData?: any
    forgotPasswordUrl?: string
    signUpUrl?: string
}

type SignInFormSchema = {
    username: string
    password: string
    email: string
    organization:string
}

const validationSchema = Yup.object().shape({
    username: Yup.string().required('Please enter your user name'),
    password: Yup.string().required('Please enter your password'),
    rememberMe: Yup.bool(),
})

const RegisterForm = (props: SignInFormProps) => {
    const {
        disableSubmit = false,
        className,
        forgotPasswordUrl = '/forgot-password',
        userData,
        // signUpUrl = '/sign-up',
    } = props

    const [message, setMessage] = useTimeOutMessage()
    const navigate = useNavigate()

    const onSignIn = async (
        values: SignInFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const { username, password,organization,email } = values
      
        setSubmitting(true)

        const result = await OrgainisationVerify(values)
        console.log('signinform', result);
        
        if (result?.code === 200) {
            setSubmitting(false)
            userData({username,organization,email,password})
            
        }

        setSubmitting(false)
    }

    return (
        <div className=''>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <>{message}</>
                </Alert>
            )}
            <Formik
                initialValues={{
                    username: '',
                    password: '',
                    email:'',
                    organization:'',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignIn(values, setSubmitting)

                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="User Name"
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="username"
                                    placeholder="User Name"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Email"
                              
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="email"
                                    placeholder="Email"
                                    component={Input}
                                />
                            </FormItem>
                          
                            <FormItem
                                label="Password"
                                invalid={
                                    (errors.password &&
                                        touched.password) as boolean
                                }
                                errorMessage={errors.password}
                            >
                                <Field
                                    autoComplete="off"
                                    name="password"
                                    placeholder="Password"
                                    component={PasswordInput}
                                />

                            </FormItem>

                            <FormItem
                                label="Organisation Name"
                               
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="organization"
                                    placeholder="Orgainisation Name"
                                    component={Input}
                                />
                            </FormItem>
                            {/* <div className="flex justify-between mb-6">
                                <Field
                                    className="mb-0"
                                    name="rememberMe"
                                    component={Checkbox}
                                >
                                    Remember Me
                                </Field>
                                <ActionLink to={forgotPasswordUrl}>
                                    Forgot Password?
                                </ActionLink>
                            </div> */}
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting ? 'Registering...' : 'Register'}
                            </Button>
                           
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default RegisterForm
