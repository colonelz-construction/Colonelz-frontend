import React, { useEffect, useState, useRef } from 'react'
import { Formik, Field, Form, ErrorMessage, FieldProps, useFormikContext, FormikProps, FormikValues } from 'formik'
import * as Yup from 'yup'
import { Button, Checkbox, DatePicker, FormItem, Input, InputGroup, Notification, Select, toast } from '@/components/ui'
import { apiGetOrgData, apiEditOrgData } from '@/services/CrmService'


const GEONAMES_USERNAME = import.meta.env.VITE_APP_USERNAME

const org_id: any = localStorage.getItem('orgId')
const userId: any = localStorage.getItem('userId')

interface Country {
    geonameId: number;
    name: string;
    isoAlpha2: string; // For country code
}

interface State {
    geonameId: number;
    name: string;
    adminCode1: string;
}

interface City {
    geonameId: number;
    name: string;
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
    // // email: Yup.string().email('Invalid email').required('Email is required'),
    // org_email: Yup.string().email('Invalid organization email').required('Organization Email is required'),
    // org_phone: Yup.number()
    //     .required('Contact Number is required')
    //     .lessThan(10000000000, 'Contact number must be exactly 10 digits'),



})

const Primary = () => {

    const [details, setDetails] = useState<any>();
    const [countries, setCountries] = useState<Country[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiGetOrgData(org_id);

                setDetails(response.data);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, [])
    console.log(details)

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch(`http://api.geonames.org/countryInfoJSON?username=${GEONAMES_USERNAME}`);
                const data = await response.json();
                if (Array.isArray(data.geonames)) {
                    const formattedCountries = data.geonames.map((country: any) => ({
                        geonameId: country.geonameId,
                        name: country.countryName,
                        isoAlpha2: country.countryCode,
                    }));
                    setCountries(formattedCountries);
                }
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };
        fetchCountries();
    }, []);

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
        console.log(response)
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
                    />
                )}
            </Formik>
        </>
    );
};

