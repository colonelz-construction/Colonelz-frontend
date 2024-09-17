import React, { ChangeEvent, useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Selector from './Selector'; // Adjust import path as necessary
import { Button, Checkbox, FormItem, Input, Notification, toast } from '@/components/ui';
import useQuery from '@/utils/hooks/useQuery';
import { apiEditRoles, apiGetRoleDetails } from '@/services/CrmService';
import { StickyFooter } from '@/components/shared';
import { useNavigate } from 'react-router-dom';
import { permissionsMap } from './CreateRole';

type Permission = 'create' | 'read' | 'update' | 'delete'| 'restore';
type AccessType = 'lead' | 'user' | 'project' | 'task' | 'contract' | 'quotation' | 'file' | 'archive' | 'mom' | 'addMember' | 'role' | 'companyData'| 'userArchive';

type AccessPermissions = Permission[];

export type FormValues = {
    [key in AccessType]: AccessPermissions;
};

const accessTypes: AccessType[] = [
    'lead', 'user', 'project', 'task', 'contract', 'quotation', 'file', 'archive', 'mom', 'addMember', 'role','companyData','userArchive'
];



const EditRoles = () => {
    const query = useQuery();
    const role = query.get('role');
    const id = query.get('id');
    const navigate = useNavigate();
    const [initialValues, setInitialValues] = useState<FormValues>(() =>
        accessTypes.reduce((acc, type) => {
            acc[type] = [];
            return acc;
        }, {} as FormValues)
    );

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                const response = await apiGetRoleDetails();
                console.log(response)
                if (response && response.data) {
                    const roleData = response.data.find((r: any) => r._id === id);
                    if (roleData && roleData.access) {
                        const newInitialValues = accessTypes.reduce((acc, type) => {
                            console.log(type)
                            acc[type] = roleData.access[type] || [];
                            return acc;
                        }, {} as FormValues);
                        console.log(newInitialValues)
                        setInitialValues(newInitialValues);
                    } else {
                        const emptyInitialValues = accessTypes.reduce((acc, type) => {
                            acc[type] = [];
                            return acc;
                        }, {} as FormValues);
                        setInitialValues(emptyInitialValues);
                    }
                }
            }
        };
        fetchData();
    }, [id]);
    const handleSelectAll = (setFieldValue: any, selectAll: boolean) => {
        if (selectAll) {
            accessTypes.forEach((type) => {
                const permissions = permissionsMap[type] || permissionsMap.default;
                setFieldValue(type, permissions);
            });
        } else {
            // Deselect all permissions
            accessTypes.forEach((type) => {
                setFieldValue(type, []);
            });
        }
    };

    const handleSubmit = async (values: FormValues) => {
        console.log('values', values);
        
        const access = Object.keys(values).reduce((acc, key) => {
            const permissions = values[key as AccessType];
            if (permissions.length > 0) {
                acc[key as AccessType] = permissions;
            }
            return acc;
        }, {} as { [key in AccessType]?: AccessPermissions });

        const payload = {
            role,
            access
        };

        const response = await apiEditRoles(payload, id);
        console.log(response);
        
        if (response.code === 200) {
            toast.push(
                <Notification type='success' duration={2000} closable>
                    {response.message}
                </Notification>
            );
        } else {
            toast.push(
                <Notification type='danger' duration={2000} closable>
                    {response.errorMessage}
                </Notification>
            );
        }
    };

   

    return (
        <div className='p-6'>
            <h3>Edit Role</h3>

        
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting,setFieldValue,values }) => {
                     const [selectAll, setSelectAll] = useState(false);
                     useEffect(() => {
                        const allSelected = accessTypes.every(type => {
                            const permissions = permissionsMap[type] || permissionsMap.default;
                            return permissions.every(permission => values[type].includes(permission));
                        });
                        setSelectAll(allSelected);
                    }, [values]);
                    return(
                        <div>
                            <div className="flex items-center gap-4">
                                <FormItem label='Role' className='w-1/3 !mb-0 mt-5'>
                                    <Input
                                        name='role'
                                        placeholder='Role'
                                        value={role || ''}
                                        disabled
                                    />
                                    
                                </FormItem>
                                <div className="mt-5">
                                <Checkbox
                                        checked={selectAll}
                                        onChange={(value: boolean, e: ChangeEvent<HTMLInputElement>) => {
                                            setSelectAll(value);
                                            handleSelectAll(setFieldValue, value);
                                        }}
                                    >
                                        Select All Permissions
                                    </Checkbox>
                                    </div>
                                    </div>

                    <Form>
                        {accessTypes.map((type) => (
                            <div
                                key={type}
                                className='grid md:grid-cols-4 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center'
                            >
                                <div className="font-semibold">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                                <div className='flex gap-2'>
                                    <Field name={type}>
                                        {({ field, form }: any) => (
                                            <Selector field={field} form={form} />
                                        )}
                                    </Field>
                                </div>
                            </div>
                        ))}
                        <StickyFooter
                            className="-mx-8 px-8 flex items-center justify-between py-4 mt-7"
                            stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                            <div className='flex gap-3'>
                                <Button
                                    variant="solid"
                                    loading={isSubmitting}
                                    type="submit"
                                    size='sm'
                                >
                                    {isSubmitting ? 'Updating' : 'Update'}
                                </Button>
                                <Button
                                    size='sm'
                                    type="button"
                                    onClick={() => navigate('/app/crm/profile')}
                                >
                                    Back
                                </Button>
                            </div>
                        </StickyFooter>
                    </Form>
                    </div>
                )}}
            </Formik>
        </div>
    );
};

export default EditRoles;