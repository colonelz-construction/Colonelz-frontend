import { useEffect, useState } from 'react';
import { Formik, Field, Form, ErrorMessage, FieldProps } from 'formik';
import * as Yup from 'yup';
import { Button, FormItem, Input, Notification, Select, toast, Checkbox } from '@/components/ui';
import { apiGetBillingData, apiEditBillingData } from '@/services/CrmService';
import { Country, State, City } from 'country-state-city';
 
const org_id: any = localStorage.getItem('orgId');
const userId: any = localStorage.getItem('userId');
 
interface FormValues {
    billing_address: string;
    billing_country: string;
    billing_state: string;
    billing_city: string;
    billing_zipcode: string;
 
    shipping_address: string;
    shipping_country: string;
    shipping_state: string;
    shipping_city: string;
    shipping_zipcode: string;
 
    sameAsBilling?: any;
}
 
const validationSchema = Yup.object().shape({
    // billing_shipping_address: Yup.string().required('Address is required'),
    // country: Yup.string().required('Country is required'),
    // state: Yup.string().required('State is required'),
    // city: Yup.string().required('City is required'),
    // zipcode: Yup.string().required('ZIP Code is required'),
});
 
const Address = () => {
    const [details, setDetails] = useState<FormValues | null>(null);
    const [sameAsBilling, setSameAsBilling] = useState<any>(false);
    const [initialValues, setInitialValues] = useState<FormValues>({
        billing_address: '',
        billing_country: '',
        billing_state: '',
        billing_city: '',
        billing_zipcode: '',
 
        shipping_address: '',
        shipping_country: '',
        shipping_state: '',
        shipping_city: '',
        shipping_zipcode: '',
    });
 
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
        if (details) {
            setInitialValues({
                billing_address: details.billing_address || '',
                billing_country: details.billing_country || '',
                billing_state: details.billing_state || '',
                billing_city: details.billing_city || '',
                billing_zipcode: details.billing_zipcode || '',
 
                shipping_address: details.shipping_address || '',
                shipping_country: details.shipping_country || '',
                shipping_state: details.shipping_state || '',
                shipping_city: details.shipping_city || '',
                shipping_zipcode: details.shipping_zipcode || '',
 
            });
            setSameAsBilling(details.sameAsBilling);
        }
    }, [details]);
 
    const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => formData.append(key, value));
        formData.append('org_id', org_id || '');
        formData.append('userId', userId || '');
        formData.append('sameAsBilling', sameAsBilling);
 
        const response = await apiEditBillingData(formData);
        setSubmitting(false);
 
        toast.push(
            <Notification type={response.code === 200 ? 'success' : 'danger'} duration={2000}>
                {response.code === 200 ? 'Details Updated Successfully.' : response.errorMessage}
            </Notification>
        );
 
        if (response.code === 200) window.location.reload();
    };
 
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ setFieldValue, values }) => (
                <FormContent setSameAsBilling={setSameAsBilling} sameAsBilling={sameAsBilling} setFieldValue={setFieldValue} values={values} details={details} />
            )}
        </Formik>
    );
};
 
