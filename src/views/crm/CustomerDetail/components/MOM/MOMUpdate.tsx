import { useEffect, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import CreatableSelect from 'react-select/creatable'
import { Button, DatePicker, FormItem, Notification, Select, toast } from '@/components/ui'
import { apiCreateMom, apiGetCrmProjectsSingleMom, apiGetMomUpdate } from '@/services/CrmService'
import { useLocation, useNavigate } from 'react-router-dom'
import { StickyFooter } from '@/components/shared'
import App from './Richtext'

type Option = {
  value: string
  label: string
}

const YourFormComponent = () => {
  const navigate = useNavigate()
  const [details, setDetails] = useState<any>({})
  const [initialValues, setInitialValues] = useState<any>({})

  interface QueryParams {
    project_id: string
    mom_id: string
  }

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const allQueryParams: QueryParams = {
    project_id: queryParams.get('project_id') || '',
    mom_id: queryParams.get('mom_id') || '',
  }

  const optionsSource = [
    { value: 'At Office', label: 'At Office' },
    { value: 'At Site', label: 'At Site' },
    { value: 'At Client place', label: 'At Client Place' },
    { value: 'Other', label: 'Other' },
  ]

  useEffect(() => {
    const fetchDataAndSetValues = async () => {
      try {
        const response = await apiGetCrmProjectsSingleMom(allQueryParams.project_id, allQueryParams.mom_id)
        const fetchedDetails = response.data.mom_data[0]
        setDetails(fetchedDetails)
        const clientOptions = fetchedDetails.attendees.client_name.map((item: string) => ({
          value: item,
          label: item,
        })) || []

        const organisorOptions = fetchedDetails.attendees.organisor?.map((item: string) => ({
          value: item,
          label: item,
        })) || []

        setInitialValues({
          client_name: clientOptions,
          organisor: organisorOptions,
          meetingdate: new Date(fetchedDetails.meetingdate),
          location: fetchedDetails.location || '',
          remark: fetchedDetails.remark || '',
          project_id: allQueryParams.project_id,
        })
      } catch (error) {
        console.error('Error fetching MOM data', error)
      }
    }

    fetchDataAndSetValues()
  }, [allQueryParams.project_id, allQueryParams.mom_id])

  return (
    <div>
      <h3 className='mb-5'>Update MOM</h3>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          client_name: Yup.array().min(1, 'Client Name is required'),
          organisor: Yup.array().min(1, 'Organisor Name is required'),
          meetingdate: Yup.string().required('Meeting Date is required'),
          location: Yup.string().required('Location is required'),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          console.log('values', values);
          const payload = {
            client_name: values.client_name.map((option:any) => option.value), 
            organisor: values.organisor.map((option:any) => option.value),     
            meetingdate: values.meetingdate,
            location: values.location,
            remark: values.remark,
            project_id: values.project_id,
            mom_id: allQueryParams.mom_id,
          }
          const formData = new FormData()
          formData.append('client_name', JSON.stringify(payload.client_name))
          formData.append('organisor', JSON.stringify(payload.organisor))
          formData.append('meetingdate', payload.meetingdate)
          formData.append('location', payload.location)
          formData.append('remark', payload.remark)
          formData.append('project_id', payload.project_id)
          formData.append('mom_id', allQueryParams.mom_id)
          console.log('payload', payload);
          console.log('payload', formData);
          

          try {
            const response = await apiGetMomUpdate(formData,allQueryParams.project_id,allQueryParams.mom_id)
            if (response.code === 200) {
              setSubmitting(false)
              toast.push(
                <Notification closable type="success" duration={2000}>
                  MOM Updated Successfully
                </Notification>
              )
              // window.location.reload()
              // navigate(-1)
            } else {
              toast.push(
                <Notification closable type="danger" duration={2000}>
                  {response.errorMessage}
                </Notification>
              )
            }
          } catch (error) {
            setSubmitting(false)
            toast.push(
              <Notification closable type="danger" duration={2000}>
                Internal server error
              </Notification>
            )
          }
        }}
      >
        {({ errors, setFieldValue, isSubmitting, values }:any) => (
          <Form>
            <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-5'>
              <FormItem label="Client's Name" asterisk>
                <Field name="client_name">
                  {({ field, form }: any) => {
                    return (
                      <>
                        <CreatableSelect
                          isMulti
                          value={values.client_name}
                          name="client_name"
                          onChange={(selectedOptions: any) => {
                            const formattedValues = selectedOptions
                              ? selectedOptions.map((option: any) => ({ value: option.value, label: option.label }))
                              : []
                            setFieldValue('client_name', formattedValues)
                          }}
                          options={details.client_name?.map((item: string) => ({
                            value: item,
                            label: item,
                          })) || []}
                        />
                        {errors.client_name && (
                          <span className='text-red-500'>{errors.client_name}</span>
                        )}
                      </>
                    )
                  }}
                </Field>
              </FormItem>

              <FormItem label="Organised By" asterisk>
                <Field name="organisor">
                  {({ field, form }: any) => (
                    <CreatableSelect
                      isMulti
                      value={values.organisor}
                      onChange={(selectedOptions) => {
                        const formattedValues = selectedOptions
                          ? selectedOptions.map((option: any) => ({ value: option.value, label: option.label }))
                          : []
                        setFieldValue('organisor', formattedValues)
                      }}
                      options={details.organisor?.map((item: string) => ({
                        value: item,
                        label: item,
                      })) || []}
                    />
                  )}
                </Field>
                {errors.organisor && (
                  <span className='text-red-500'>{errors.organisor}</span>
                )}
              </FormItem>

              <FormItem label='Date' asterisk>
                <Field
                name='meetingdate'>
                  {({ field, form }: any) => (
                <DatePicker
                  value={field.value}
                  inputFormat='DD-MM-YYYY'
                  onChange={(date) =>
                    setFieldValue('meetingdate', date ? `${date}` : '')
                  }
                />)}
                </Field>
                {errors.meetingDate && (
                  <span className='text-red-500'>{errors.meetingDate}</span>
                )}
              </FormItem>

              <FormItem label='Location' asterisk>
                <Select
                  options={optionsSource}
                  value={optionsSource.find((option) => option.value === values.location)}
                  onChange={(selectedOption) =>
                    setFieldValue('location', selectedOption?.value)
                  }
                />
                {errors.location && (
                  <span className='text-red-500'>{errors.location}</span>
                )}
              </FormItem>
            </div>

            <div className='lg:mb-32'>
              <App
                value={values.remark}
                onChange={(value) => setFieldValue('remark', value)}
              />
            </div>

            <StickyFooter 
            className="-mx-8 px-8 flex items-center gap-3 py-4"
                stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <Button type='submit' variant='solid' size='sm' loading={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button type='button' onClick={() => navigate(-1)} size='sm'>
                Discard
              </Button>
            </StickyFooter>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default YourFormComponent
