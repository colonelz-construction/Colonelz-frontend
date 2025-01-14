import React, { useEffect, useState } from 'react';
import { getTemplateData } from '../../../data';
import { TemplateDataItem } from '../../../type';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Dialog, Notification, toast } from '@/components/ui';
import type { MouseEvent } from 'react';
import YourFormComponent from '../../TemplateForm';
import { HiTrash } from 'react-icons/hi';
import { ConfirmDialog, StickyFooter } from '@/components/shared';
import { apiDeleteFileManagerFolders } from '@/services/CrmService';
import NoData from '@/views/pages/NoData';

const Index = () => {
  const [templateData, setTemplateData] = useState<TemplateDataItem[]>([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const folderName = queryParams.get('folder');
  const type = queryParams.get('type')

  useEffect(() => {
    const fetchDataAndLog = async () => {
      try {
        const templateData = await getTemplateData();
        // console.log(templateData);
        setTemplateData(templateData ? templateData : []);
      } catch (error) {
        console.error('Error fetching lead data', error);
      }
    };

    fetchDataAndLog();
  }, []);
  // console.log(templateData);

  const navigate = useNavigate();

  const [dialogIsOpen, setIsOpen] = useState(false);

  const openDialog = () => {
    setIsOpen(true);
  };

  const onDialogClose = (e: MouseEvent) => {
    // console.log('onDialogClose', e);
    setIsOpen(false);
  };

  const [dialogIsOpen2, setIsOpen2] = useState(false)
  const [folder_Name, setFolderName] = useState<string>('')

  const openDialog2 = (folder_name: string) => {
    setIsOpen2(true)
    setFolderName(folder_name)
  }

  const onDialogClose2 = () => {
    setIsOpen2(false)
  }

  const deleteFolders = async (folder_name: string) => {
    function warn(text: string) {
      toast.push(
        <Notification closable type="warning" duration={2000}>
          {text}
        </Notification>, { placement: 'top-center' }
      )
    }
    if (folder_name.length === 0) {
      warn('No files selected for deletion.')
      return;
    }
    const postData = {
      lead_id: "",
      folder_name: type,
      type: "template",
      project_id: "",
      sub_folder_name_first: folderName,
      sub_folder_name_second: folder_name
    };
    try {
      await apiDeleteFileManagerFolders(postData);
      toast.push(
        <Notification closable type="success" duration={2000}>
          Folder deleted successfully
        </Notification>, { placement: 'top-center' }
      )
      window.location.reload()
    } catch (error) {
      toast.push(
        <Notification closable type="danger" duration={2000}>
          Error deleting folder
        </Notification>, { placement: 'top-center' }
      )
    }

  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return (
    <div>
      <div className=" mb-5 flex justify-between">
        <h3 className="">Company Data</h3>
        <Button variant="solid" size="sm" onClick={() => openDialog()}>
          Upload
        </Button>
      </div>
      {templateData.length > 0 ? (
        <div className="h-screen w-full">
          <div className="flex-1 p-4">
            <div className="flex items-center mb-4">
              <nav className="flex">
                <ol className="flex items-center space-x-2">
                  <li>
                    <Link to={`/app/crm/fileManager`} className="text-blue-600 dark:text-blue-400 hover:underline">FileManager</Link>
                  </li>
                  <li>
                    <span className="mx-2">/</span>
                  </li>
                  <li>
                    <Link to={`/app/crm/fileManager`} className="text-blue-600 dark:text-blue-400 hover:underline">Company Data</Link>
                  </li>
                  <li>
                    <span className="mx-2">/</span>
                  </li>
                  <li>
                    <Link to={`/app/crm/fileManager/project/templates/commercial`} className="text-blue-600 dark:text-blue-400 hover:underline">Commercial</Link>
                  </li>
                  <li>
                    <span className="mx-2">/</span>
                  </li>

                  <li className="text-gray-500">{folderName}</li>
                </ol>
              </nav>
            </div>

            <div className="border rounded-lg shadow-sm dark:border-gray-700">
            <div className="relative w-full overflow-auto">
  <table className="w-full caption-bottom text-sm">
    <thead className="[&_tr]:border-b">
      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
        {["Name", "Type", "Size", "Modified", "Actions"].map((header) => (
          <th
            key={header}
            className={`h-12 px-4 ${
              header === "Actions" ? "text-center" : "text-left"
            } align-middle font-medium text-muted-foreground`}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="[&_tr:last-child]:border-0">
      {templateData
        .filter(
          (item) =>
            item.files &&
            item.files[0] &&
            item.files[0].folder_name === type &&
            item.files[0].sub_folder_name_first === folderName
        )
        .map((item) =>
          item.files && item.files[0] ? (
            <tr
              key={item.files[0].folder_id}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <td className="p-4 align-middle">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
                  >
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                  </svg>
                  <a
                    className="font-medium cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/app/crm/fileManager/project/templates/residential/subfolder/files?type=${type}&folder=${folderName}&subfolder=${item.files[0].sub_folder_name_second}&folder_id=${item.files[0].folder_id}`
                      )
                    }
                  >
                    {item.files[0].sub_folder_name_second}
                  </a>
                </div>
              </td>
              <td className="p-4 align-middle">Folder</td>
              <td className="p-4 align-middle">
                {Number(item.files[0].total_files) > 1
                  ? `${item.files[0].total_files} items`
                  : `${item.files[0].total_files} item`}
              </td>
              <td className="p-4 align-middle">
                {formatDate(item.files[0].updated_date)}
              </td>
              <td className="p-4 align-middle text-center">
                <div
                  className="flex justify-center"
                  onClick={() =>
                    openDialog2(item.files[0].sub_folder_name_second)
                  }
                >
                  <HiTrash className="text-xl text-center hover:text-red-500" />
                </div>
              </td>
            </tr>
          ) : (
            "No folder"
          )
        )}
    </tbody>
  </table>
</div>

            </div>
          </div>
        </div>
      ) : (
        <NoData />
      )}
      <StickyFooter
        className="-mx-8 px-8 flex items-center justify-between py-4 mt-7"
        stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      >
        <div className="md:flex items-center">
          <Button
            size="sm"
            className="ltr:mr-3 rtl:ml-3"
            type="button"
            onClick={() => {
              navigate(`/app/crm/fileManager/project/templates/commercial`)
            }}
          >
            Back
          </Button>


        </div>
      </StickyFooter>
      <Dialog
        isOpen={dialogIsOpen}
        onClose={onDialogClose}
        onRequestClose={onDialogClose}
      >
        <YourFormComponent />
      </Dialog>

      <ConfirmDialog
        isOpen={dialogIsOpen2}
        type="danger"
        onClose={onDialogClose2}
        confirmButtonColor="red-600"
        onCancel={onDialogClose2}
        onConfirm={() => deleteFolders(folder_Name)}
        title="Delete Folder"
        onRequestClose={onDialogClose2}>
        <p> Are you sure you want to delete this folder? </p>
      </ConfirmDialog>
    </div>
  )
};

export default Index;
