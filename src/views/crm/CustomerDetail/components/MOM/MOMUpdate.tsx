import { useEffect, useRef, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import CreatableSelect from 'react-select/creatable'
import { Button, DatePicker, FormItem, Notification, Select, toast } from '@/components/ui'
import { apiCreateMom, apiGetCrmProjectsSingleMom, apiGetMomUpdate } from '@/services/CrmService'
import { useLocation, useNavigate } from 'react-router-dom'
import { StickyFooter } from '@/components/shared'
import App from './Richtext'
import useDarkMode from '@/utils/hooks/useDarkmode'
// import { MultiInputOptions } from './MomForm'


type Option = {
    value: string
    label: string
}

// type ValidationType = 'number' | 'email' | 'text';

interface MultiInputOptionsProps {
  value?: Option[];
  onChange: (val: Option[]) => void;
  type?: 'text' | 'email' | 'number';
  placeholder?: string;
  errorMessage?: string;
  minLength?: number;
  maxLength?: number;
  options?: Option[];
}

export const MultiInputOptions = ({
  value = [],
  onChange,
  type = 'text',
  placeholder = 'Enter value',
  errorMessage,
  minLength = 1,
  maxLength = Infinity,
  options = [],
}: MultiInputOptionsProps) => {
  const [isDark, setIsDark] = useDarkMode()
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  const validators: Record<'text' | 'email' | 'number', RegExp> = {
      text: /^[a-zA-Z0-9-\s]*$/,
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      number: /^[0-9\s]*$/,
  };

  const filteredOptions = options?.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (type === 'email' || validators[type].test(newValue)) {
          setInputValue(newValue);
          setDropdownVisible(true);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
          const sanitizedValue = inputValue.trim();
          const isValid =
              sanitizedValue.length >= minLength &&
              sanitizedValue.length <= maxLength &&
              (type !== 'email' || validators.email.test(sanitizedValue));

          const isDuplicate = value.some(
              (v) => v.value.toLowerCase() === sanitizedValue.toLowerCase()
          );

          if (!isValid) {
              setError(
                  errorMessage ||
                      `Value must be ${
                          minLength === maxLength
                              ? `exactly ${minLength}`
                              : `between ${minLength} and ${maxLength}`
                      } characters${type === 'email' ? ' and a valid email address' : ''}.`
              );
          } else if (isDuplicate) {
              setError('This value is already added.');
          } else {
              setError(null);
              onChange([...value, { value: sanitizedValue, label: sanitizedValue }]);
              setInputValue('');
          }
          e.preventDefault();
      }
  };

  const handleRemove = (index: number) => {
      const newValue = value.filter((_, i) => i !== index);
      onChange(newValue);
  };

  const handleOptionSelect = (option: Option) => {
      if (!value.some((v) => v.value === option.value)) {
          onChange([...value, option]);
      }
      setInputValue('');
      setDropdownVisible(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
          setDropdownVisible(false);
      }
  };

  useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

  return (
      <div ref={ref}>
          <div className={`border-[0.03rem] ${isDark ? "border-[#4B5563]" : "border-[#D1D5DB]"} rounded-md p-1`}>
              <div className="flex flex-wrap gap-2">
                  {value.map((val, index) => (
                      <div
                          key={index}
                          className="flex items-center gap-1 bg-[#F3F4F6] px-2 py-1 rounded"
                      >
                          <span className="font-semibold">{val.label}</span>
                          <button
                              type="button"
                              className="font-semibold"
                              onClick={() => handleRemove(index)}
                          >
                              &times;
                          </button>
                      </div>
                  ))}
              </div>
              <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className={`mt-1 border-none rounded px-2 py-1 w-full outline-none ${isDark && "bg-[#1F2937]"}`}
                  onFocus={() => setDropdownVisible(true)}
              />
              {isDropdownVisible && filteredOptions.length > 0 && (
                  <div className="mt-1 absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                      {filteredOptions.map((option, index) => (
                          <div
                              key={index}
                              className="px-2 py-1 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleOptionSelect(option)}
                          >
                              {option.label}
                          </div>
                      ))}
                  </div>
              )}
          </div>
          {error && <div className="text-red-600 mt-1">{error}</div>}
      </div>
  );
};


const YourFormComponent = () => {
  const navigate = useNavigate()
  const [details, setDetails] = useState<any>({})
  const [initialValues, setInitialValues] = useState<any>({})
  const [imgAttributes, setImgAttributes] = useState<any>({ width: '', style: '' });
  const org_id = localStorage.getItem('orgId')

  // console.log(initialValues.remark)
  // console.log(imgAttributes)

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
        const response:any = await apiGetCrmProjectsSingleMom(allQueryParams.project_id, allQueryParams.mom_id, org_id)
        const fetchedDetails = response.data[0]
        setDetails(fetchedDetails)
        const clientOptions = fetchedDetails.attendees.client_name.map((item: string) => ({
          value: item,
          label: item,
        })) || []

        const organisorOptions = fetchedDetails.attendees.organisor?.map((item: string) => ({
          value: item,
          label: item,
        })) || []

        // console.log(clientOptions)
        // console.log(organisorOptions)

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

  useEffect(() => {
    // Create a temporary DOM element to parse the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(initialValues.remark, 'text/html');

    // Get the img element
    const img = doc.querySelector('img');

    if (img) {
      // Extract attributes
      const width = img.getAttribute('width');
      const cursorStyle = img.style.cursor;

      setImgAttributes({
        width: width,
        style: cursorStyle,
      });
    }
  }, [initialValues.remark]);

  return (
    <div>
      <h3 className='mb-5'>Update MOM</h3>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={
          Yup.object().shape({
          // client_name: Yup.array().min(1, 'Client Name is required'),
          // organisor: Yup.array().min(1, 'Organisor Name is required'),
          meetingdate: Yup.string().required('Meeting Date is required'),
          location: Yup.string().required('Location is required'),
        })
      }
        onSubmit={async (values, { setSubmitting }) => {
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
          
          

          try {
            const response = await apiGetMomUpdate(formData,allQueryParams.project_id,allQueryParams.mom_id, org_id)
            if (response.code === 200) {
              setSubmitting(false)
              toast.push(
                <Notification closable type="success" duration={2000}>
                  MOM Updated Successfully
                </Notification>
              )
              window.location.reload()
              navigate(-1)
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

                  {({ form }: { form: any }) => {
                    return (
                        <MultiInputOptions
                        value={form.values.client_name}
                        onChange={(val) => form.setFieldValue('client_name', val)}
                        type="text"
                        placeholder="Client Name"
                        options={[]}
                        minLength={3}
                        maxLength={60}
                        errorMessage="Name must have at least 3 characters."
                    />
                    )
                  }}
                </Field>
              </FormItem>

              <FormItem label="Organised By" asterisk>
                <Field name="organisor">
                  {({ form }: { form: any }) => {
                    return (
                        <MultiInputOptions
                        value={form.values.organisor}
                        onChange={(val) => form.setFieldValue('organisor', val)}
                        type="text"
                        placeholder="Organisor"
                        options={[]}
                        minLength={3}
                        maxLength={60}
                        errorMessage="Name must have at least 3 characters."
                    />
                    )
                  }}
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
                {/* {errors.location && (
                  <span className='text-red-500'>{errors.location}</span>
                )} */}
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
