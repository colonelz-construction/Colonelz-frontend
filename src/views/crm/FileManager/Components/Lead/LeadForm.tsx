import { Button, FormItem, Notification, Upload, toast } from '@/components/ui';
import React, { useState } from 'react';
import { HiOutlineCloudUpload } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import { Data, FolderItem, LeadDataItem } from './data';
import { apiGetCrmFileManagerCreateLeadFolder } from '@/services/CrmService';

interface FormData {
  lead_id: string | null;
  folder_name: string;
  files: File[];
}

type Option = {
  value: string;
  label: string;
};

const YourFormComponent: React.FC<Data> = (leadData) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('lead_id');
  const role=localStorage.getItem('role')
  
  const [formData, setFormData] = useState<FormData>({
    lead_id: leadId,
    folder_name: '',
    files: [],
  });

  const handleSelectChange = (
    selectedOption: Option | Option[] | null,
    fieldName: string,
  ) => {
    const selectedValues = Array.isArray(selectedOption)
      ? selectedOption.map((option) => option.value)
      : selectedOption
      ? [selectedOption.value]
      : [];

   

    setFormData({
      ...formData,
      [fieldName]: selectedValues,
    });
  };
  

  const handleFileChange = (files: File[] | null) => {
    if (files) {
        setFormData((prevFormData) => ({
            ...prevFormData,
            files: Array.from(files),
        }))
      
    }
}
function closeAfter2000ms(data:string,type:any) {
  toast.push(
      <Notification closable type={type} duration={2000}>
          {data}
      </Notification>,{placement:'top-center'}
  )
}

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!formData.folder_name || formData.files.length === 0) {
    toast.push(
      <Notification closable type="warning" duration={3000}>
        Please select a folder and upload at least one file.
      </Notification>,
      { placement: 'top-center' }
    );
    return;
  }
  const postData = new FormData();

  if (formData.lead_id !== null) {
    postData.append('lead_id', formData.lead_id);
  }
  postData.append('folder_name', formData.folder_name);

  formData.files.forEach((file) => {
    postData.append('files', file);
  });

  try {
    const response = await apiGetCrmFileManagerCreateLeadFolder(postData);

    const responseData = await response.json(); 
    console.log('Response Data:', responseData);

    if (responseData.status===true) {
      closeAfter2000ms('File uploaded successfully.','success');
      window.location.reload();
    } else {
      closeAfter2000ms(`Error: ${responseData.message}`,'warning');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    closeAfter2000ms('An error occurred while submitting the form.','warning');
  }
};


const uniqueFolderNames = Array.from(
  new Set(
    leadData.data.map((folderItem) => folderItem.folder_name.trim())
  )
);

const clientOptions: Option[] = uniqueFolderNames
  .filter(folderName => {
    if (role === 'ADMIN' || role === 'Senior Architect') {
      return true;
    } else {
      return folderName !== 'quotation' && folderName !== 'contract' && folderName!=='procurement data';
    }
  })
  .map((folderName) => ({
    value: folderName,
    label: folderName,
  }));

  return (
    <form  className=' overflow-y-auto max-h-[400px]' style={{scrollbarWidth:'none'}} onSubmit={handleSubmit}>
     <h3 className='mb-5'>Lead File Upload</h3>
      <div className='mb-5'>
        <FormItem label='Folder Name'>
        <CreatableSelect
        name='folder_name'
          options={clientOptions}
          onChange={(selectedOption) =>
            handleSelectChange(selectedOption, 'folder_name')
          }
        />
        </FormItem>
      </div>

      <FormItem label="File">
                            <Upload
                            draggable
                                onChange={(files) => handleFileChange(files)}
                                multiple
                            />
                                
                           
                        </FormItem>
              <div className='flex justify-end'>

      <Button type="submit" variant='solid' block>Submit</Button>
      </div>
    </form>
  );
};

export default YourFormComponent;
