import { useEffect, useState, useRef } from 'react'
import { Formik, Field, Form, ErrorMessage, FieldProps } from 'formik'
import * as Yup from 'yup'
import { Button, FormItem, Input, Notification, Select, toast } from '@/components/ui'
import { apiGetOrgData, apiEditOrgData } from '@/services/CrmService'


const apiToken = import.meta.env.VITE_API_TOKEN;
const userEmail = import.meta.env.VITE_USER_EMAIL;

const org_id: any = localStorage.getItem('orgId')
const userId: any = localStorage.getItem('userId')

interface Country {
    name: string;
    alpha2Code: string;
}

interface State {
    name: string;
    state_name: string;
}

interface City {
    name: string;
    city_name: string;
}

interface FormValues {
    organization: string;
    email: string;
    org_email: string;
    org_phone: string;
    org_website: string;
    currency: string;
    vat_tax_gst_number: string;
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
    // organization: Yup.string().required('Required'),
    // // org_email: Yup.string().email('Invalid organization email').required('Organization Email is required'),
    // org_phone: Yup.number()
    //     .required('Contact Number is required'),
    // currency: Yup.string().required('Required'),
})

const Primary = () => {

    const [details, setDetails] = useState<any>();
    const [countries, setCountries] = useState<Country[]>([]);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [file, setFile] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiGetOrgData(org_id);
                setDetails(response.data);
                setFile(response.data.org_logo)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        const getAuthToken = async () => {
            try {
                const response = await fetch(`https://www.universal-tutorial.com/api/getaccesstoken`, {
                    headers: {
                        "Accept": "application/json",
                        "api-token": apiToken,
                        "user-email": userEmail,
                    },
                });
                const data = await response.json();
                setAuthToken(data.auth_token);
            } catch (error) {
                console.error('Error fetching auth token:', error);
            }
        };

        getAuthToken();
    }, []);

    useEffect(() => {
        const fetchCountries = async () => {
            if (!authToken) return;
            try {
                const response = await fetch(`https://www.universal-tutorial.com/api/countries/`, {
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "Accept": "application/json",
                    },
                });
                const data = await response.json();
                    const formattedCountries = data.map((country: any) => ({
                        name: country.country_name,
                        alpha2Code: country.country_short_name,
                    }));
                    setCountries(formattedCountries);
               
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };
        fetchCountries();
    }, [authToken]);

    const initialValues: FormValues = {
        organization: details?.organization || '',
        email: details?.email || '',
        org_email: details?.org_email || '',
        org_phone: details?.org_phone || '',
        org_website: details?.org_website || '',
        currency: details?.currency || '',
        vat_tax_gst_number: details?.vat_tax_gst_number || '',
        org_logo: details?.org_logo || '',
        org_address: details?.org_address || '',
        org_city: details?.org_city || '',
        org_state: details?.org_state || '',
        org_country: details?.org_country || '',
        org_zipcode: details?.org_zipcode || '',
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        const formData = new FormData();
        formData.append('organization', values.organization);
        formData.append('org_email', values.org_email);
        formData.append('email', values.email);
        formData.append('org_phone', values.org_phone);
        formData.append('currency', values.currency);
        formData.append('vat_tax_gst_number', values.vat_tax_gst_number)
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

        if (response.code === 200) {
            toast.push(
                <Notification type='success' duration={2000}>
                    Details Updated Succesfully.
                </Notification>
            )
            window.location.reload();
        }
        else {
            toast.push(
                <Notification type='danger' duration={2000}>
                    {response.errorMessage}
                </Notification>
            )
        }
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
                        countries={countries}
                        details={details}
                        setFieldValue={setFieldValue}
                        values={values}
                        file={file} setFile={setFile}
                        authToken={authToken}
                    />
                )}
            </Formik>
        </>
    );
};

