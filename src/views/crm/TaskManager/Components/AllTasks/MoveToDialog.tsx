import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, Form, Formik, FormikContext } from 'formik'
import { DatePicker, FormItem, Input, Notification, Select, toast } from '@/components/ui'
import { apiGetCrmMoveOpenTask, apiGetCrmOpenAddTask, apiGetCrmProjectsAddTask, apiGetUsersList } from '@/services/CrmService'
import * as Yup from 'yup'
import { AiOutlinePlus } from "react-icons/ai";
import { LuCornerUpRight } from "react-icons/lu";


type Task = {
    user_id: string;
    project_id: string;
    task_name: string;
    task_description: string;
    estimated_task_start_date: string;
    estimated_task_end_date: string;
    actual_task_start_date: string; 
    actual_task_end_date: string; 
    task_status: string; 
    task_priority: string; 
    task_assignee: string;
    reporter: string;
  };

const MoveToDialog = ({users, projectData, leadData, task_id}:any) => {
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState('Project')
    const org_id = localStorage.getItem('orgId')
    // console.log(task_id)

    // console.log(users)
    
    
const openDialog = () => {
    setIsOpen(true)
}

const onDialogClose = () => {
    setIsOpen(false)
}

const priorityOptions = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
  ];
  
  const statusOptions = [
    { label: "Pending", value: "Pending" },
    { label: "In Progress", value: "In Progress" },
    { label: "Cancelled", value: "Cancelled" },
  ];

//   console.log(userData)
  const projectOptions = projectData?.map((project:any) => ({label: project.project_name, value: project.project_id}))
  const leadOptions = leadData?.map((lead:any) => ({label: lead.name, value: lead.lead_id}))
  const typeOptions = [
    {label: "Project", value: "Project"},
    {label: "Lead", value: "Lead"}

  ]


  return (
        <div>
            <span onClick={openDialog} className='cursor-pointer'> <LuCornerUpRight/></span>
            
            <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
                <div className="pl-4 ">
                    <h3>Add To Lead / Project</h3>
                </div>
                <Formik 
                       initialValues={{
                        user_id: localStorage.getItem('userId') || '',
                        org_id,
                        type: 'Project',
                        task_id: task_id,
                        project_id: "",
                        lead_id: "",
                      }}
                      validationSchema={Yup.object().shape({
                          type: Yup.string().required("Select a Type"),
                          project_id: Yup.string(),

                        lead_id: Yup.string()
                      })
                      }
                     onSubmit={async(values, actions) => {
                        //  setLoading(true)
                        // console.log(values)

                        if (!values.project_id && !values.lead_id) {
                            actions.setFieldError('project_id', 'Project or Lead is required');
                            actions.setFieldError('lead_id', 'Project or Lead is required');
                            return;
                        }
                        // console.log("values")
                            const response = await apiGetCrmMoveOpenTask(values)
                            
                            if(response.code===200){
                                setLoading(false)
                                toast.push(
                                    <Notification closable type='success' duration={2000}>Task Moved Successfully</Notification>
                                )
                                window.location.reload()
                            }
                            else{
                                setLoading(false)
                                toast.push(
                                    <Notification closable type='danger' duration={2000}>{response.errorMessage}</Notification>
                                )
                            }
                        }
                            
                    }
                     >
                        {({ values, setFieldValue, touched, errors,}) => (
                        <Form className=' p-4 max-h-96 overflow-y-auto'>
                            <div className=' grid grid-cols-2 gap-x-5'>
                            
                            <FormItem label='Type'
                            
                                invalid={errors.type && touched.type}
                                errorMessage={errors.type}>
                                    <Field name='type'  placeholder='Project'>
                                        {({field}:any)=>(
                                            <Select
                                            options={typeOptions}
                                            name={field.name}
                                            value={typeOptions.find(option => option.value === field.value)}
                                            onChange={(selectedOption: any) => {
                                              setFieldValue('type', selectedOption.value);
                                              setFieldValue('lead_id', "");
                                              setFieldValue('project_id', "");
                                              setType(selectedOption.value);
                                            }}
                                          />
                                        )}
                                    </Field>
                            </FormItem>


                            {type === 'Project' && <FormItem label='Project Name'
                                invalid={errors.project_id && touched.project_id}
                                errorMessage={errors.project_id}>
                                    <Field name='project_id'  placeholder='Project'>
                                        {({field}:any)=>(
                                            <Select
                                            options={projectOptions}
                                            name={field.name}
                                            value={projectOptions.find((option:any) => option.value === field.value)}
                                            onChange={(selectedOption: any) => {
                                              setFieldValue('project_id', selectedOption.value);
                                            }}
                                          />
                                        )}
                                    </Field>
                            </FormItem>
                            }

                            {type === 'Lead' && <FormItem label='Lead Name'
                                invalid={errors.lead_id && touched.lead_id}
                                errorMessage={errors.lead_id}>
                                    <Field name='lead_id'  placeholder='Lead'>
                                        {({field}:any)=>(
                                            <Select
                                            options={leadOptions}
                                            name={field.name}
                                            value={leadOptions?.find((option:any) => option.value === field.value)}
                                            onChange={(selectedOption: any) => {
                                              setFieldValue('lead_id', selectedOption.value);
                                            }}
                                          />
                                        )}
                                    </Field>
                            </FormItem>
                            } 

                            

                            

                            </div>
                            <div className='flex justify-end'>
                                <Button type='submit' variant='solid' size='sm' loading={loading}>{loading?'Moving':'Move'}</Button>
                            </div>
                        </Form>)}
                </Formik>
            </Dialog>
        </div>
    )
}

export default MoveToDialog