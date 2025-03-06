import { useEffect, useState } from 'react';
import { Formik, Field, Form, ErrorMessage, FieldProps } from 'formik';
import * as Yup from 'yup';
import { Button, FormItem, Input, Notification, Select, toast } from '@/components/ui';
import { apiGetBillingData, apiEditBillingData } from '@/services/CrmService';
import { Country, State, City } from 'country-state-city';

const org_id: any = localStorage.getItem('orgId');
const userId: any = localStorage.getItem('userId');


interface FormValues {
    billing_shipping_address: string;
    country: string;
    state: string;
    city: string;
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
    const [details, setDetails] = useState<FormValues | null>(null);
    const [initialValues, setInitialValues] = useState<FormValues>({
        billing_shipping_address: '',
        country: '',
        state: '',
        city: '',
        zipcode: '',
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
                billing_shipping_address: details.billing_shipping_address || '',
                country: details.country || '',
                state: details.state || '',
                city: details.city || '',
                zipcode: details.zipcode || '',
            });
        }
    }, [details]);

    const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => formData.append(key, value));
        formData.append('org_id', org_id || '');
        formData.append('userId', userId || '');

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
                <FormContent setFieldValue={setFieldValue} values={values} details={details} />
            )}
        </Formik>
    );
};

const FormContent = ({ setFieldValue, values, details }: { setFieldValue: (field: string, value: any) => void; values: FormValues; details: FormValues | null }) => {
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    const countries = Country.getAllCountries().map(country => ({
        value: country.isoCode,
        label: country.name,
    }));

    useEffect(() => {
        if (values.country) {
            const statesList = State.getStatesOfCountry(values.country);
            setStates(statesList);
            setCities([]);
            if (!statesList.some(state => state.isoCode === values.state)) {
                setFieldValue('state', '');
                setFieldValue('city', '');
            }
        } else {
            setStates([]);
            setCities([]);
        }
    }, [values.country]);

    useEffect(() => {
        if (values.state) {
            const citiesList = City.getCitiesOfState(values.country, values.state);
            setCities(citiesList);
            if (!citiesList.some(city => city.name === values.city)) {
                setFieldValue('city', '');
            }
        } else {
            setCities([]);
        }
    }, [values.state]);

    return (
        <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormItem label="Billing & Shipping Address">
                    <Field component={Input} type="text" name="billing_shipping_address" placeholder="Billing & Shipping Address" />
                    <ErrorMessage name="billing_shipping_address" component="div" className="text-red-600" />
                </FormItem>

                <FormItem label="Country">
                    <Field name="country">
                        {({ field }: FieldProps) => (
                            <Select
                                options={countries}
                                onChange={(option) => setFieldValue('country', option?.value || '')}
                                value={countries.find(option => option.value === field.value) || null}
                                placeholder="Select Country"
                            />
                        )}
                    </Field>
                    <ErrorMessage name="country" component="div" className="text-red-600" />
                </FormItem>

                <FormItem label="State">
                    <Field name="state">
                        {({ field }: FieldProps) => (
                            <Select
                                options={states.map(state => ({ value: state.isoCode, label: state.name }))}
                                onChange={(option) => {
                                    setFieldValue('state', option?.value || '');
                                    setFieldValue('city', '');
                                }}
                                value={states.find(state => state.isoCode === field.value) ? { value: field.value, label: states.find(state => state.isoCode === field.value)?.name || '' } : null}
                                placeholder="Select State"
                                isDisabled={!values.country}
                            />
                        )}
                    </Field>
                    <ErrorMessage name="state" component="div" className="text-red-600" />
                </FormItem>

                <FormItem label="City">
                    <Field name="city">
                        {({ field }: FieldProps) => (
                            <Select
                                options={cities.map(city => ({ value: city.name, label: city.name }))}
                                onChange={(option) => setFieldValue('city', option?.value || '')}
                                value={cities.find(city => city.name === field.value) ? { value: field.value, label: field.value } : null}
                                placeholder="Select City"
                                isDisabled={!values.state}
                            />
                        )}
                    </Field>
                    <ErrorMessage name="city" component="div" className="text-red-600" />
                </FormItem>

                <FormItem label="ZIP Code">
                    <Field component={Input} type="text" name="zipcode" placeholder="ZIP Code" />
                    <ErrorMessage name="zipcode" component="div" className="text-red-600" />
                </FormItem>
            </div>

            <Button variant="solid" type="submit">Update</Button>
        </Form>
    );
};

export default Address;
