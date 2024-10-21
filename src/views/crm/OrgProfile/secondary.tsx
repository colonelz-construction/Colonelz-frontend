import React, { SyntheticEvent, createContext, useEffect, useState, useRef } from 'react'
import makeAnimated from 'react-select/animated'
import { Formik, Field, Form, ErrorMessage, FieldProps, useFormikContext, FormikProps, FormikValues } from 'formik'
import * as Yup from 'yup'
import { Button, Checkbox, DatePicker, FormItem, Input, InputGroup, Notification, Select, toast } from '@/components/ui'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiGetBillingData, apiEditBillingData } from '@/services/CrmService'


const GEONAMES_USERNAME = import.meta.env.VITE_APP_USERNAME

const org_id: any = localStorage.getItem('orgId')
const userId: any = localStorage.getItem('userId')
console.log(org_id)

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
    billing_shipping_address: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;

}

const validationSchema = Yup.object().shape({

})

export const FormikValuesContext = createContext(null);

const Address = () => {

    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)

    const [details, setDetails] = useState<any>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiGetBillingData(org_id);
                console.log(response)
                setDetails(response.data);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, [])

    const handleSubmit = async (values: FormValues, setSubmitting: (isSubmitting: boolean) => void) => {
        console.log(values)
        setIsLoading(true);
        const formData = new FormData();
        formData.append('billing_shipping_address', values.billing_shipping_address)
        formData.append('country', values.country)
        formData.append('city', values.city)
        formData.append('state', values.state)
        formData.append('zipcode', values.zipcode)
        formData.append('org_id', org_id)
        formData.append('userId', userId)

        const response = await apiEditBillingData(formData);
        setIsLoading(false);
        setSubmitting(false)
        if (response.code === 200) {
            toast.push(
                <Notification type='success' duration={2000}>
                    Details Updated Succesfully.
                </Notification>
            )
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
                initialValues={{
                    billing_shipping_address: details?.billing_shipping_address,
                    org_id,
                    userId,
                    country: details?.country,
                    city: details?.city,
                    state: details?.state,
                    zipcode: details?.zipCode,
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    setSubmitting(true)
                        await handleSubmit(values, setSubmitting)
                }}
                validateOnChange={true}
                validateOnBlur={true}
                enableReinitialize
            >
                <FormContent details={details} />
            </Formik>
        </>
    )
}

const FormContent = ({ details }: any) => {
    const { setFieldValue, values } = useFormikContext<FormValues>();
    const [countries, setCountries] = useState<Country[]>([]);
    const [country1, setCountry1] = useState<any>();
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string | number | null>(null);
    const [selectedState, setSelectedState] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [zipCode, setZipCode] = useState<string>('');

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
                } else {
                    console.error('Unexpected data structure:', data);
                }
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };

        fetchCountries();
    }, []);

    const handleCountryChange = async (option: { value: number; label: string } | null) => {
        const countryGeonameId = option?.value || null;
        const country1 = option?.label || null;
        setSelectedCountry(countryGeonameId);
        setCountry1(country1);
        setSelectedState('');
        setSelectedCity('');
        setStates([]);
        setCities([]);

        if (countryGeonameId) {
            try {
                const response = await fetch(`http://api.geonames.org/childrenJSON?geonameId=${countryGeonameId}&username=${GEONAMES_USERNAME}`);
                const data = await response.json();

                if (Array.isArray(data.geonames)) {
                    setStates(data.geonames);
                } else {
                    console.error('Unexpected data structure:', data);
                }
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        }
    };

    const handleStateChange = async (option: { value: string; label: string } | null) => {
        const stateCode = option?.value || '';
        setSelectedState(stateCode);
        setSelectedCity('');

        if (stateCode && selectedCountry) {
            const countryIsoAlpha2 = countries.find(c => c.geonameId === selectedCountry)?.isoAlpha2;

            if (countryIsoAlpha2) {
                const requestUrl = `http://api.geonames.org/searchJSON?adminCode1=${stateCode}&country=${countryIsoAlpha2}&username=${GEONAMES_USERNAME}`;

                try {
                    const response = await fetch(requestUrl);
                    const data = await response.json();

                    if (data.geonames && Array.isArray(data.geonames)) {
                        setCities(data.geonames);
                    } else {
                        console.error('Unexpected data structure:', data);
                    }
                } catch (error) {
                    console.error('Error fetching cities:', error);
                }
            } else {
                console.error('Invalid country ISO code for selected country:', selectedCountry);
            }
        }
    };

    const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const code = e.target.value;
        setZipCode(code);
        console.log(code);
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

    return(
<Form className="">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    <FormItem label="Billing & Shipping Address" asterisk>
                        <Field
                            component={Input}
                            type="text"
                            name="billing_shipping_address"
                            placeholder="Billing & Shipping Address"
                            // value={details?.org_address}
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>
                    <FormItem label="Country" asterisk>
                    <Field name="country">
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
                        <ErrorMessage name="country" component="div" className="text-red-600" />
                    </FormItem>
                    {selectedCountry && (
                        <FormItem label="State" asterisk>
                            <Select
                            name='state'
                                options={stateOptions}
                                onChange={handleStateChange}
                                value={stateOptions.find(option => option.value === selectedState) || null}
                                placeholder="Select State"
                            />
                            <ErrorMessage name="state" component="div" className="text-red-600" />
                        </FormItem>
                    )}
                    {selectedState && (
                        <FormItem label="City" asterisk>
                            <Select
                            name='city'
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
                    )}
                    <FormItem label="ZIP Code" asterisk>
                        <Field
                            component={Input}
                            type="text"
                            name="zipcode"
                            placeholder="ZIP Code"
                            // value={details?.org_zipcode}
                        />
                        <ErrorMessage
                            name="type"
                            component="div"
                            className=" text-red-600"
                        />
                    </FormItem>
                </div>
                <Button variant='solid' type='submit'>Update</Button>
            </Form>
    )
}

export default Address