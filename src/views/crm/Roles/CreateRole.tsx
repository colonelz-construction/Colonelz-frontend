import React, { ChangeEvent, useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Selector from './Selector'; // Adjust import path as necessary
import { Button, FormItem, Input, Notification, toast, Checkbox } from '@/components/ui'; // Add Checkbox component
import useQuery from '@/utils/hooks/useQuery';
import { apiCreateRole, apiEditRoles, apiGetRoleDetails } from '@/services/CrmService';
import { useNavigate } from 'react-router-dom';
import { StickyFooter } from '@/components/shared';

type Permission = 'create' | 'read' | 'update' | 'delete' | 'restore';
type AccessType = 'lead' | 'user' | 'project' | 'task' | 'contract' | 'quotation' | 'file' | 'archive' | 'mom' | 'addMember' | 'role' | 'companyData' | 'userArchive';

type AccessPermissions = Permission[];

type FormValues = {
    [key in AccessType]: AccessPermissions;
};

const accessTypes: AccessType[] = [
    'lead', 'user', 'project', 'task', 'contract', 'quotation', 'file', 'archive', 'mom', 'addMember', 'role', 'companyData', 'userArchive'
];

export const permissionsMap: { [key: string]: Permission[] } = {
    default: ['create', 'read', 'update', 'delete'],
    task: ['create', 'read', 'update', 'delete'],
    role: ['create', 'read', 'update', 'delete'],
    file: ['create', 'read', 'delete'],
    archive: ['read', 'restore', 'delete'],
    addMember: ['create'],
    lead: ['create', 'read', 'update'],
    project: ['create', 'read', 'update'],
    mom: ['create', 'read', 'delete', 'update'],
    contract: ['create', 'read', 'update'],
    quotation: ['read', 'update'],
    user: ['create', 'read', 'update', 'delete'],
    userArchive: ['read', 'restore', 'delete'],
    companyData: ['read']
};

const validationSchema = Yup.object().shape(
    accessTypes.reduce((acc, type) => {
        acc[type] = Yup.array().of(Yup.string().oneOf(['create', 'read', 'update', 'delete', 'restore']));
        return acc;
    }, {} as any)
);

export const obj: Record<AccessType, boolean> = {
    // default: false,
    task: false,
    file: false,
    archive: false,
    addMember: false,
    lead: false,
    project: false,
    mom: false,
    contract: false,
    quotation: false,
    role: false,
    user: false,
    userArchive: false,
    companyData: false
    
}

const EditRoles = () => {
    const query = useQuery();
    const id = query.get('id');
    const [role, setRole] = useState<string | null>(null);
    const navigate = useNavigate();
    const [initialValues, setInitialValues] = useState<FormValues>(() =>
        accessTypes.reduce((acc, type) => {
            acc[type] = [];
            return acc;
        }, {} as FormValues)
    );

    

    const [checkType, setCheckType] = useState(obj);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRole(e.target.value);
    };

    const [selectAll, setSelectAll] = useState(false);



    const handleSelectAll = (setFieldValue: any, value: boolean) => {
        setSelectAll(value);

        if (value) {
            Object.keys(checkType).forEach((key) => {
                checkType[key as AccessType] = true;
              });

              setCheckType(checkType)
            accessTypes.forEach((type) => {
                const permissions = permissionsMap[type] || permissionsMap.default;
                setFieldValue(type, permissions);
            });
        } else {
            Object.keys(checkType).forEach((key) => {
                checkType[key as AccessType] = false;
              });
              setCheckType(checkType)
            // Deselect all permissions
            accessTypes.forEach((type) => {
                setFieldValue(type, []);
            });
        }
    };

    const handleSelectType = (setFieldValue: any, type: AccessType, value: boolean, selectAll:boolean) => {
        // console.log(type)
        // console.log("type", checkType[type])
        // console.log("selectall", selectAll)
        // console.log("value", value)

            if (!checkType[type]) {
                setCheckType({...checkType, [type]: true})              
                const permissions = permissionsMap[type] || permissionsMap.default;
                console.log(permissions)
                setFieldValue(type, permissions);
             
            } else {
                setCheckType({...checkType, [type]: false})
                setFieldValue(type, []);
            }
    };

    return (
        <div className='p-6'>
            <h3>Create Role</h3>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                enableReinitialize
                onSubmit={async (values, { setSubmitting }) => {
                    console.log(values);

                    setSubmitting(true);
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

                    const response = await apiCreateRole(payload);
                    setSubmitting(false);

                    if (response.code === 200) {
                        toast.push(
                            <Notification type='success' duration={2000} closable>
                                {response.message}
                            </Notification>
                        );
                        setTimeout(() => {
                            navigate('/app/crm/profile');
                            window.location.reload();
                        }, 2000);
                    } else {
                        toast.push(
                            <Notification type='danger' duration={2000} closable>
                                {response.errorMessage}
                            </Notification>
                        );
                    }
                }}
            >
                {({ isSubmitting, setFieldValue, values }) => {
                    
                    // useEffect(() => {
                    //     const allSelected = accessTypes.every(type => {
                    //         const permissions = permissionsMap[type] || permissionsMap.default;
                    //         return permissions.every(permission => values[type].includes(permission));
                    //     });
                    //     setSelectAll(allSelected);
                    // }, [values]);

                    useEffect(() => {
                        let flag = Object.values(checkType).every(value => value === true);
                        console.log("flag", flag)
                        setSelectAll(flag)
                        
                    }, [values]);

                    return (
                        <Form>
                            <div className="flex items-center gap-4">
                                <FormItem label='Role' className='w-1/3 !mb-0 mt-5'>
                                    <Input
                                        name='role'
                                        placeholder='Role'
                                        onChange={(e) => handleInputChange(e)}
                                    />
                                </FormItem>

                                <div className="mt-5">
                                    <Checkbox
                                        checked={selectAll}
                                        onChange={(value: boolean, e: ChangeEvent<HTMLInputElement>) => {
                                            // setSelectAll(value);
                                            handleSelectAll(setFieldValue, !selectAll);
                                        }}
                                    >
                                        Select All Permissions
                                    </Checkbox>
                                </div>
                            </div>

                            {accessTypes.map((type) => (
                                <div
                                    key={type}
                                    className='grid md:grid-cols-4 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center'
                                >

                                    <div className='flex items-center gap-2'>

                                        <div className="">
                                            <Checkbox
                                                className='h-3 w-3'
                                                checked={checkType[type]}
                                                onChange={(value: boolean, e: ChangeEvent<HTMLInputElement>) => {
                                                    handleSelectType(setFieldValue, type, value, selectAll)
                                                }}
                                            >
                                            </Checkbox>
                                        </div>

                                        <div className="font-semibold">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                                    </div>

                                    <div className='flex gap-2'>
                                        <Field name={type}>
                                            {({ field, form }: any) => (
                                                <Selector field={field} form={form} checkType={checkType} setCheckType={setCheckType} />
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
                                        {isSubmitting ? 'Creating...' : 'Create'}
                                    </Button>
                                    <Button
                                        size='sm'
                                        type="button"
                                        onClick={() => navigate(`/app/crm/profile?type=roles`)}
                                    >
                                        Back
                                    </Button>
                                </div>
                            </StickyFooter>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default EditRoles;