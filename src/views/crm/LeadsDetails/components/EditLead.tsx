import { RichTextEditor } from '@/components/shared';
import { Button, Dialog, FormItem, Input, Notification, Select, toast } from '@/components/ui';
import DateTimepicker from '@/components/ui/DatePicker/DateTimepicker';
import { apiGetCrmEditLead, apiGetCrmLeadsUpdates } from '@/services/CrmService';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';

interface FormData {
  user_id: string;
  lead_id: string | null;
  lead_name: string;
  email: string;
  date: Date | null;
  phone: string;
  location: string;
  source: string;
  lead_manager: string;
}

const EditLead = ({ details }: any) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const LeadId = queryParams.get('id') || '';
  const data = details.data[0];
  console.log(data.name);

  const statusOptions = [
    { value: 'No Response', label: 'No Response' },
    { value: 'Not Contacted', label: 'Not Contacted' },
    { value: 'Follow Up', label: 'Follow Up' },
    { value: 'Interested', label: 'Interested' },
  ];

  return (
    <>
      <h3 className='mb-3'>Edit Lead</h3>

      <Formik
        initialValues={{
          user_id: localStorage.getItem('userId') || '',
          lead_id: LeadId,
          lead_name: data.name,
          email: data.email,
          date: new Date(data.date), // Convert string to Date object
          phone: data.phone,
          location: data.location,
          source: data.source,
          lead_manager: data.lead_manager,
        }}
        validationSchema={Yup.object().shape({
         lead_name: Yup.string().required('Lead Name is required'),
          email: Yup.string().email('Invalid email').required('Email is required'),
          phone: Yup.string()
          .required('Phone is required')
          .matches(/^[0-9]*$/, 'Phone number must be numeric')
          .length(10, 'Phone number must be exactly 10 digits'),          
          location: Yup.string().required('Location is required'),
          source: Yup.string().required('Source is required'),
          lead_manager: Yup.string().required('Lead Manager is required'),

        })}
        onSubmit={async (values: any, { setSubmitting }) => {
          setSubmitting(true);
          console.log(values);
          values.date=`${values.date}`; 

          const response = await apiGetCrmEditLead(values);
          if (response.code === 200) {
            toast.push(
              <Notification type='success' duration={2000} closable>
                Lead Updated Successfully
              </Notification>
            );
            window.location.reload();
          } else {
            toast.push(
              <Notification type='danger' duration={2000} closable>
                Error Updating Lead
              </Notification>
            );
          }
          setSubmitting(false);
        }}
      >
        {({ values, isSubmitting, errors,touched }:any) => (
          <Form className='max-h-96 overflow-y-auto'>
            <FormItem label='Lead Name'
            asterisk={true}
            invalid={errors.lead_name && touched.lead_name}
            errorMessage={errors.lead_name}

            >
              <Field component={Input} name='lead_name' placeholder='Enter Lead Name' />
            </FormItem>

            <FormItem label='Email'
            asterisk={true}
            invalid={errors.email && touched.email}
            errorMessage={errors.email}
            >
              <Field component={Input} name='email' placeholder='Enter Email' />
            </FormItem>

            <FormItem label='Phone'
            asterisk
            invalid={errors.phone && touched.phone}
            errorMessage={errors.phone}
            >
              <Field name='phone' placeholder=''>
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
            </FormItem>

            <FormItem label='Location'
            asterisk
            invalid={errors.location && touched.location}
            errorMessage={errors.location}
            >
              <Field component={Input} name='location' placeholder='Enter location' />
            </FormItem>

            <FormItem label='Source'
            asterisk
            invalid={errors.source && touched.source}
            errorMessage={errors.source}
            >
              <Field component={Input} name='source' placeholder='Enter Source' />
            </FormItem>

            <FormItem label='Lead Manager'
            asterisk
            invalid={errors.lead_manager && touched.lead_manager}
            errorMessage={errors.lead_manager}
            >
              <Field component={Input} name='lead_manager' placeholder='Enter lead manager' />
            </FormItem>

            <FormItem label='Created Date'
            asterisk
            invalid={errors.date && touched.date}
            errorMessage={errors.date}
            >
              <Field name='date'>
                {({ field, form }: any) => (
                  <DateTimepicker
                  maxDate={new Date()}
                    value={field.value}
                    onChange={(date) => form.setFieldValue('date', date)}
                  />
                )}
              </Field>
            </FormItem>

          
            <Button variant='solid' block loading={isSubmitting} type='submit'>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EditLead;