import { useEffect, useState, useRef } from 'react'
import { Formik, Field, Form, ErrorMessage, FieldProps } from 'formik'
import * as Yup from 'yup'
import { Button, FormItem, Input, Notification, Select, toast } from '@/components/ui'
import { apiGetOrgData, apiEditOrgData } from '@/services/CrmService'
import { Country, State, City } from 'country-state-city';
import { RxCrossCircled } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import { GoPlus} from "react-icons/go";
import { AiOutlineMinusCircle } from "react-icons/ai";
const currencyUrl = import.meta.env.VITE_CURRENCY_URL;

const org_id: any = localStorage.getItem('orgId')
const userId: any = localStorage.getItem('userId')


interface FormValues {
    organization: string;
    email: string;
    org_email: string;
    org_phone: string;
    org_website: string;
    currency: string;
    vat_tax_gst_number: any;
    org_logo: any;
    org_address: string;
    org_city: string;
    org_state: string;
    org_country: string;
    org_zipcode: string;

}

interface CurrencyOption {
    value: string;
    label: string;
}

const validationSchema = Yup.object().shape({
    organization: Yup.string().required('Required'),
    // org_email: Yup.string().email('Invalid organization email').required('Organization Email is required'),
    // org_phone: Yup.number()
    //     .required('Contact Number is required'),
    currency: Yup.string().required('Required'),
    // vat_tax_gst_number: Yup.string().required('Required'),
    org_country: Yup.string().required('Required'),
    org_zipcode: Yup.string().required('Required'),
})

const Primary = () => {

    const [details, setDetails] = useState<any>();
    const [initialValues, setInitialValues] = useState<FormValues>({
        organization: '',
        email: '',
        org_email: '',
        org_phone: '',
        org_website: '',
        currency: '',
        vat_tax_gst_number: [],
        org_logo: '',
        org_address: '',
        org_city: '',
        org_state: '',
        org_country: '',
        org_zipcode: '',
    });
    const [file, setFile] = useState<string>('');
    const [typeOptions, setTypeOptions] = useState<CurrencyOption[]>([]);
    const [fields, setFields] = useState<{ name: string; number: string }[]>([{ name: "", number: "" }]);


    useEffect(() => {
        const fetchCurrencies = async () => {
            const response = await fetch(`${currencyUrl}v3.1/all?fields=currencies`);
            const data = await response.json();

            const currencyData: CurrencyOption[] = [];

            data.forEach((country: any) => {
                if (country.currencies) {
                    Object.entries(country.currencies).forEach(([key, value]: [string, any]) => {
                        currencyData.push({
                            value: key,
                            label: `${value.name} (${key})`
                        });
                    });
                }
            });
            const uniqueCurrencies = Array.from(new Set(currencyData.map(c => c.value)))
                .map(value => currencyData.find(c => c.value === value));

            setTypeOptions(uniqueCurrencies.filter(Boolean) as CurrencyOption[]); // Type assertion
        };

        fetchCurrencies();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiGetOrgData();
                setDetails(response.data);
                setFile(response.data.org_logo)
                setFields(response.data.vat_tax_gst_number)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (details) {
            setInitialValues({
                organization: details?.organization || '',
                email: details?.email || '',
                org_email: details?.org_email || '',
                org_phone: details?.org_phone || '',
                org_website: details?.org_website || '',
                currency: details?.currency || '',
                vat_tax_gst_number: details?.vat_tax_gst_number || [{ name: "", number: "" }],
                org_logo: details?.org_logo || '',
                org_address: details?.org_address || '',
                org_city: details?.org_city || '',
                org_state: details?.org_state || '',
                org_country: details?.org_country || '',
                org_zipcode: details?.org_zipcode || '',
            });
        }
    }, [details]);





    const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {

       
        const formData = new FormData();
        formData.append('organization', values.organization);
        formData.append('org_email', values.org_email);
        formData.append('email', values.email);
        formData.append('org_phone', values.org_phone);
        formData.append('currency', values.currency);
        formData.append('vat_tax_gst_number', JSON.stringify(fields))
        formData.append('org_website', values.org_website)
        formData.append('org_city', values.org_city)
        formData.append('org_country', values.org_country)
        formData.append('file', values.org_logo)
        formData.append('org_address', values.org_address)
        formData.append('org_state', values.org_state)
        formData.append('org_zipcode', values.org_zipcode)
        formData.append('org_id', org_id)
        formData.append('userId', userId)

        const response = await apiEditOrgData(formData);
        setSubmitting(false)

        toast.push(
            <Notification type={response.code === 200 ? 'success' : 'danger'} duration={2000}>
                {response.code === 200 ? 'Details Updated Successfully.' : response.errorMessage}
            </Notification>
        );

        if (response.code === 200) window.location.reload();
    }
    return (
        <>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ setFieldValue, values }) => (
                    <FormContent
                        setFieldValue={setFieldValue}
                        values={values}
                        file={file} setFile={setFile}
                        typeOptions={typeOptions}
                        fields={fields}
                        setFields={setFields}
                    />
                )}
            </Formik>
        </>
    );
};