const FormContent = ({ setFieldValue, values, details, setSameAsBilling, sameAsBilling }: { setFieldValue: (field: string, value: any) => void; values: FormValues; details: FormValues | null, setSameAsBilling:any,  sameAsBilling:any}) => {
    const [billingStates, setBillingStates] = useState<any[]>([]);
    const [billingCities, setBillingCities] = useState<any[]>([]);
    const [shippingStates, setShippingStates] = useState<any[]>([]);
    const [shippingCities, setShippingCities] = useState<any[]>([]);
   
 
    const countries = Country.getAllCountries().map(country => ({
        value: country.isoCode,
        label: country.name,
    }));
 
    useEffect(() => {
        if (sameAsBilling) {
            setFieldValue('shipping_address', values.billing_address);
            setFieldValue('shipping_country', values.billing_country);
            setFieldValue('shipping_state', values.billing_state);
            setFieldValue('shipping_city', values.billing_city);
            setFieldValue('shipping_zipcode', values.billing_zipcode);
        }
    }, [sameAsBilling, values.billing_address, values.billing_country, values.billing_state, values.billing_city, values.billing_zipcode]);
 
    useEffect(() => {
        if (values.billing_country) {
            const statesList = State.getStatesOfCountry(values.billing_country);
            setBillingStates(statesList);
            setBillingCities([]);
            if (!statesList.some(state => state.isoCode === values.billing_state)) {
                setFieldValue('billing_state', '');
                setFieldValue('billing_city', '');
            }
        } else {
            setBillingStates([]);
            setBillingCities([]);
        }
    }, [values.billing_country]);
 
    useEffect(() => {
        if (values.billing_state) {
            const citiesList = City.getCitiesOfState(values.billing_country, values.billing_state);
            setBillingCities(citiesList);
            if (!citiesList.some(city => city.name === values.billing_city)) {
                setFieldValue('billing_city', '');
            }
        } else {
            setBillingCities([]);
        }
    }, [values.billing_state]);
 
    useEffect(() => {
        if (values.shipping_country) {
            const statesList = State.getStatesOfCountry(values.shipping_country);
            setShippingStates(statesList);
            setShippingCities([]);
            if (!statesList.some(state => state.isoCode === values.shipping_state)) {
                setFieldValue('shipping_state', '');
                setFieldValue('shipping_city', '');
            }
        } else {
            setShippingStates([]);
            setShippingCities([]);
        }
    }, [values.shipping_country]);
 
    useEffect(() => {
        if (values.shipping_state) {
            const citiesList = City.getCitiesOfState(values.shipping_country, values.shipping_state);
            setShippingCities(citiesList);
            if (!citiesList.some(city => city.name === values.shipping_city)) {
                setFieldValue('shipping_city', '');
            }
        } else {
            setShippingCities([]);
        }
    }, [values.shipping_state]);
 
    return (
        <Form>
            <h4 className='mb-3'>Billing Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormItem label="Billing Address">
                    <Field component={Input} type="text" name="billing_address" placeholder="Billing Address" />
                    <ErrorMessage name="billing_address" component="div" className="text-red-600" />
                </FormItem>
 
                <FormItem label="Billing Country">
                    <Field name="billing_country">
                        {({ field }: FieldProps) => (
                            <Select
                                options={countries}
                                onChange={(option) => setFieldValue('billing_country', option?.value || '')}
                                value={countries.find(option => option.value === field.value) || null}
                                placeholder="Select Country"
                            />
                        )}
                    </Field>
                    <ErrorMessage name="billing_country" component="div" className="text-red-600" />
                </FormItem>
 
                <FormItem label="Billing State">
                    <Field name="billing_state">
                        {({ field }: FieldProps) => (
                            <Select
                                options={billingStates.map(state => ({ value: state.isoCode, label: state.name }))}
                                onChange={(option) => {
                                    setFieldValue('billing_state', option?.value || '');
                                    setFieldValue('billing_city', '');
                                }}
                                value={billingStates.find(state => state.isoCode === field.value) ? { value: field.value, label: billingStates.find(state => state.isoCode === field.value)?.name || '' } : null}
                                placeholder="Select State"
                                isDisabled={!values.billing_country}
                            />
                        )}
                    </Field>
                    <ErrorMessage name="billing_state" component="div" className="text-red-600" />
                </FormItem>
 
                <FormItem label="Billing City">
                    <Field name="billing_city">
                        {({ field }: FieldProps) => (
                            <Select
                                options={billingCities.map(city => ({ value: city.name, label: city.name }))}
                                onChange={(option) => setFieldValue('billing_city', option?.value || '')}
                                value={billingCities.find(city => city.name === field.value) ? { value: field.value, label: field.value } : null}
                                placeholder="Select City"
                                isDisabled={!values.billing_state}
                            />
                        )}
                    </Field>
                    <ErrorMessage name="billing_city" component="div" className="text-red-600" />
                </FormItem>
 
                <FormItem label="Billing ZIP Code">
                    <Field component={Input} type="text" name="billing_zipcode" placeholder="ZIP Code" />
                    <ErrorMessage name="billing_zipcode" component="div" className="text-red-600" />
                </FormItem>
            </div>
 
            <div className="my-4">
                <Checkbox
                    checked={sameAsBilling}
                    onChange={(checked) => setSameAsBilling(checked)}
                >
                    Shipping details are the same as billing details
                </Checkbox>
            </div>
 
            <h4 className='mb-3'>Shipping Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormItem label="Shipping Address">
                    <Field component={Input} type="text" name="shipping_address" placeholder="Shipping Address" disabled={sameAsBilling} />
                    <ErrorMessage name="shipping_address" component="div" className="text-red-600" />
                </FormItem>
 
                <FormItem label="Shipping Country">
                    <Field name="shipping_country">
                        {({ field }: FieldProps) => (
                            <Select
                                options={countries}
                                onChange={(option) => setFieldValue('shipping_country', option?.value || '')}
                                value={countries.find(option => option.value === field.value) || null}
                                placeholder="Select Country"
                                isDisabled={sameAsBilling}
                            />
                        )}
                    </Field>
                    <ErrorMessage name="shipping_country" component="div" className="text-red-600" />
                </FormItem>
 
                <FormItem label="Shipping State">
                    <Field name="shipping_state">
                        {({ field }: FieldProps) => (
                            <Select
                                options={shippingStates.map(state => ({ value: state.isoCode, label: state.name }))}
                                onChange={(option) => {
                                    setFieldValue('shipping_state', option?.value || '');
                                    setFieldValue('shipping_city', '');
                                }}
                                value={shippingStates.find(state => state.isoCode === field.value) ? { value: field.value, label: shippingStates.find(state => state.isoCode === field.value)?.name || '' } : null}
                                placeholder="Select State"
                                isDisabled={sameAsBilling || !values.shipping_country}
                            />
                        )}
                    </Field>
                    <ErrorMessage name="shipping_state" component="div" className="text-red-600" />
                </FormItem>
 
                <FormItem label="Shipping City">
                    <Field name="shipping_city">
                        {({ field }: FieldProps) => (
                            <Select
                                options={shippingCities.map(city => ({ value: city.name, label: city.name }))}
                                onChange={(option) => setFieldValue('shipping_city', option?.value || '')}
                                value={shippingCities.find(city => city.name === field.value) ? { value: field.value, label: field.value } : null}
                                placeholder="Select City"
                                isDisabled={sameAsBilling || !values.shipping_state}
                            />
                        )}
                    </Field>
                    <ErrorMessage name="shipping_city" component="div" className="text-red-600" />
                </FormItem>
 
                <FormItem label="Shipping ZIP Code">
                    <Field component={Input} type="text" name="shipping_zipcode" placeholder="ZIP Code" disabled={sameAsBilling} />
                    <ErrorMessage name="shipping_zipcode" component="div" className="text-red-600" />
                </FormItem>
            </div>
 
            <Button variant="solid" type="submit">Update</Button>
        </Form>
    );
};
 
export default Address;