const FormContent = ({ countries, details, setFieldValue, values,authToken, file, setFile }: { setFile: (field: string) => void; file: string, countries: Country[]; details: any; setFieldValue: (field: string, value: any) => void; values: FormValues; authToken: string | null }) => {

    const [fileName, setFileName] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [typeOptions, setTypeOptions] = useState<CurrencyOption[]>([]);

    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    useEffect(() => {
        if (details && details.org_country) {
            const country = countries.find(c => c.name === details.org_country);
            if (country) {
                fetchStates(country.name);
                setFieldValue('org_country', country.name);
            }
        }
    }, [details, countries]);

    useEffect(() => {
        if (details && details.org_state) {
            setFieldValue('org_state', details.org_state);
        }
    }, [details]);

    const fetchStates = async (countryName: string) => {
        if (!authToken) return;
        try {
            const response = await fetch(`https://www.universal-tutorial.com/api/states/${countryName}`, {
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Accept": "application/json",
                },
            });
            const data = await response.json();
            const formattedStates = data.map((state: any) => ({
                name: state.state_name,
            }));
            setStates(formattedStates);

                const state = data.find((s: State) => s.state_name === details.org_state);
                if (state) {
                    setFieldValue('org_state', state.state_name);
                    fetchCities(state.state_name); // Fetch cities based on the state
                }
            
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    const fetchCities = async (stateName: string) => {
        if (!authToken) return;
            try {
                const response = await fetch(`https://www.universal-tutorial.com/api/cities/${stateName}`, {
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "Accept": "application/json",
                    },
                });
                const data = await response.json();
                    setCities(data);

                    const city = data.find((c: City) => c.name === details.org_city);
                    if (city) {
                        setFieldValue('org_city', city.name);
                        setFieldValue('org_zipcode', details.org_zipcode || '');
                    }
                    const formattedCities = data.map((city: any) => ({
                        name: city.city_name,
                    }));
                    setCities(formattedCities);
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        }

    const handleCountryChange = async (option: { value: string; label: string } | null) => {
        setFieldValue('org_country', option ? option.label : '');
        setFieldValue('org_state', '');
        setFieldValue('org_city', '');

        if (option) {
            fetchStates(option.label);
        }
    };

    const handleStateChange = async (option: { value: string; label: string } | null) => {
        setFieldValue('org_state', option ? option.label : '');
        setFieldValue('org_city', '');

        if (option) {
            fetchCities(option.value);
        }
    };

    const countryOptions = countries.map(country => ({
        value: country.alpha2Code,
        label: country.name,
    }));

    const stateOptions = states.map(state => ({
        value: state.name,
        label: state.name,
    }));

    const cityOptions = cities.map(city => ({
        value: city.name,
        label: city.name,
    }));

    useEffect(() => {
        const fetchCurrencies = async () => {
            const response = await fetch('https://restcountries.com/v3.1/all');
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

                    <FormItem label="Vat/Tax No/GST" asterisk>
                        <Field
                            component={Input}
                            type="text"
                            name="vat_tax_gst_number"
                            placeholder="Vat/Tax No/GST"
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
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
                                    value={typeOptions.find(option => option.value === field.value)
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
                                    options={countryOptions}
                                    onChange={handleCountryChange}
                                    value={countryOptions.find(option => option.label === field.value) || null}
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
                                    options={stateOptions}
                                    onChange={handleStateChange}
                                    value={stateOptions.find(option => option.label === field.value) || null}
                                    placeholder="Select State"
                                />
                            )}
                        </Field>
                        <ErrorMessage name="org_state" component="div" className="text-red-600" />
                    </FormItem>

                    <FormItem label="Organisation City">
                        <Field name="org_city">
                            {({ field }: FieldProps) => (
                                <Select
                                    options={cityOptions}
                                    onChange={(option) => {
                                        setFieldValue('org_city', option ? option.label : '');
                                    }}
                                    value={cityOptions.find(option => option.label === field.value) || null}
                                    placeholder="Select City"
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