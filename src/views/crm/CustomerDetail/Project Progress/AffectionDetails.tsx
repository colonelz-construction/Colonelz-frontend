import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, Form, Formik, FormikContext } from 'formik'
import { DatePicker, FormItem, Input, Notification, Select, Tooltip, toast } from '@/components/ui'
import { apiCreateCrmExecSubTask, apiCreateCrmExecTask, apiGetCrmExecutionSubtaskAffection, apiGetCrmLeadsAddMiniTask, apiGetCrmLeadsAddSubTask, apiGetCrmProjectsAddMiniTask, apiGetCrmProjectsAddSubTask, apiGetCrmProjectsAddTask, apiGetUsersList } from '@/services/CrmService'
import { MdOutlineAdd } from 'react-icons/md'
import * as Yup from 'yup'
import { useLocation } from 'react-router-dom'
import { setUser } from '@/store'
import SelectWithBg from '@/components/ui/CustomSelect/SelectWithBg'


const AffectionDetails = ({task,subtask, openDialog, onDialogClose, dialogIsOpen, setIsOpen}:any) => {

    const [loading, setLoading] = useState(false)
    const location=useLocation()
    const queryParams=new URLSearchParams(location.search)
    const project_id=queryParams.get('project_id')
    const org_id = localStorage.getItem('orgId')

    const [affData, setAffData] = useState<any>([]);
    console.log(affData)


    useEffect(() => {

        const fetchData = async () => {
            try {

                setLoading(true)

                const res = await apiGetCrmExecutionSubtaskAffection(project_id, task.task_id, subtask.sub_task_id);

                // console.log(res.data)
                setAffData(res.data)
                
            } catch (error:any) {

                throw new Error("Somthing went wrong", error)
                
            } finally {
                setLoading(false)
            }

        }

        fetchData()

    }, [task, subtask])

   
  

    return (
        <div>
            <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>

                asfdds
                
            </Dialog>
        </div>
    )
}

export default AffectionDetails