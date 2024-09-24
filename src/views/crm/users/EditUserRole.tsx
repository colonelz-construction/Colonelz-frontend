import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import Upload from '@/components/ui/Upload'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import {
    HiOutlineUser,
} from 'react-icons/hi'
import * as Yup from 'yup'
import type { FormikProps, FieldInputProps, FieldProps } from 'formik'
import FormRow from '@/views/account/Settings/components/FormRow'
import { useContext, useEffect, useState } from 'react'
import { addProfilePhoto, apiEditUserRole, apiGetUsers } from '@/services/CrmService'
import { UserDetailsContext } from '@/views/Context/userdetailsContext'
import useQuery from '@/utils/hooks/useQuery'
import { useRoleContext } from '../Roles/RolesContext'

export type ProfileFormModel = {
    username: string
    email: string
    title: string
    avatar: string
}
export type ProfileUpdate = {
    userId: string
    avatar: string
    username: string
}

export type ProfileProps = {
    data?: ProfileFormModel | null
}
const validationSchema = Yup.object().shape({
    avatar: Yup.string(),
})

const EditUserRole = ({Data } : any) => {
    const {rolelist}=useRoleContext()
    
    console.log(rolelist)
    const rolesOptions = rolelist?.map((role) => ({
        label: role,
        value: role,
    }))

    console.log(rolesOptions)

    const [userData, setUserData] = useState<any>();
    console.log(userData)
    console.log(Data.userId)



 

    // const [usernameData, setUserNameData] = useState<any>(data?.username);
    // console.log(data);

    const onFormSubmit = async (
        values: any,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const formData = new FormData();

        console.log(values.role)
        formData.append('role', values.role);
        formData.append('userId', Data.userId);

    

        console.log(formData)
        try {
            const response = await apiEditUserRole(formData); 
            console.log(response)
            if(response.code===200){
            toast.push(<Notification title={'Role updated'} type="success" />, {
                
            });}
            
            window.location.reload();
            setSubmitting(false);
        }
        catch (error) {
            console.log(error)
            toast.push(<Notification  type="danger" >
                Internal Server Error
            </Notification>, {
                
            });
            setSubmitting(false);
        }
    }




    return (
        <div className="w-full">
            
      
        <Formik
            enableReinitialize
            initialValues={{
                role: Data.role,
            } as any
            }
            
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                
                setSubmitting(true)
                setTimeout(() => {
                    onFormSubmit(values, setSubmitting)
                }, 1000)
            }}
        >
            {({ values, touched, errors, isSubmitting, resetForm }) => {
                const validatorProps = { touched, errors }
                return (
                    <Form className=''>
                    <h3 className=' my-3'>Edit User Role</h3>
                        <FormContainer>                             
                           
                            <FormItem
                                label="Username"
                            >
                                <Input placeholder={`${Data.username}`} disabled/>
                            </FormItem>
                            <FormItem
                                label="Email"
                            >
                                <Input placeholder={`${Data.email}`} disabled/>
                            </FormItem>
                            <FormItem
                                label="Role"
                                // invalid={errors.role && touched.role}
                                // errorMessage={errors.role}
                                >
                                      <Field name="role">
                                    {({ field, form }: any) => (
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
                                            {
                                                console.log(option)
                                                form.setFieldValue(
                                                    field.name,
                                                    option?.value
                                                )

                                            }
                                                
                                            }
                                        />
                                    )}
                                </Field>
                                </FormItem>
                            
                           
                           
                           

                            <div className="mt-4 ">
                               
                                <Button
                                    variant="solid"
                                    loading={isSubmitting}
                                    type="submit"
                                    block
                                >
                                    {isSubmitting ? 'Updating' : 'Update'}
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )
            }}
        </Formik>
        </div>
    )
}

export default EditUserRole