import { Button, FormItem, Notification, Upload, toast } from '@/components/ui';
import React, { useRef, useState } from 'react';
import { HiOutlineCloudUpload } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import { Data, FolderItem, LeadDataItem } from './data';
import { apiGetCrmFileManagerCreateLeadFolder } from '@/services/CrmService';
import { IoIosAddCircleOutline } from "react-icons/io";
import classNames from 'classnames';
import { ActionLink } from '@/components/shared';
import ScrollBar from '@/components/ui/ScrollBar';

interface FormData {
  lead_id: string | null;
  folder_name: string;
  files: File[];
}

type Option = {
  value: string;
  label: string;
};


const FolderSelect = ({ setSelected, selected, clientOptions, handleSelectChange, newFolderName, setNewFolderName }:any) => {
  const [isRenaming, setIsRenaming] = useState(false);
  
  const inputRef = useRef<any>(null);

  const handleOptionChange = (selectedOption:any) => {
    if (selectedOption?.value === 'New Folder') {
      setIsRenaming(true); // Show rename input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0); // Ensure input is rendered before focusing
      setSelected(true)
    } else {
      setIsRenaming(false);
      handleSelectChange(selectedOption, 'folder_name'); // Call the handler for other options
    }
  };

  const handleRenameChange = (e:any) => {
    setNewFolderName(e.target.value);
    setSelected(true)
  };

  const handleRenameBlur = () => {
    setIsRenaming(false);
    handleSelectChange({ value: newFolderName, label: newFolderName }, 'folder_name'); // Pass the renamed value
  };

  return (
    <FormItem label="Folder Name">
      {isRenaming ? (
        <div className='flex gap-1 flex-col'>
          <input
            ref={inputRef}
            type="text"
            value={newFolderName}
            onChange={handleRenameChange}
            // onBlur={handleRenameBlur}
            className="p-2 border shadow rounded w-full outline-blue-500"
          />

          <span onClick={() => {setIsRenaming(false)}} className="text-blue-700 cursor-pointer hover:underline">Select from existing folders</span>

        </div>
      ) : (
        <CreatableSelect
          name="folder_name"
          options={clientOptions}
          onChange={handleOptionChange}
          
        />
      )}
    </FormItem>
  );
};

const YourFormComponent: React.FC<Data> = (leadData) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('lead_id');
  const role=localStorage.getItem('role')
  const [submit,setSubmit]=useState(false);
  const org_id:  any = localStorage.getItem('orgId')
  const [newFolderName, setNewFolderName] = useState('New Folder');
  const [selected, setSelected] = useState(false);
  
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

  if(selected && (!formData.folder_name && formData.files.length !== 0)) {

    setSubmit(true);
  const postData = new FormData();

  if (formData.lead_id !== null) {
    postData.append('lead_id', formData.lead_id);
  }
  postData.append('folder_name', newFolderName);

  formData.files.forEach((file) => {
    postData.append('files', file);
  });

  postData.append('org_id', org_id)

  try {
    const response = await apiGetCrmFileManagerCreateLeadFolder(postData);
    setSubmit(false);
    
    if (response.code===200) {
      closeAfter2000ms('File uploaded successfully.','success');
      window.location.reload();
    } else {
      closeAfter2000ms(`Error: ${response.errorMessage}`,'danger');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    closeAfter2000ms('An error occurred while submitting the form.','warning');
  }

  return;

  } else if (!formData.folder_name || formData.files.length === 0) {
    toast.push(
      <Notification closable type="warning" duration={3000}>
        Please select a folder and upload at least one file.
      </Notification>,
      { placement: 'top-center' }
    );
    return;
  }
  
  setSubmit(true);
  const postData = new FormData();

  if (formData.lead_id !== null) {
    postData.append('lead_id', formData.lead_id);
  }
  postData.append('folder_name', formData.folder_name);

  formData.files.forEach((file) => {
    postData.append('files', file);
  });

  postData.append('org_id', org_id)

  try {
    const response = await apiGetCrmFileManagerCreateLeadFolder(postData);
    setSubmit(false);
    
    if (response.code===200) {
      closeAfter2000ms('File uploaded successfully.','success');
      window.location.reload();
    } else {
      closeAfter2000ms(`Error: ${response.errorMessage}`,'danger');
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

const clientOptions: any = [
  
    { value: "New Folder", label: "New Folder" }, // Default option
  ...uniqueFolderNames
    .filter(folderName => {
      if (role === 'ADMIN' || role === 'Senior Architect') {
        return true;
      } else {
        return folderName !== 'quotation' && folderName !== 'contract' && folderName !== 'procurement data';
      }
    })
    .map((folderName) => ({
      value: folderName,
      label: folderName,
    })),
];

  return (
    <form  className=' overflow-y-auto max-h-[400px]' style={{scrollbarWidth:'none'}} onSubmit={handleSubmit}>
     <h3 className='mb-5'>Lead File Upload</h3>
      <div className='mb-5'>
        {/* <FormItem label='Folder Name'>
        <CreatableSelect
        name='folder_name'
          options={clientOptions}
          onChange={(selectedOption) =>
            handleSelectChange(selectedOption, 'folder_name')
          }
        />
        </FormItem> */}
        <FolderSelect setSelected={setSelected} selected={selected} newFolderName={newFolderName} setNewFolderName={setNewFolderName}  clientOptions={clientOptions} handleSelectChange={handleSelectChange}/>
      </div>

      <FormItem label="File">
                            <Upload
                            draggable
                                onChange={(files) => handleFileChange(files)}
                                multiple
                            />
                                
                           
                        </FormItem>
              <div className='flex justify-end'>

      <Button type="submit" variant='solid' loading={submit} block>{submit?'Submitting...':'Submit'}</Button>
      </div>
    </form>
  );
};

export default YourFormComponent;