const FormContent = ({ countries, details, setFieldValue, values }: { countries: Country[]; details: any; setFieldValue: (field: string, value: any) => void; values: FormValues }) => {
    const [file, setFile] = useState<string | undefined>(undefined);
    const [fileName, setFileName] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [typeOptions, setTypeOptions] = useState<CurrencyOption[]>([]);

    const [country1, setCountry1] = useState<any>();
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    // const [selectedCountry, setSelectedCountry] = useState<string | number | null>(null);
    // const [selectedState, setSelectedState] = useState<string>('');
    // const [selectedCity, setSelectedCity] = useState<string>('');
    // const [zipCode, setZipCode] = useState<string>('');

    useEffect(() => {
        if (details && details.org_country) {
            const country = countries.find(c => c.name === details.org_country);
            if (country) {
                fetchStates(country.geonameId);
                setFieldValue('org_country', country.name);
            }
        }
    }, [details, countries]);

    useEffect(() => {
        if (details && details.org_state) {
            const selstate = states.find(c => c.name === details.org_state);
            console.log(selstate)
            if(selstate){
            fetchCities(selstate.adminCode1);
            setFieldValue('org_state', selstate.name);
            }
        }
    }, [details, states]);

    const fetchStates = async (countryGeonameId: number) => {
        try {
            const response = await fetch(`http://api.geonames.org/childrenJSON?geonameId=${countryGeonameId}&username=${GEONAMES_USERNAME}`);
            const data = await response.json();
            if (Array.isArray(data.geonames)) {
                setStates(data.geonames);
                
                const state = data.geonames.find((s: State) => s.adminCode1 === details.org_state);
                if (state) {
                    setFieldValue('org_state', state.name);
                    fetchCities(state.adminCode1); // Fetch cities based on the state
                }
            }
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    const fetchCities = async (stateCode: string) => {
        
        const countryIsoAlpha2 = countries.find(c => c.name === details.org_country)?.isoAlpha2;
        console.log(countryIsoAlpha2);
        
        if (countryIsoAlpha2) {
            const requestUrl = `http://api.geonames.org/searchJSON?adminCode1=${stateCode}&country=${countryIsoAlpha2}&username=${GEONAMES_USERNAME}`;
            try {
                const response = await fetch(requestUrl);
                const data = await response.json();
                if (Array.isArray(data.geonames)) {
                    setCities(data.geonames);
                    console.log(cities)
                    
                    const city = data.geonames.find((c: City) => c.name === details.org_city);
                    if (city) {
                        setFieldValue('org_city', city.name);
                        setFieldValue('org_zipcode', details.org_zipcode || '');
                    }
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        }
    };

    const handleCountryChange = async (option: { value: number; label: string } | null) => {
        setFieldValue('org_country', option ? option.label : '');
        setFieldValue('org_state', ''); 
        setFieldValue('org_city', '');
        
        if (option?.value) {
            fetchStates(option.value);
        }
    };

    const handleStateChange = async (option: { value: string; label: string } | null) => {
        setFieldValue('org_state', option ? option.label : '');
        setFieldValue('org_city', ''); 

        if (option?.value) {
            fetchCities(option.value);
        }
    };

    const countryOptions = countries.map(country => ({
        value: country.geonameId,
        label: country.name,
    }));

    const stateOptions = states.map(state => ({
        value: state.adminCode1,
        label: state.name,
    }));

    const cityOptions = cities.map(city => ({
        value: city.geonameId,
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
    // function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    //     if (e.target.files && e.target.files.length > 0) {
    //         const selectedFile = e.target.files[0];
    //         setFile(URL.createObjectURL(selectedFile));
    //         setFileName(selectedFile.name);
    //         setFieldValue("org_logo", fileName);
    //     }
    // }
    function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            const fileURL = URL.createObjectURL(selectedFile);
            setFile(fileURL);
            setFileName(selectedFile.name);
            setFieldValue("org_logo", selectedFile);
        }
    }

    return (
        <>
            <Form className="">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <FormItem label="Organization Name" asterisk>
                        <Field
                            component={Input}
                            type="text"
                            name="organization"
                            // value={details?.organization}
                            placeholder="Organization Name"
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>

                    <FormItem label="Email" asterisk >
                        <Field
                            component={Input}
                            type="text"
                            name="email"
                            placeholder="Email"
                            // value={details?.email}
                            disabled
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>

                    <FormItem label="Organization Email" asterisk>
                        <Field
                            component={Input}
                            type="text"
                            name="org_email"
                            placeholder="Organization Email"
                        // value={details?.org_email}
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>

                    <FormItem label="Contact Number" asterisk>
                        <Field name='org_phone' placeholder="Contact Number" type="text"
                        // value={details?.org_phone}
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

                    <FormItem label="Website" asterisk>
                        <Field
                            component={Input}
                            type="text"
                            name="org_website"
                            placeholder="Website"
                        // value={details?.org_website}
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
                        // value={details?.vat_tax_gst_number}
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>

                    <FormItem label="Logo Preview">
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
                                margin: '0 auto', // Center the circle
                            }}>
                                <img
                                    src={file}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover' // Ensures the image covers the circle
                                    }}
                                />
                            </div>
                        )}
                    </FormItem>
                    {/* <FormItem label="Upload Logo">
                        <Field
                            component={Input}
                            type="file"
                            name="org_logo"
                            onChange={handleImage}
                            accept="image/*"
                            ref={fileInputRef}
                        >
                        </Field>
                        <ErrorMessage
                            name="org_logo"
                            component="div"
                            className="text-red-600"
                        />
                    </FormItem> */}
                    <FormItem label="Upload Logo">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImage} // Handle change directly
                            ref={fileInputRef}
                            style={{ display: 'none' }} // Hide the file input if needed
                        />
                        <Field name="org_logo">
                            {({ field, form }) => (
                                <Input
                                    {...field}
                                    type="text" // Show a text input if needed to display file name
                                    value={fileName} // Use your state for file name display
                                    readOnly
                                    onClick={() => fileInputRef.current.click()} // Trigger file input on click
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
                    {/* <FormItem label="Organization Address" asterisk>
                        <Field
                            component={Input}
                            type="text"
                            name="org_address"
                            placeholder="Organization Address"
                        // value={details?.org_address}
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>
                    <FormItem label="Country" asterisk>
                        <Field name="org_country">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    options={countryOptions}
                                    onChange={handleCountryChange}
                                    value={countryOptions.find(option => option.label === country1)
                                        // || details?.org_country   
                                    }
                                    placeholder="Select Country"
                                />
                            )}
                        </Field>
                        <ErrorMessage name="org_country" component="div" className="text-red-600" />
                    </FormItem>

                    <FormItem label="State" asterisk>
                        <Select
                            name='org_state'
                            options={stateOptions}
                            onChange={handleStateChange}
                            value={stateOptions.find(option => option.value === selectedState) || null}
                            placeholder="Select State"
                        />
                        <ErrorMessage name="state" component="div" className="text-red-600" />
                    </FormItem>

                    <FormItem label="City" asterisk>
                        <Select
                            name='org_city'
                            options={cityOptions}
                            onChange={(option) => {
                                const cityName = option?.label || '';
                                setSelectedCity(cityName);
                            }}
                            value={cityOptions.find(option => option.label === selectedCity) || null}
                            placeholder="Select City"
                        />
                        <ErrorMessage name="city" component="div" className="text-red-600" />
                    </FormItem>

                    <FormItem label="ZIP Code" asterisk>
                        <Field
                            component={Input}
                            type="text"
                            name="org_zipcode"
                            placeholder="ZIP Code"
                        // value={details?.org_zipcode}
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem> */}
                    <FormItem label="Organisation Address" asterisk>
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

                    <FormItem label="Organisation State" asterisk>
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

                    <FormItem label="Organisation City" asterisk>
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