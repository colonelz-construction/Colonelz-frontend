import React, { useState, FormEvent, useRef, useEffect } from 'react'
import {
    Button,
    DatePicker,
    FormContainer,
    FormItem,
    Input,
    Notification,
    Select,
    Upload,
    toast,
} from '@/components/ui'
import CreatableSelect from 'react-select/creatable'
import { useLocation, useNavigate } from 'react-router-dom'
import { HiOutlineCloudUpload } from 'react-icons/hi'

import App from './Richtext'
import { apiCreateMom } from '@/services/CrmService'
import { MultiValue } from 'react-select'
import { StickyFooter } from '@/components/shared'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import useDarkMode from '@/utils/hooks/useDarkmode'

type Option = {
    value: string
    label: string
}

// type ValidationType = 'number' | 'email' | 'text';

interface MultiInputOptionsProps {
    value?: Option[];
    onChange: (val: any) => void;
    type?: 'text' | 'email' | 'number';
    placeholder?: string;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    options?: Option[];
}

export const MultiInputOptions = ({
    value = [],
    onChange,
    type = 'text',
    placeholder = 'Enter value',
    errorMessage,
    minLength = 1,
    maxLength = Infinity,
    options = [],
}: MultiInputOptionsProps) => {
    const [isDark, setIsDark] = useDarkMode()

    // console.log(value)
    const [inputValue, setInputValue] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);

    const validators: Record<'text' | 'email' | 'number', RegExp> = {
        text: /^[a-zA-Z0-9-\s]*$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        number: /^[0-9\s]*$/,
    };

    const filteredOptions = options?.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (type === 'email' || validators[type].test(newValue)) {
            setInputValue(newValue);
            setDropdownVisible(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            const sanitizedValue = inputValue.trim();
            const isValid =
                sanitizedValue.length >= minLength &&
                sanitizedValue.length <= maxLength &&
                (type !== 'email' || validators.email.test(sanitizedValue));



            if (!isValid) {
                setError(
                    errorMessage ||
                    `Value must be ${minLength === maxLength
                        ? `exactly ${minLength}`
                        : `between ${minLength} and ${maxLength}`
                    } characters${type === 'email' ? ' and a valid email address' : ''}.`
                );
            } else {
                setError(null);
                onChange([...value, sanitizedValue]);
                setInputValue('');
            }
            e.preventDefault();
        }
    };

    const handleRemove = (index: number) => {
        const newValue = value.filter((_: any, i: any) => i !== index);
        onChange(newValue);
    };

    const handleOptionSelect = (option: Option) => {
        if (!value.some((v: any) => v.value === option.value)) {
            onChange([...value, option.value]);
        }
        setInputValue('');
        setDropdownVisible(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
            setDropdownVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={ref}>
            <div className={`border-[0.03rem] ${isDark ? "border-[#4B5563]" : "border-[#D1D5DB]"} rounded-md p-1`}>
                <div className="flex flex-wrap gap-2">
                    {value.map((val: any, index: any) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 bg-[#F3F4F6] px-2 py-1 rounded"
                        >
                            <span className="font-semibold">{val}</span>
                            <button
                                type="button"
                                className="font-semibold"
                                onClick={() => handleRemove(index)}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={`mt-1 border-none rounded px-2 py-1 w-full outline-none ${isDark && "bg-[#1F2937]"}`}
                    onFocus={() => setDropdownVisible(true)}
                />
                {isDropdownVisible && filteredOptions.length > 0 && (
                    <div className="mt-1 absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                        {filteredOptions.map((option, index) => (
                            <div
                                key={index}
                                className="px-2 py-3 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleOptionSelect(option)}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <div className="text-red-600 mt-1">{error}</div>}
        </div>
    );
};


const YourFormComponent = () => {
    const navigate = useNavigate()
    interface QueryParams {
        project_id: string
        client_name: string
    }
    const location = useLocation()
    const org_id: any = localStorage.getItem('orgId')
    const queryParams = new URLSearchParams(location.search)
    const allQueryParams: QueryParams = {
        project_id: queryParams.get('project_id') || '',
        client_name: queryParams.get('client_name') || '',
    }

    const clientOptions: Option[] = [
        {
            value: allQueryParams.client_name,
            label: allQueryParams.client_name,
        },
    ]

    const optionsSource = [
        { value: 'At Office', label: 'At Office' },
        { value: 'At Site', label: 'At Site' },
        { value: 'At Client place', label: 'At Client Place' },
        { value: 'Other', label: 'Other' },
    ]





    return (
        <div>
            <h3 className='mb-5'>Add MOM</h3>
            <Formik
                initialValues={
                    {
                        user_id: localStorage.getItem('userId'),
                        org_id,
                        client_name: [],
                        organisor: [],
                        attendees: [],
                        meetingDate: '',
                        location: '',
                        remark: '',
                        files: [],
                        project_id: allQueryParams.project_id,
                    }
                }
                validationSchema={Yup.object().shape({
                    client_name: Yup.array().min(1, "Client's Name is required"),
                    organisor: Yup.array().min(1, "Organisor's Name is required"),
                    meetingDate: Yup.string().required('Meeting Date is required'),
                    location: Yup.string().required('Location is required'),
                })
                }
                onSubmit={async (values, { setSubmitting }) => {
                    const formData = new FormData()
                        ;

                    // console.log(values.client_name)

                    formData.append('user_id', (values.user_id || ''))
                    formData.append('client_name', JSON.stringify(values.client_name))
                    formData.append('organisor', JSON.stringify(values.organisor))
                    formData.append('attendees', JSON.stringify(values.attendees))
                    formData.append('meetingdate', values.meetingDate)
                    formData.append('location', values.location)
                    formData.append('remark', values.remark)
                    formData.append('org_id', org_id)
                    values.files.forEach((file) => {
                        formData.append('files', file)
                    })
                    formData.append('project_id', values.project_id)

                    setSubmitting(true)
                    try {
                        const response = await apiCreateMom(formData)



                        if (response.code === 200) {
                            setSubmitting(false)
                            toast.push(
                                <Notification closable type="success" duration={2000}>
                                    Mom Created Successfully
                                </Notification>
                            )
                            window.location.reload()
                            navigate(-1)
                        } else {
                            toast.push(
                                <Notification closable type="danger" duration={2000}>
                                    {response.errorMessage}
                                </Notification>
                            )
                        }
                    } catch (error) {
                        setSubmitting(false)
                        toast.push(
                            <Notification closable type="success" duration={2000}>
                                Internal server Error
                            </Notification>
                        )
                    }
                }
                }
            >
                {({ errors, setFieldValue, isSubmitting, values }) => (
                    <Form>
                        <FormContainer>
                            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-5">
                                <FormItem label="Client's Name" asterisk>
                                    <Field name="client_name">
                                        {/* {({ field, form }:any) => (
                                        <Select
                                            isMulti
                                            componentAs={CreatableSelect}
                                            options={clientOptions}
                                            onChange={(selectedOptions) => {
                                                const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
                                                form.setFieldValue('client_name', values);
                                            }}
                                        />
                                    )} */}
                                        {({ form }: { form: any }) => (
                                            <MultiInputOptions
                                                value={form.values.client_name}
                                                onChange={(val) => form.setFieldValue('client_name', val)}
                                                type="text"
                                                placeholder="Client Name"
                                                options={clientOptions}
                                                minLength={3}
                                                maxLength={60}
                                                errorMessage="Name must have at least 3 characters."
                                            />
                                        )}
                                    </Field>
                                    {errors.client_name && (
                                        <span className="text-red-500">
                                            {errors.client_name}
                                        </span>)}
                                </FormItem>
                                <FormItem label="Organised By"
                                    asterisk>
                                    <Field name="organisor">
                                        {({ form }: { form: any }) => (
                                            <MultiInputOptions
                                                value={form.values.organisor}
                                                onChange={(val) => form.setFieldValue('organisor', val)}
                                                type="text"
                                                placeholder="Organised By"
                                                options={[]}
                                                minLength={3}
                                                maxLength={60}
                                                errorMessage="Name must have at least 3 characters."
                                            />
                                        )}
                                    </Field>
                                    {errors.organisor && (
                                        <span className="text-red-500">
                                            {errors.organisor}
                                        </span>
                                    )}
                                </FormItem>

                                <FormItem label="Others" >
                                    <Field name="attendees">
                                        {({ form }: { form: any }) => (
                                            <MultiInputOptions
                                                value={form.values.attendees}
                                                onChange={(val) => form.setFieldValue('attendees', val)}
                                                type="text"
                                                placeholder="Others"
                                                options={[]}
                                                minLength={3}
                                                maxLength={60}
                                                errorMessage="Name must have at least 3 characters."
                                            />
                                        )}
                                    </Field>
                                    {
                                        errors.attendees && (
                                            <span className="text-red-500">
                                                {errors.attendees}
                                            </span>
                                        )
                                    }
                                </FormItem>
                                <FormItem label="Date" asterisk>
                                    <DatePicker
                                        onChange={(date) =>
                                            setFieldValue('meetingDate', date ? `${date}` : '')
                                        }
                                    />
                                    {errors.meetingDate && (
                                        <span className="text-red-500">
                                            {errors.meetingDate}
                                        </span>
                                    )}
                                </FormItem>
                                <FormItem label="Location" asterisk>
                                    <Select
                                        options={optionsSource}
                                        onChange={(selectedOption) =>
                                            setFieldValue('location', selectedOption?.value)
                                        }
                                    />
                                    {errors.location && (
                                        <span className="text-red-500">
                                            {errors.location}
                                        </span>
                                    )}
                                </FormItem>

                                <FormItem label="File">
                                    <Upload
                                        multiple
                                        onChange={(files) => {
                                            setFieldValue('files', files)
                                        }}
                                    >
                                        <Button
                                            variant="solid"
                                            icon={<HiOutlineCloudUpload />}
                                            type="button"
                                            block
                                        >
                                            Upload your file
                                        </Button>
                                    </Upload>
                                </FormItem>
                            </div>

                            <div className='lg:mb-32'>

                                <App
                                    value={values.remark}
                                    onChange={(value) => {
                                        setFieldValue('remark', value)
                                    }}
                                />
                            </div>


                            <StickyFooter
                                className="-mx-8 px-8 flex items-center gap-3 py-4"
                                stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            >

                                <Button type="submit" className="mr-2" variant="solid" size='sm' loading={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                                <Button type="submit" onClick={() => navigate(-1)} size='sm'>
                                    Discard
                                </Button>

                            </StickyFooter>
                        </FormContainer>
                    </Form>
                )}

            </Formik>

        </div>
    )
}

export default YourFormComponent
