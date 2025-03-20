import { useState } from "react";
import  Card  from "@/components/ui/Card";
import { MdKeyboardArrowRight, MdExpandMore } from "react-icons/md";
import { useLocation } from "react-router-dom";
import ImageDialog from "./ImageDialog";

interface File {
  file_id: string;
  file_name: string;
  url: string;
}

interface Folder {
  folder_name: string;
  folder_id: string;
  lead_id: string;
  project_id: string;
  files: File[];
}

interface ExpandableFolderListProps {
  folders: any[];
}

const RightSideBar: React.FC<ExpandableFolderListProps> = ({ folders }) => {
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [fileName, setFileName] = useState("")
    const location=useLocation()
    const queryParams=new URLSearchParams(location.search)


    const toggleExpand = (folderId: string) => {
        setExpandedFolders((prev) => ({
        ...prev,
        [folderId]: !prev[folderId],
        }));
    };

    const openDialog = () => {
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }

  return (
    <>
    <div className="w-full xl:w-[30%] p-4 max-h-[200px] xl:max-h-screen overflow-auto border rounded-lg dark:bg-gray-700 bg-slate-50 "> {/* Scrollable Sidebar */}
      {folders.map((folder) => (
        <Card key={folder.sub_folder_name_second} className="mb-2 p-2 border rounded-lg">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleExpand(folder.sub_folder_name_second)}
          >
            <span className="font-semibold capitalize">{folder.sub_folder_name_second}</span>
            {expandedFolders[folder.sub_folder_name_second] ? <MdExpandMore /> : <MdKeyboardArrowRight />}
          </div>

          {expandedFolders[folder.sub_folder_name_second] && (
            <div className="mt-2 border-l-2 pl-3 border-gray-300 max-h-40 overflow-auto flex flex-col items-start"> {/* Scrollable File List */}
              {folder.files.length > 0 ? (
                folder.files.map((file:any) => (

                  
                    <span onClick={() => {setFileName(file.fileUrl); openDialog()}} key={file.fileId} className="py-1 dark:text-slate-100 text-gray-700 capitalize cursor-pointer hover:underline" >
                    {file.fileName}</span>
                    
                ))
              ) : (
                <span className="py-1 text-gray-500 dark:text-slate-100">No files available</span>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>

    {fileName && <ImageDialog dialogIsOpen={dialogIsOpen} onDialogClose={onDialogClose} url={fileName}/>}

    
    </>
  );
};

export default RightSideBar;
