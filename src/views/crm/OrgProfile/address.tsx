import { useEffect, useState } from 'react';
import { Formik, Field, Form, ErrorMessage, FieldProps } from 'formik';
import * as Yup from 'yup';
import { Button, FormItem, Input, Notification, Select, toast } from '@/components/ui';
import { apiGetBillingData, apiEditBillingData } from '@/services/CrmService';

const apiToken = import.meta.env.VITE_API_TOKEN;
const userEmail = import.meta.env.VITE_USER_EMAIL;

const org_id: any = localStorage.getItem('orgId');
const userId: any = localStorage.getItem('userId');

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
    billing_shipping_address: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
}

const validationSchema = Yup.object().shape({
    // billing_shipping_address: Yup.string().required('Address is required'),
    // country: Yup.string().required('Country is required'),
    // state: Yup.string().required('State is required'),
    // city: Yup.string().required('City is required'),
    // zipcode: Yup.string().required('ZIP Code is required'),
});

const Address = () => {
    const [details, setDetails] = useState<any>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [authToken, setAuthToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiGetBillingData(org_id);
                setDetails(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

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
        billing_shipping_address: details?.billing_shipping_address || '',
        country: details?.country || '',
        city: details?.city || '',
        state: details?.state || '',
        zipcode: details?.zipcode || '',
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        const formData = new FormData();
        formData.append('billing_shipping_address', values.billing_shipping_address);
        formData.append('country', values.country);
        formData.append('city', values.city);
        formData.append('state', values.state);
        formData.append('zipcode', values.zipcode);
        formData.append('org_id', org_id);
        formData.append('userId', userId);

        const response = await apiEditBillingData(formData);
        setSubmitting(false);

        if (response.code === 200) {
            toast.push(
                <Notification type='success' duration={2000}>
                    Details Updated Successfully.
                </Notification>
            );
            window.location.reload();
        } else {
            toast.push(
                <Notification type='danger' duration={2000}>
                    {response.errorMessage}
                </Notification>
            );
        }
    };

    return (
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
                    authToken={authToken}
                />
            )}
        </Formik>
    );
};

const FormContent = ({ countries, details, setFieldValue, values, authToken }: { countries: Country[]; details: any; setFieldValue: (field: string, value: any) => void; values: FormValues; authToken: string | null }) => {
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    useEffect(() => {
        if (details && details.country) {
            const country = countries.find(c => c.name === details.country);
            if (country) {
                fetchStates(country.name);
                setFieldValue('country', country.name);
            }
        }
    }, [details, countries]);

    useEffect(() => {
        if (details && details.state) {
            setFieldValue('state', details.state);
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
            
            const state = data.find((s: State) => s.state_name === details.state);
                if (state) {
                    setFieldValue('state', state.state_name);
                    fetchCities(state.state_name);
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
                    
                    const city = data.find((c: City) => c.name === details.city);
                    if (city) {
                        setFieldValue('city', city.name);
                        setFieldValue('zipcode', details.zipcode || '');
                    }
                const formattedCities = data.map((city: any) => ({
                    name: city.city_name,
                }));
                setCities(formattedCities);
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
    };

    const handleCountryChange = async (option: { value: number; label: string } | null) => {
        setFieldValue('country', option ? option.label : '');
        setFieldValue('state', '');
        setFieldValue('city', '');

        if (option) {
            fetchStates(option.label);
        }
    };

    const handleStateChange = async (option: { value: string; label: string } | null) => {
        setFieldValue('state', option ? option.label : '');
        setFieldValue('city', '');

        if (option) {
            fetchCities(option.label);
            
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

    return (
        <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormItem label="Billing & Shipping Address" >
                    <Field
                        component={Input}
                        type="text"
                        name="billing_shipping_address"
                        placeholder="Billing & Shipping Address"
                    />
                    <ErrorMessage name="billing_shipping_address" component="div" className="text-red-600" />
                </FormItem>

                <FormItem label="Country" >
                    <Field name="country">
                        {({ field }: FieldProps) => (
                            <Select
                                options={countryOptions}
                                onChange={()=>handleCountryChange}
                                value={countryOptions.find(option => option.label === field.value) || null}
                                placeholder="Select Country"
                            />
                        )}
                    </Field>
                    <ErrorMessage name="country" component="div" className="text-red-600" />
                </FormItem>

                <FormItem label="State" >
                    <Field name="state">
                        {({ field }: FieldProps) => (
                            <Select
                                options={stateOptions}
                                onChange={handleStateChange}
                                value={stateOptions.find(option => option.label === field.value) || null}
                                placeholder="Select State"
                            />
                        )}
                    </Field>
                    <ErrorMessage name="state" component="div" className="text-red-600" />
                </FormItem>

                <FormItem label="City" >
                    <Field name="city">
                        {({ field }: FieldProps) => (
                            <Select
                                options={cityOptions}
                                onChange={(option) => {
                                    setFieldValue('city', option ? option.label : '');
                                }}
                                value={cityOptions.find(option => option.label === field.value) || null}
                                placeholder="Select City"
                            />
                        )}
                    </Field>
                    <ErrorMessage name="city" component="div" className="text-red-600" />
                </FormItem>

                <FormItem label="ZIP Code" >
                    <Field
                        component={Input}
                        type="text"
                        name="zipcode"
                        placeholder="ZIP Code"
                    />
                    <ErrorMessage name="zipcode" component="div" className="text-red-600" />
                </FormItem>
            </div>

            <Button variant='solid' type='submit'>Update</Button>
        </Form>
    );
};

export default Address;
