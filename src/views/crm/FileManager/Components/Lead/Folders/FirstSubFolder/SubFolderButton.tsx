//companyData File Upload
import { Button, FormItem, Notification, Upload, toast } from '@/components/ui';
import React, { useEffect, useRef, useState } from 'react';
import { HiOutlineCloudUpload } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
// import { getTemplateData } from '../data';
// import { FoldersItem } from '../type';
import { apiGetCrmFileManagerCreateTemplateFolder, apiGetCrmFileManagerDrawingUpload } from '@/services/CrmService';
import { getTemplateData } from '../../../data';
import { FoldersItem } from '../../../type';

interface FormData {
  sub_folder_name_first: string | null,
  sub_folder_name_second: string,
  folder_name: string | null;
  files: File[];
  type: string
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
      handleSelectChange(selectedOption, 'sub_folder_name_second'); // Call the handler for other options
    }
  };

  const handleRenameChange = (e:any) => {
    setNewFolderName(e.target.value);
    setSelected(true)
  };

  const handleRenameBlur = () => {
    setIsRenaming(false);
    handleSelectChange({ value: newFolderName, label: newFolderName }, 'sub_folder_name_second'); // Pass the renamed value
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

        <div className='relative overflow-visible'>

          <CreatableSelect
            name="sub_folder_name_second"
            options={clientOptions}
            onChange={handleOptionChange}
            />

        </div>
      )}
    </FormItem>
  );
};

const SubFolderButton: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const folderName = queryParams.get('folder');
  const sub_folder_name_first = queryParams.get('sub_folder_name_first');
  const type = queryParams.get('type');
  const lead_id = queryParams.get('lead_id') || '';
  const project_id = queryParams.get('project_id') || '';
  const [submit, setSubmit] = useState(false);
  const [leadData, setLeadData] = useState<FoldersItem[]>([]);
  const org_id : any = localStorage.getItem('orgId')
  const [newFolderName, setNewFolderName] = useState('New Folder');
  const [selected, setSelected] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    sub_folder_name_first: '',
    sub_folder_name_second: '',
    folder_name: 'Drawing',
    files: [],
    type: 'Drawing'
  });
  useEffect(() => {
    const fetchDataAndLog = async () => { 
      try {
        const templateData = await getTemplateData();
        // console.log(templateData);
        const filteredFolders = templateData.filter((folder:any) => {
          return (
            folder.files[0]?.folder_name === type &&
            folder.files[0]?.sub_folder_name_first === folderName
          );
        });
        // console.log(filteredFolders);

        if (filteredFolders.length > 0) {
          setLeadData(filteredFolders.map((folder:any) => folder.files[0]));
        } else {
          console.warn('No matching folder found.');
        }
        // console.log(leadData);

      } catch (error) {
        console.error('Error fetching lead data', error);
      }
    };

    fetchDataAndLog();
  }, [type, folderName]);

  const handleSelectChange = (
    selectedOption: Option | Option[] | null,
    fieldName: string,
  ) => {
    const selectedValues = Array.isArray(selectedOption)
      ? selectedOption.map((option) => option.value)
      : selectedOption
        ? [selectedOption.value]
        : [];

    const trimmedValue = selectedValues.length > 0 ? selectedValues[0].trim() : '';

    setFormData({
      ...formData,
      [fieldName]: trimmedValue,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();



    if(selected && (!formData.sub_folder_name_second)) {

      setSubmit(true);
      const postData = new FormData();

      postData.append('folder_name', 'Drawing');
      postData.append('sub_folder_name_first', sub_folder_name_first || '');
      postData.append('sub_folder_name_second', newFolderName);
      postData.append('type', 'Drawing');
      postData.append('org_id', org_id);
      postData.append('lead_id', lead_id);
      postData.append('project_id', project_id);

      formData.files.forEach((file) =>
        postData.append('files', file),
      )


      try {
        const response = await apiGetCrmFileManagerDrawingUpload(postData);
        setSubmit(false);

        if (response.code === 200) {
          toast.push(
            <Notification closable type="success" duration={2000}>
              {response.message}
            </Notification>,
          )

          window.location.reload();
        } else {
          toast.push(
            <Notification closable type="warning" duration={2000}>
              {response.message}
            </Notification>,
          );
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.push(
          <Notification closable type="danger" duration={2000}>
            "Internal Server Error"
          </Notification>,
        );
      }

      return;

    }
    else if (!formData.sub_folder_name_second) {
      toast.push(
        <Notification closable type="warning" duration={3000}>
          Please select or create a folder
        </Notification>,
        { placement: 'top-center' }
      );
      return;
    }

    setSubmit(true);
    const postData = new FormData();

    postData.append('folder_name', 'Drawing');
    postData.append('sub_folder_name_first', sub_folder_name_first || '');
    postData.append('sub_folder_name_second', formData.sub_folder_name_second || '');
    postData.append('type', 'Drawing');
    postData.append('org_id', org_id);
    postData.append('lead_id', lead_id);
    postData.append('project_id', project_id);

    // formData.files.forEach((file) =>
    //   postData.append('files', file),
    // )

    try {
      const response = await apiGetCrmFileManagerDrawingUpload(postData);
      setSubmit(false);

      if (response.code === 200) {
        toast.push(
          <Notification closable type="success" duration={2000}>
            {response.message}
          </Notification>,
        )

        // window.location.reload();
      } else {
        toast.push(
          <Notification closable type="warning" duration={2000}>
            {response.message}
          </Notification>,
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.push(
        <Notification closable type="danger" duration={2000}>
          "Internal Server Error"
        </Notification>,
      );
    }
  };

  const uniqueFolderNames = Array.from(
    new Set(leadData.map((folderItem) => folderItem.sub_folder_name_second.trim())),
  )
  // console.log(uniqueFolderNames);

  // const clientOptions: Option[] = uniqueFolderNames.map((folderName) => ({
  //   value: folderName,
  //   label: folderName,
  // }))

  const clientOptions: Option[] = [
  
    { value: "New Folder", label: "New Folder" }, // Default option
    ...uniqueFolderNames
      .map((folderName) => ({
        value: folderName,
        label: folderName,
      })),
  ];

  return (
    <form
      className=' overflow-y-auto max-h-[400px]'
      style={{ scrollbarWidth: 'none' }}
      onSubmit={handleSubmit}
    >
      <h3 className='mb-5'>File Upload</h3>
      <div className='mb-5'>
        {/* <CreatableSelect
          name='sub_folder_name_second'
          options={clientOptions}
          onChange={(selectedOption) =>
            handleSelectChange(selectedOption, 'sub_folder_name_second')
          }
        /> */}

<FolderSelect setSelected={setSelected} selected={selected} newFolderName={newFolderName} setNewFolderName={setNewFolderName}  clientOptions={clientOptions} handleSelectChange={handleSelectChange}/>
      </div>

      <FormItem label="File">
        <Upload
          onChange={(files) => handleFileChange(files)}
          multiple
          draggable
        >

        </Upload>
      </FormItem>
      <div className='flex justify-end'>

        <Button type="submit" variant='solid' loading={submit} block>
          {submit ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </form>
  );
};

export default SubFolderButton;
