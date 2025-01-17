import React, { SyntheticEvent, createContext, useEffect, useState } from 'react'
import makeAnimated from 'react-select/animated'
import { Formik, Field, Form, ErrorMessage, FieldProps, useFormikContext, FormikProps, FormikValues } from 'formik'
import * as Yup from 'yup'
import { Button, Checkbox, DatePicker, FormItem, Input, InputGroup, Notification, Select, toast } from '@/components/ui'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiGetCrmProjectMakeContract } from '@/services/CrmService'
import CreatableSelect from 'react-select/creatable'
import MyComponent from './CommercialPdf'
import MyComponent1 from './pdf'
import useDarkMode from '@/utils/hooks/useDarkmode'

interface FormValues {
    project_type: string;
    contract_type: string;
    client_name: [];
    client_email: [];
    client_phone: [];
    project_name: string;
    site_address: string;
    date: string;
    city: string;
    quotation: string;
    design_stage: string[];
    number: [string, string, string];
    design_charges: string;
    discount: string;
    design_charges_per_sft: string;
    design_cover_area_in_sft: string;
    balcony_charges_per_sft: string;
    balcony_area_in_sft: string;
    terrace_covered_charges_per_sft: string;
    terrace_covered_area_in_sft: string;
    terrace_open_charges_per_sft: string;
    terrace_open_area_in_sft: string;
    additional_note: string;
}


const validationSchema = Yup.object().shape({
    // project_name: Yup.string().required('Required'),
    // site_address: Yup.string().required('Required'),
    // date: Yup.date().required('Required'),
    // city: Yup.string().required('Required'),
    // quotation: Yup.string().required('Required'),
    // cost: Yup.number().required('Required'),
    // type: Yup.string().required('Required'),

    // design_charges_per_sft: Yup.number().test(
    //     'is-residential',
    //     'Required',
    //     function (value) {
    //         const { type } = this.parent
    //         return type === 'residential' ? value != null : true
    //     },
    // ),

    // cover_area_in_sft: Yup.number().test(
    //     'is-residential',
    //     'Required',
    //     function (value) {
    //         const { type } = this.parent
    //         return type === 'residential' ? value != null : true
    //     },
    // ),

    // terrace_and_balcony_charges_per_sft: Yup.number().test(
    //     'is-residential',
    //     'Required',
    //     function (value) {
    //         const { type } = this.parent
    //         return type === 'residential' ? value != null : true
    //     },
    // ),

    // terrace_and_balcony_area_in_sft: Yup.number().test(
    //     'is-residential',
    //     'Required',
    //     function (value) {
    //         const { type } = this.parent
    //         return type === 'residential' ? value != null : true
    //     },
    // ),
})

// const NumberInput = (props: any) => {
//     const [val, setVal] = useState<any>('')
  
//     const handleInputChange = (newValue: string) => {
//       // Allow only numbers and spaces
//       if (/^[0-9\s]*$/.test(newValue)) {
//         setVal(newValue)
//         return newValue;
//       }
  
//       return val;
//     };
  
//     const animatedComponents = makeAnimated()
  
//     return (
//       <CreatableSelect
//         {...props}
//         isClearable
//         onInputChange={handleInputChange}
//         components={animatedComponents}
//       />
//     );
//   };


// const NumberInput = (props: any) => {
//     const [inputValue, setInputValue] = useState<string>(''); // External state for input value
  
//     const handleInputChange = (newValue: string) => {
//         // Allow only numbers and spaces
//         if (/^[0-9\s]*$/.test(newValue)) {
//             setInputValue(newValue);
//         }
//     };
  
//     const handleBlur = () => {
//         // Preserve the inputValue when the input loses focus
//         setInputValue((prev) => prev.trim());
//     };
  
//     const handleKeyDown = (event: React.KeyboardEvent) => {
//         if (event.key === 'Enter' && inputValue.trim()) {
//             // Add the value when 'Enter' is pressed
//             if (props.onChange) {
//                 props.onChange([...props.value || [], { label: inputValue, value: inputValue }]);
//             }
//             setInputValue(''); // Clear the input field after adding
//         }
//     };
  
