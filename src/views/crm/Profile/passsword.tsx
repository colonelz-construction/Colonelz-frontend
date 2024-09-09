import classNames from 'classnames'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import {
    HiOutlineDesktopComputer,
    HiOutlineDeviceMobile,
    HiOutlineDeviceTablet,
} from 'react-icons/hi'
import dayjs from 'dayjs'
import * as Yup from 'yup'
import { EditPassword } from '@/services/CrmService'

type LoginHistory = {
    type: string
    deviceName: string
    time: number
    location: string
}

type PasswordFormModel = {
    userId: string | null
    old_password: string
    new_password: string
    confirm_new_password: string
}

const LoginHistoryIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'Desktop':
            return <HiOutlineDesktopComputer />
        case 'Mobile':
            return <HiOutlineDeviceMobile />
        case 'Tablet':
            return <HiOutlineDeviceTablet />
        default:
            return <HiOutlineDesktopComputer />
    }
}

const validationSchema = Yup.object().shape({
    old_password: Yup.string().required('Password Required'),
    new_password: Yup.string().required('Please enter your password').matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
      ),
    confirm_new_password: Yup.string().oneOf(
        [Yup.ref('new_password'), ''],
        'Password not match'
    ),
})

const Password = ({ data }: { data?: LoginHistory[] }) => {
    const onFormSubmit = async (
        values: PasswordFormModel,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        // Prepare data for the API
        const data = {
            userId: localStorage.getItem('userId'),
            old_password: values.old_password,
            new_password: values.new_password,
            confirm_new_password: values.confirm_new_password,
        };
    
        const response = await EditPassword(data);
        if (response.code===200) {
            toast.push(<Notification title={'Password updated'} type="success" />, {
                placement: 'top-center',
            });
        } else {
            toast.push(<Notification title={'Error updating password'} type="danger" />, {
                placement: 'top-center',
            });
        }
    
        setSubmitting(false);
        console.log('values', values);
    }

    return (
        <>
            <Formik
                initialValues={{
                    userId: localStorage.getItem('userId'),
                    old_password: '',
                    new_password: '',
                    confirm_new_password: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true)
                    setTimeout(() => {
                        onFormSubmit(values, setSubmitting)
                    }, 1000)
                }}
            >
                {({ touched, errors, isSubmitting, resetForm }) => {
                    const validatorProps = { touched, errors }
                    return (
                        <Form className='w-full sm:w-3/5 lg:w-2/5'>
                            <FormContainer>
                             
                            <FormItem
                            label="Current Password"
                            {...validatorProps}
                        >
                            <Field
                                type="password"
                                autoComplete="off"
                                name="old_password"
                                placeholder="Current Password"
                                component={Input}
                            />
                            {touched.old_password && errors.old_password ? (
                                <div className="error">{errors.old_password}</div>
                            ) : null}
                        </FormItem>
                        <FormItem
                            label="New Password"
                            {...validatorProps}
                        >
                            <Field
                                type="password"
                                autoComplete="off"
                                name="new_password"
                                placeholder="New Password"
                                component={Input}
                            />
                            {touched.new_password && errors.new_password ? (
                                <div className="error">{errors.new_password}</div>
                            ) : null}
                        </FormItem>
                        <FormItem
                            label="Confirm Password"
                            {...validatorProps}
                        >
                            <Field
                                type="password"
                                autoComplete="off"
                                name="confirm_new_password"
                                placeholder="Confirm Password"
                                component={Input}
                            />
                            {touched.confirm_new_password && errors.confirm_new_password ? (
                                <div className="error">{errors.confirm_new_password}</div>
                            ) : null}
                        </FormItem>
                                <div className="mt-4 ">
                                    <Button
                                        className="ltr:mr-2 rtl:ml-2"
                                        type="button"
                                        onClick={() => resetForm()}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="solid"
                                        loading={isSubmitting}
                                        type="submit"
                                    >
                                        {isSubmitting
                                            ? 'Updating'
                                            : 'Update Password'}
                                    </Button>
                                </div>
                            </FormContainer>
                        </Form>
                    )
                }}
            </Formik>
           
        </>
    )
}

export default Password
