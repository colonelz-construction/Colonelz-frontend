import React, { useEffect, useState } from 'react';
import { Formik, Field, Form, ErrorMessage, FieldProps, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { Button, FormItem, Input, Notification, Select, toast } from '@/components/ui';
import { apiGetBillingData, apiEditBillingData } from '@/services/CrmService';

const GEONAMES_USERNAME = import.meta.env.VITE_APP_USERNAME;

const org_id: any = localStorage.getItem('orgId');
const userId: any = localStorage.getItem('userId');

interface Country {
    geonameId: number;
    name: string;
    isoAlpha2: string;
}

interface State {
    geonameId: number;
    name: string;
    adminCode1: string;
    countryCode: string;
}

interface City {
    geonameId: number;
    name: string;
}

interface FormValues {
    billing_shipping_address: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
}

const validationSchema = Yup.object().shape({
    billing_shipping_address: Yup.string().required('Address is required'),
    country: Yup.string().required('Country is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    zipcode: Yup.string().required('ZIP Code is required'),
});

const Address = () => {
    const [details, setDetails] = useState<any>(null);
    const [countries, setCountries] = useState<Country[]>([]);

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
                />
            )}
        </Formik>
    );
};

const FormContent = ({ countries, details, setFieldValue, values }: { countries: Country[]; details: any; setFieldValue: (field: string, value: any) => void; values: FormValues }) => {
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    useEffect(() => {
        if (details && details.country) {
            const country = countries.find(c => c.name === details.country);
            if (country) {
                fetchStates(country.geonameId , country.isoAlpha2);
                setFieldValue('country', country.name);
            }
        }
    }, [details, countries]);

    useEffect(() => {
        if (details && details.state) {
            // const selstate = states.find(c => c.name === details.state);
            // if(selstate){
            // fetchCities(selstate.adminCode1);
            // setFieldValue('state', selstate.name);
            // }
            setFieldValue('state',details.state);
        }
    }, [details
        // , states
    ]);

    const fetchStates = async (countryGeonameId: number, countryIsoAlpha2:any) => {
        try {
            const response = await fetch(`http://api.geonames.org/childrenJSON?geonameId=${countryGeonameId}&username=${GEONAMES_USERNAME}`);
            const data = await response.json();
            if (Array.isArray(data.geonames)) {
                setStates(data.geonames);
                console.log(states)
                
                const state = data.geonames.find((s: State) => s.name === details.state);
                if (state) {
                    setFieldValue('state', state.name); 
                    // console.log(state.adminCode1)
                    fetchCities(state.adminCode1 , countryIsoAlpha2); // Fetch cities based on the state
                }
            }
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    const fetchCities = async (stateCode: string, countryIsoAlpha2:any) => {
        if (countryIsoAlpha2) {
            const requestUrl = `http://api.geonames.org/searchJSON?adminCode1=${stateCode}&country=${countryIsoAlpha2}&username=${GEONAMES_USERNAME}`;
            try {
                const response = await fetch(requestUrl);
                const data = await response.json();
                if (Array.isArray(data.geonames)) {
                    setCities(data.geonames);
                    
                    const city = data.geonames.find((c: City) => c.name === details.city);
                    if (city) {
                        setFieldValue('city', city.name);
                        setFieldValue('zipcode', details.zipcode || '');
                    }
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        }
    };

    const handleCountryChange = async (option: { value: number; label: string } | null) => {
        const countryIsoAlpha2 = countries.find(c => c.name === option?.label)?.isoAlpha2;
        setFieldValue('country', option ? option.label : '');
        setFieldValue('state', ''); 
        setFieldValue('city', '');
        
        if (option?.value) {
            fetchStates(option.value, countryIsoAlpha2);
        }
    };

    const handleStateChange = async (option: { value: string; label: string } | null) => {
        const countryIsoAlpha2 = states.find(c => c.name === option?.label)?.countryCode;
        setFieldValue('state', option ? option.label : '');
        setFieldValue('city', ''); 

        if (option?.value) {
            fetchCities(option.value, countryIsoAlpha2);
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

    return (
        <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormItem label="Billing & Shipping Address" asterisk>
                    <Field
                        component={Input}
                        type="text"
                        name="billing_shipping_address"
                        placeholder="Billing & Shipping Address"
                    />
                    <ErrorMessage name="billing_shipping_address" component="div" className="text-red-600" />
                </FormItem>

                <FormItem label="Country" asterisk>
                    <Field name="country">
                        {({ field }: FieldProps) => (
                            <Select
                                options={countryOptions}
                                onChange={handleCountryChange}
                                value={countryOptions.find(option => option.label === field.value) || null}
                                placeholder="Select Country"
                            />
                        )}
                    </Field>
                    <ErrorMessage name="country" component="div" className="text-red-600" />
                </FormItem>

                <FormItem label="State" asterisk>
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

                <FormItem label="City" asterisk>
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

                <FormItem label="ZIP Code" asterisk>
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