//     return (
//         <CreatableSelect
//             {...props}
//             isClearable
//             inputValue={inputValue} // Controlled input value
//             onInputChange={handleInputChange}
//             onBlur={handleBlur}
//             onKeyDown={handleKeyDown}
//             components={makeAnimated()}
//         />
//     );
// };

  

export const FormikValuesContext = createContext(null);

const FormComponent = ({ children }: any) => {
    const { values, setFieldValue } = useFormikContext<FormValues>();
    useEffect(() => {
        const lead_id = new URLSearchParams(window.location.search).get('lead_id');
        const fileName = `Contract_${lead_id}_${values.project_name}_${new Date().toLocaleString().replace(/[/,]/g, '-').replace(/:/g, '-')}`;
        setFieldValue('file_name', fileName);
    }, [values.project_name, setFieldValue]);

    return (
        <div className=''>
            {values.project_type === 'residential' ? <MyComponent1 data={values} /> : <MyComponent data={values} />
            }
        </div>
    );
};




type ValidationType = 'number' | 'email' | 'text';

interface MultiInputProps {
    value: string[];
    onChange: (val: string[]) => void;
    type: ValidationType;
    placeholder?: string;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
}

export const MultiInput = ({
    value = [],
    onChange,
    type,
    placeholder = 'Enter value',
    errorMessage,
    minLength = 1,
    maxLength = Infinity,
}: MultiInputProps) => {

    const [isDark, setIsDark] = useDarkMode()
    const [inputValue, setInputValue] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Validation rules
    const validators: Record<ValidationType, RegExp> = {
        number: /^[0-9\s]*$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        text: /^[a-zA-Z0-9-\s]*$/,
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (type === 'number') {
            console.log(newValue)
            const sanitizedValue = newValue.replace(/\s/g, '');  // Remove all spaces from the string

            console.log(sanitizedValue)
            if (validators[type].test(sanitizedValue)) {
                setInputValue(sanitizedValue);
            }
        } else {
            // For other types, only update input value if it matches the validator
            if (validators[type].test(newValue)) {
                setInputValue(newValue);
            }
        }

        if (type === 'email' || validators[type].test(newValue)) {
            setInputValue(newValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            let sanitizedValue = inputValue.trim();

            if(type === 'number') {
                sanitizedValue = inputValue.trim().replace(/\s+/g, '');
            }
            const isValid =
                sanitizedValue.length >= minLength &&
                sanitizedValue.length <= maxLength &&
                (type !== 'email' || validators.email.test(sanitizedValue));

            if (isValid) {
                setError(null);
                onChange([...value, sanitizedValue]);
                setInputValue('');
            } else {
                setError(
                    errorMessage ||
                        `Value must be ${
                            minLength === maxLength
                                ? `exactly ${minLength}`
                                : `between ${minLength} and ${maxLength}`
                        } characters${type === 'email' ? ' and a valid email address' : ''}.`
                );
            }
            e.preventDefault();
        }
    };

    const handleRemove = (index: number) => {
        const newValue = value.filter((_, i) => i !== index);
        onChange(newValue);
    };

    return (
        <div>
            <div className={`border-[0.03rem] ${isDark ? "border-[#4B5563]" : "border-[#D1D5DB]"} rounded-md p-1`}>
                <div className="flex flex-wrap gap-2">
                    {value.map((val, index) => (
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
                />
            </div>
            {error && <div className="text-red-600 mt-1">{error}</div>}
        </div>
    );
};




const Index = () => {



    const navigate = useNavigate()


    const handleSubmit = async (values: FormValues) => {
        //     
        //   console.log(values.date);
        //     navigate('/app/crm/pdf')

        //   values.date = new Date(values.date).toISOString().split('T')[0]
        //   console.log(values.number);


        //     const response = await apiGetCrmProjectMakeContract(values)
        //     const responseData = await response.json()
        //     if(responseData.code===200){
        //     window.open(responseData.data, '_blank')
        //     console.log(responseData)
        //     }
        // else{
        //     toast.push(
        //         <Notification closable type="danger" duration={2000}>
        //             {responseData.errorMessage}
        //         </Notification>,{placement:'top-center'}
        //     )
        // }
    }


    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const lead_id = queryParams.get('lead_id')
    const userId = localStorage.getItem('userId')

    return (
        <Formik
            initialValues={{
                lead_id: lead_id,
                file_name: `Contract_${lead_id}_${new Date().toISOString().split('T')[0].split('-').reverse().join('-')}`,
                company_name: '',
                user_id: userId,
                project_type: '',
                contract_type: '',
                client_email: [],
                client_name: [],
                client_phone: [],
                project_name: '',
                site_address: '',
                toilet_number: '',
                bedroom_number: '',
                balcony_number: '',
                date: new Date().toISOString().split('T')[0].split('-').reverse().join('-'),
                city: '',
                quotation: '',
                design_stage: [],
                number: ["", "", ""],
                design_charges: '0',
                working_days: '0',
                discount: '0',
                design_charges_per_sft: '0',
                design_cover_area_in_sft: '0',
                balcony_charges_per_sft: '0',
                balcony_area_in_sft: '0',
                terrace_covered_charges_per_sft: '0',
                terrace_covered_area_in_sft: '0',
                terrace_open_charges_per_sft: '0',
                terrace_open_area_in_sft: '0',
                additional_note: '',
            }}
            validationSchema={validationSchema}
            onSubmit={
                handleSubmit
            }
            validateOnChange={true}
            validateOnBlur={true}
        >

            <FormContent />


        </Formik>
    );
};

function NumericInput({ field, form }: { field: any, form: FormikProps<any> }) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        if (/^\d*$/.test(inputValue)) {
            form.setFieldValue(field.name, inputValue);
        }
    };

    return (
        <Input
            type='text'
            onChange={handleChange}
            placeholder="Enter numbers only"
        />
    );
}

const FormContent = () => {
    const { setFieldValue, values } = useFormikContext<FormValues>();
    type OptionType = { label: string; value: string; };
    const typeOptions: OptionType[] = [
        { value: 'commercial', label: 'Commercial' },
        { value: 'residential', label: 'Residential' },
    ]


    const numberOption = [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
    ]
    const contract_type = [
        { value: 'Interior design & Implementation', label: 'Interior design & Implementation' },
        { value: "Architecture, Construction & Interior Design Implementation", label: "Architecture, Construction & Interior Design Implementation" },
        { value: "Architecture Planning & Interior Design", label: "Architecture Planning & Interior Design" },
        { value: "Interior Design", label: "Interior Design" },
    ]
    const designOptions: OptionType[] = [
        { value: 'Drawing room', label: 'Drawing room' },
        { value: 'Living / Family Louge', label: 'Living / Family Louge' },
        { value: 'Kitchen', label: 'Kitchen' },
        { value: 'Dining area', label: 'Dining area' },
        { value: 'Toilets', label: 'Toilets' },
        { value: 'Bedrooms', label: 'Bedrooms' },
        { value: 'Multipurpose room / Music & dance room / Yoga & meditation room', label: 'Multipurpose room / Music & dance room / Yoga & meditation room' },
        { value: 'Home Office', label: 'Home Office' },
        { value: 'Mandir / Puja', label: 'Mandir / Puja' },
        { value: 'Balconies', label: 'Balconies' },
        { value: 'Terrace', label: 'Terrace' },
        { value: 'Others', label: 'Others' },
    ]



    const animatedComponents = makeAnimated()

    return (

        <>
            <h3 className="mb-4">Contract</h3>
            
           
            <Form className="">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    <FormItem label="Project Type">
                        <Field name="project_type">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    options={typeOptions}
                                    value={typeOptions.find(option => option.value === field.value)}
                                    onChange={(option) => {
                                        if (option) {
                                            form.setFieldValue(field.name, option.value);
                                        } else {
                                            form.setFieldValue(field.name, '');
                                        }
                                    }}
                                />
                            )}
                        </Field>
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>

                    <FormItem label="Contract Type">
                        <Field name="contract_type">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    options={contract_type}
                                    value={contract_type.find(option => option.value === field.value)}
                                    onChange={(option) => {
                                        if (option) {
                                            form.setFieldValue(field.name, option.value);
                                        } else {
                                            form.setFieldValue(field.name, '');
                                        }
                                    }
                                    }
                                />
                            )}
                        </Field>
                        <ErrorMessage
                            name="contract_type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>
                    {values.project_type === 'commercial' &&
                        <FormItem label="Company Name">
                            <Field
                                component={Input}
                                type="text"
                                name="company_name"
                                placeholder="Company Name"
                            />
                        </FormItem>
                    }

                    <FormItem label="Client Name">
                        <Field name="client_name">
                            {({ form }: { form: any }) => (
                                <MultiInput
                                    value={form.values.client_name}
                                    onChange={(val) => form.setFieldValue('client_name', val)}
                                    type="text"
                                    placeholder="Client Name"
                                    minLength={3}
                                    maxLength={60}
                                    errorMessage="Name must have atleast 3 characters."
                                />
                            )}
                        </Field>
                        <ErrorMessage
                            name="client_name"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>
                    <FormItem label="Client Phone">
                    <Field name="client_phone">
                        {({ form }: { form: any }) => (
                            <MultiInput
                                value={form.values.client_phone}
                                onChange={(val) => form.setFieldValue('client_phone', val)}
                                type="number"
                                placeholder="Phone Number"
                                minLength={5}
                                maxLength={10}
                                errorMessage="Phone number must be between 5 and 10 digits."
                            />
                        )}
                    </Field>
                        <ErrorMessage
                            name="client_phone"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>
                    <FormItem label="Client Email">
                        <Field name="client_email">
                            {({ form }: { form: any }) => (
                                <MultiInput
                                    value={form.values.client_email}
                                    onChange={(val) => form.setFieldValue('client_email', val)}
                                    type="email"
                                    placeholder="Client Email"
                                    minLength={4}
                                    maxLength={50}
                                    errorMessage="Enter a valid email."
                                />
                            )}
                        </Field>
                        <ErrorMessage
                            name="client_email"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>



                    <FormItem label="Project Name">
                        <Field
                            component={Input}
                            type="text"
                            name="project_name"
                            placeholder="Project Name"
                        />
                        <ErrorMessage
                            name="project_name"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>
                    <FormItem label="City">
                        <Field
                            component={Input}
                            type="text"
                            name="city"
                            placeholder="City"
                        />
                        <ErrorMessage
                            name="city"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>


                    <FormItem label="Site Address">
                        <Field
                            component={Input}
                            type="text"
                            name="site_address"
                            placeholder="Site Address"
                        />
                        <ErrorMessage
                            name="site_address"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>

                    <FormItem label="Quotation">
                        <Field
                            component={Input}
                            type="text"
                            name="quotation"
                            placeholder="Quotation"
                        />
                        <ErrorMessage
                            name="quotation"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>
                    {values.project_type === 'commercial' &&
                        <FormItem label="Working Days">
                            <Field name='working_days'>
                                {({ field, form }: FieldProps) => (
                                    <Input
                                        type='text'
                                        placeholder='Working Days'

                                        size='md'
                                        onKeyPress={(e) => {
                                            const charCode = e.which ? e.which : e.keyCode;
                                            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            form.setFieldValue(field.name, value);
                                        }}
                                    />
                                )}
                            </Field>
                        </FormItem>
                    }

                    <FormItem label="File Name">
                        <Field
                            component={Input}
                            type="text"
                            name="file_name"
                            placeholder="File Name"

                        />
                    </FormItem>
                    <FormItem label='Design Charges'>
                        <Field name='design_charges'>
                            {({ field, form }: any) => (
                                <Input
                                    type='text'
                                    placeholder='Design Charges'
                                    size='md'
                                    onKeyPress={(e) => {
                                        const charCode = e.which ? e.which : e.keyCode;
                                        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        form.setFieldValue(field.name, value);

                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>
                    {values.project_type === 'residential' &&
                        <>                           <FormItem label='Discount(%)'>
                            <Field name='discount'>
                                {({ field, form }: FieldProps) => (
                                    <Input
                                        type='text'
                                        placeholder='Discount(%)'

                                        size='md'
                                        onKeyDown={(e: any) => {
                                            const charCode = e.which ? e.which : e.keyCode;
                                            const value = e?.target?.value;
                                            if (
                                                charCode === 8 ||
                                                charCode === 46 ||
                                                charCode === 9 ||
                                                charCode === 27 ||
                                                charCode === 13 ||
                                                (charCode >= 35 && charCode <= 40)
                                            ) {
                                                return;
                                            }
                                            if (charCode < 48 || charCode > 57) {
                                                e.preventDefault();
                                            }
                                            const newValue = parseInt(value + e.key, 10);
                                            if (newValue < 0 || newValue > 100) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            form.setFieldValue(field.name, value);
                                        }}
                                    />
                                )}
                            </Field>
                        </FormItem>


                            <FormItem label='Design Stage'>
                                <Field name='design_stage'>
                                    {({ field, form }: any) => (
                                        <Select
                                            isMulti
                                            options={designOptions}
                                            name='design_stage'
                                            onChange={
                                                (option) => form.setFieldValue(field.name, option.map((v: OptionType) => v.value))}

                                        />
                                    )}
                                </Field>
                            </FormItem>
                            {values.design_stage.includes('Toilets') &&
                                <FormItem label="Toilet No.">
                                    <Field name="toilet_number">
                                        {({ field, form }: any) => (
                                            <Select
                                                {...field}
                                                options={numberOption}
                                                onChange={(option: { value: any }) => {
                                                    form.setFieldValue(field.name, option ? option.value : "");
                                                }}
                                                value={numberOption ? numberOption.find(option => option.value === field.value) : ''}
                                            />
                                        )}
                                    </Field>
                                </FormItem>}
                            {values.design_stage.includes('Bedrooms') &&
                                <FormItem label="Bedroom No.">
                                    <Field name="bedroom_number">
                                        {({ field, form }: any) => (
                                            <Select
                                                {...field}
                                                options={numberOption}
                                                onChange={(option: { value: any }) => {
                                                    form.setFieldValue(field.name, option ? option.value : "");
                                                }}
                                                value={numberOption ? numberOption.find(option => option.value === field.value) : ''}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                            }
                            {values.design_stage.includes('Balconies') &&
                                <FormItem label="Balconies No.">
                                    <Field name="balcony_number">
                                        {({ field, form }: any) => (
                                            <Select
                                                {...field}
                                                options={numberOption}
                                                onChange={(option: { value: any }) => {
                                                    form.setFieldValue(field.name, option ? option.value : "");
                                                }}
                                                value={numberOption ? numberOption.find(option => option.value === field.value) : ''}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                            }


                            <FormItem label='Design Charges For Covered Area(in Rs)'>
                                <Field name='design_charges_per_sft'>
                                    {({ field, form }: FieldProps) => (
                                        <Input
                                            type='text'
                                            placeholder='Design Charges For Covered Area(Rs)'

                                            size='md'
                                            onKeyPress={(e) => {
                                                const charCode = e.which ? e.which : e.keyCode;
                                                if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                form.setFieldValue(field.name, value);
                                            }}
                                        />
                                    )}
                                </Field>
                            </FormItem>
                            <FormItem label='Covered Area(in SQFT)'>
                                <Field name='design_cover_area_in_sft'>
                                    {({ field, form }: FieldProps) => (
                                        <Input
                                            type='text'
                                            placeholder='Covered Area(in SQFT)'

                                            size='md'
                                            onKeyPress={(e) => {
                                                const charCode = e.which ? e.which : e.keyCode;
                                                if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                form.setFieldValue(field.name, value);
                                            }}
                                        />
                                    )}
                                </Field>
                            </FormItem>
                            {values.design_stage.includes('Balconies') && <>
                                <FormItem label='Design Charges For Balcony Area(in Rs)'>
                                    <Field name='balcony_charges_per_sft'>
                                        {({ field, form }: FieldProps) => (
                                            <Input
                                                type='text'
                                                placeholder='Design Charges For Balcony Area(in Rs)'

                                                size='md'
                                                onKeyPress={(e) => {
                                                    const charCode = e.which ? e.which : e.keyCode;
                                                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    form.setFieldValue(field.name, value);
                                                }}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem label='Balcony Area(in SQFT)'>
                                    <Field name='balcony_area_in_sft'>
                                        {({ field, form }: FieldProps) => (
                                            <Input
                                                type='text'
                                                placeholder='Balcony Area(in SQFT)'

                                                size='md'
                                                onKeyPress={(e) => {
                                                    const charCode = e.which ? e.which : e.keyCode;
                                                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    form.setFieldValue(field.name, value);
                                                }}
                                            />
                                        )}
                                    </Field>
                                </FormItem></>}
                            {values.design_stage.includes('Terrace') && <>
                                <FormItem label='Design Charges For Terrace Covered Area(in Rs)'>
                                    <Field name='terrace_covered_charges_per_sft'>
                                        {({ field, form }: FieldProps) => (
                                            <Input
                                                type='text'
                                                placeholder='Design Charges For Terrace Covered Area(in Rs)'

                                                size='md'
                                                onKeyPress={(e) => {
                                                    const charCode = e.which ? e.which : e.keyCode;
                                                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    form.setFieldValue(field.name, value);
                                                }}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem label='Terrace Covered Area (in SQFT)'>
                                    <Field name='terrace_covered_area_in_sft'>
                                        {({ field, form }: FieldProps) => (
                                            <Input
                                                type='text'
                                                placeholder='Terrace Covered Area (in SQFT)'

                                                size='md'
                                                onKeyPress={(e) => {
                                                    const charCode = e.which ? e.which : e.keyCode;
                                                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    form.setFieldValue(field.name, value);
                                                }}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem label='Design Charges For Terrace Open Area (in Rs)'>
                                    <Field name='terrace_open_charges_per_sft'>
                                        {({ field, form }: FieldProps) => (
                                            <Input
                                                type='text'
                                                placeholder='Design Charges For Terrace Open Area (in Rs)'
                                                size='md'
                                                onKeyPress={(e) => {
                                                    const charCode = e.which ? e.which : e.keyCode;
                                                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    form.setFieldValue(field.name, value);
                                                }}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem label='Terrace Open Area (in SQFT)'>
                                    <Field name='terrace_open_area_in_sft'>
                                        {({ field, form }: FieldProps) => (
                                            <Input
                                                type='text'
                                                placeholder='Terrace Open Area (in SQFT)'
                                                size='md'
                                                onKeyPress={(e) => {
                                                    const charCode = e.which ? e.which : e.keyCode;
                                                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    form.setFieldValue(field.name, value);
                                                }}
                                            />
                                        )}
                                    </Field>
                                </FormItem></>}
                        </>
                    }

                    <FormItem label="Additional Note">
                        <Field
                            name="additional_note"
                            placeholder="File Name"
                        >
                            {({ field, form }: FieldProps) => (
                                <Input
                                    type="text"
                                    textArea
                                    {...field}
                                />
                            )}
                        </Field>
                    </FormItem>

                </div>
                {/* <FormItem label="Design Stage">
                                <Checkbox.Group value={checkboxList} onChange={onCheckboxChange} className='grid grid-cols-3 gap-5 '>
                                <Checkbox value="Drawing room">Drawing room</Checkbox>
                                <Checkbox value="Living / Family Louge">Living / Family Louge</Checkbox>
                                <Checkbox value="Kitchen">Kitchen</Checkbox>
                                <Checkbox value="Dining area">Dining area</Checkbox>
                                <Checkbox value="Toilets">Toilets</Checkbox>
                                <Checkbox value="Bedrooms">Bedrooms</Checkbox>
                                <Checkbox value="Multipurpose room / Music & dance room / Yoga & meditation room">Multipurpose room / Music & dance room / Yoga & meditation room</Checkbox>
                                <Checkbox value="Home Office">Home Office</Checkbox>
                                <Checkbox value="Mandir / Puja">Mandir / Puja</Checkbox>
                                <Checkbox value="Balconies">Balconies</Checkbox>
                                <Checkbox value="Terrace">Terrace</Checkbox>
                                <Checkbox value="Others">Others- please specify</Checkbox>
                            </Checkbox.Group>
                            </FormItem>
                        */}
                <FormComponent />
            </Form>

          
        </>

    )
}

export default Index