const FormContent = ({ setFields, fields, setFieldValue, values, file, setFile, typeOptions }: { fields:{ name: string; number: string }[], setFields:any,  setFile: (field: string) => void; file: string, setFieldValue: (field: string, value: any) => void; values: FormValues; typeOptions: any }) => {

    const [fileName, setFileName] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const countries = Country.getAllCountries().map(country => ({
        value: country.isoCode,
        label: country.name,
    }));

    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);




    useEffect(() => {
        if (values.org_country) {
            const statesList = State.getStatesOfCountry(values.org_country);
            setStates(statesList);
            setCities([]);
            if (!statesList.some(state => state.isoCode === values.org_state)) {
                setFieldValue('state', '');
                setFieldValue('city', '');
            }
        } else {
            setStates([]);
            setCities([]);
        }
    }, [values.org_country]);

    useEffect(() => {
        if (values.org_state) {
            const citiesList = City.getCitiesOfState(values.org_country, values.org_state);
            setCities(citiesList);
            if (!citiesList.some(city => city.name === values.org_city)) {
                setFieldValue('city', '');
            }
        } else {
            setCities([]);
        }
    }, [values.org_state]);


    const addField = () => {
        setFields([...fields, { name: "", number: "" }]);
      };
    
      const removeField = (index: number) => {
          const newFields = fields.filter((_, i) => i !== index);
          setFields(newFields);
        
      };
    
      const handleChange = (index: number, key: "name" | "number", value: string) => {
        const newFields = [...fields];
        newFields[index][key] = value;
        setFields(newFields);
    
        // Clear error if at least one field has values
        if (newFields.some(field => field.name.trim() !== "" && field.number.trim() !== "")) {
        }
      };
  



    return (
        <>
            <Form className="">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <FormItem label="Organization Name" asterisk>
                        <Field
                            component={Input}
                            type="text"
                            name="organization"
                            placeholder="Organization Name"
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>

                    <FormItem label="Email">
                        <Field
                            component={Input}
                            type="text"
                            name="email"
                            placeholder="Email"
                            disabled
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>

                    <FormItem label="Organization Email">
                        <Field
                            component={Input}
                            type="text"
                            name="org_email"
                            placeholder="Organization Email"
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>

                    <FormItem label="Contact Number">
                        <Field name='org_phone' placeholder="Contact Number" type="text"
                        >
                            {({ field, form }: any) => (
                                <Input
                                    maxLength={10}
                                    value={field.value}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length <= 10 && /^[0-9]*$/.test(value)) {
                                            form.setFieldValue(field.name, value);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        const charCode = e.which ? e.which : e.keyCode;
                                        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                            e.preventDefault();
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

                    <FormItem label="Website">
                        <Field
                            component={Input}
                            type="text"
                            name="org_website"
                            placeholder="Website"
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>

                    <FormItem label="PAN/GST">
                    <div className="">
                        {fields.map((field, index) => (
                            <div key={index} className="flex items-center gap-1">
                            <Field
                            component="input"
                            type="text"
                            value={field.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleChange(index, "name", e.target.value)
                            }
                            placeholder="Tag"
                            className="flex-1 border rounded p-2 w-10 mb-1
                                bg-white text-black border-gray-300
                                dark:bg-gray-800 dark:text-white dark:border-gray-700
                                focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                            />

                            <Field
                            component="input"
                            type="text"
                            value={field.number}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleChange(index, "number", e.target.value)
                            }
                            placeholder="Vat/Tax No/GST"
                            className="flex-1 border rounded p-2 mb-1
                                bg-white text-black border-gray-300
                                dark:bg-gray-800 dark:text-white dark:border-gray-700
                                focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                            />


                            {fields.length > 1 && (
                                <span
                                className='cursor-pointer ml-2'
                                // size="icon"
                                onClick={() => removeField(index)}
                                >
                                <RxCrossCircled/>
                                </span>
                            )}
                            </div>
                        ))}
                        <span className='p-1 cursor-pointer hover:text-gray-400'  onClick={addField}>
                            <span className='flex gap-1 items-center'>
                                <GoPlus/> <span>Add More</span>

                            </span>
                        </span>

                        {/* Debugging: Show the list of values */}
                        </div>
                    </FormItem>

                    {/* <FormItem label="">
                        <div className=' border-white dark:border-gray-800 shadow-lg transition-all duration-300 hover:blur w-48 h-48 rounded-full relative cursor-pointer'
                            onClick={() => document.getElementById('avatarInput')?.click()}
                        >
                            {file && (
                                <div style={{
                                    width: '200px',
                                    height: '200px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '2px solid #ccc',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    margin: '0 auto',
                                }}>
                                    <img
                                        src={file}
                                        alt="Preview"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event: any) => {
                                    const selectedFile = event.target.files[0];
                                    const fileURL = URL.createObjectURL(selectedFile);
                                    setFile(fileURL);
                                    setFileName(selectedFile.name);
                                    setFieldValue("org_logo", selectedFile);
                                }}
                                ref={fileInputRef}
                                style={{
                                    display: 'none',
                                }}
                            />
                        </div>
                    </FormItem> */}

                    <FormItem label="Organisation Logo">
                        <div
                            className="border-white dark:border-gray-800 shadow-lg transition-all duration-300 w-40 h-40 rounded-full relative cursor-pointer group flex justify-center items-center mx-auto mt-2"
                            onClick={() => document.getElementById('avatarInput')?.click()}
                        >
                            {file && (
                                <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-gray-300 flex justify-center items-center mx-auto">
                                    <img
                                        src={file}
                                        alt="Preview"
                                        className="w-full h-full object-cover transition-all duration-300 group-hover:blur"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                id="avatarInput"
                                accept="image/*"
                                onChange={(event: any) => {
                                    const selectedFile = event.target.files[0];
                                    const fileURL = URL.createObjectURL(selectedFile);
                                    setFile(fileURL);
                                    setFileName(selectedFile.name);
                                    setFieldValue('org_logo', selectedFile);
                                }}
                                ref={fileInputRef}
                                style={{
                                    display: 'none',
                                }}
                            />
                            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                                Edit
                            </div>
                        </div>
                    </FormItem>

                    <FormItem label="Upload Logo" className='hidden'>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event: any) => {
                                const selectedFile = event.target.files[0];
                                const fileURL = URL.createObjectURL(selectedFile);
                                setFile(fileURL);
                                setFileName(selectedFile.name);
                                setFieldValue("org_logo", selectedFile);
                            }}
                            ref={fileInputRef}
                            style={{
                                display: 'none',
                            }}
                        />
                        <Field name="org_logo">
                            {({ field, form }: any) => (
                                <Input
                                    {...field}
                                    type="text"
                                    id="avatarInput"
                                    value={fileName}
                                    readOnly
                                    onClick={() => fileInputRef?.current?.click()}
                                    style={{
                                        display: 'none',
                                    }}

                                />
                            )}
                        </Field>
                        <ErrorMessage
                            name="org_logo"
                            component="div"
                            className="text-red-600"
                        />
                    </FormItem>

                    <FormItem label="Currency" asterisk>
                        <Field name="currency">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    options={typeOptions}
                                    value={typeOptions.find((option: any) => option.value === field.value)
                                        // || details?.currency
                                    }
                                    onChange={(option) => {
                                        if (option) {
                                            setFieldValue(field.name, option.value);
                                        } else {
                                            setFieldValue(field.name, '');
                                        }
                                    }}
                                    placeholder="Select a currency..."
                                />
                            )}
                        </Field>
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>

                    <FormItem label="Organisation Address">
                        <Field
                            component={Input}
                            type="text"
                            name="org_address"
                            placeholder="Organisation Address"
                        />
                        <ErrorMessage name="org_address" component="div" className="text-red-600" />
                    </FormItem>

                    <FormItem label="Organisation Country" asterisk>
                        <Field name="org_country">
                            {({ field }: FieldProps) => (
                                <Select
                                    options={countries}
                                    onChange={(option) => setFieldValue('org_country', option?.value || '')}
                                    value={countries.find(option => option.value === field.value) || null}
                                    placeholder="Select Country"
                                />
                            )}
                        </Field>
                        <ErrorMessage name="org_country" component="div" className="text-red-600" />
                    </FormItem>

                    <FormItem label="Organisation State">
                        <Field name="org_state">
                            {({ field }: FieldProps) => (
                                <Select
                                    options={states.map(state => ({ value: state.isoCode, label: state.name }))}
                                    onChange={(option) => {
                                        setFieldValue('org_state', option?.value || '');
                                        setFieldValue('org_city', '');
                                    }}
                                    value={states.find(state => state.isoCode === field.value) ? { value: field.value, label: states.find(state => state.isoCode === field.value)?.name || '' } : null}
                                    placeholder="Select State"
                                    isDisabled={!values.org_country}
                                />
                            )}
                        </Field>
                        <ErrorMessage name="org_state" component="div" className="text-red-600" />
                    </FormItem>

                    <FormItem label="Organisation City">
                        <Field name="org_city">
                            {({ field }: FieldProps) => (
                                <Select
                                    options={cities.map(city => ({ value: city.name, label: city.name }))}
                                    onChange={(option) => setFieldValue('org_city', option?.value || '')}
                                    value={cities.find(city => city.name === field.value) ? { value: field.value, label: field.value } : null}
                                    placeholder="Select City"
                                    isDisabled={!values.org_state}
                                />
                            )}
                        </Field>
                        <ErrorMessage name="org_city" component="div" className="text-red-600" />
                    </FormItem>

                    <FormItem label="Organisation ZIP Code" asterisk>
                        <Field
                            component={Input}
                            type="text"
                            name="org_zipcode"
                            placeholder="ZIP Code"
                        />
                        <ErrorMessage name="org_zipcode" component="div" className="text-red-600" />
                    </FormItem>
                </div>
                <Button variant='solid' type='submit'>Update</Button>
            </Form>
        </>
    )
}
export default Primary;