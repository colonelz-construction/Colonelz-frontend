// @ts-nocheck
import React, { useEffect, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker?url";
import PdfScreen from "./components/PdfScreen";
import RightSideBar from "./components/RightSideBar";
import { Input, Select } from "@/components/ui";
import { apiGetCrmFileManagerDrawingData, apiGetCrmFileManagerLeads, apiGetCrmFileManagerProjects } from "@/services/CrmService";
import { Button} from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackOutline } from "react-icons/io5";
GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PdfTextLinker = () => {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subFolderLoading, setSubFolderLoading] = useState(false);
  const [wordSelected, setWordSelected] = useState(false);
  const [pdfPages, setPdfPages] = useState([]);
  const [fileName, setFileName] = useState<any>();
  const [selectedOption, setSelectedOption] = useState<any>({ label: "Select a File...", value: "" });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [links, setLinks] = useState([]);
  const [folders, setFolders] = useState<any>([]);
  const [targetWords, setTargetWords] = useState<any>([]);
  const [data, setData] = useState<any>([]);
  const [folderName, setFolderName] = useState<any>('');
  const [pdfOptions, setPdfOptions] = useState<any>([]);

  

  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('project_id') || '';

  useEffect(() => {
    setSubFolderLoading(false)

    const groupBySubFolderNameSecond = (folderName:any, subFolderNameFirst:any) => {
      const result :any = [];
    
      data.forEach((obj:any) => {
        obj.files?.forEach((item:any) => {
          if (item.folder_name === folderName && item.sub_folder_name_second && item.sub_folder_name_first === subFolderNameFirst) {
            // Check if sub_folder_name_second already exists in the result
            const existingEntry = result.find((entry:any) => entry.sub_folder_name_second === item.sub_folder_name_second);
            
            if (!existingEntry) {
              result.push({
                sub_folder_name_second: item.sub_folder_name_second,
                files: item.files || []
              });
            }
          }
        });
      });

      
      return result;
    };
    const folderData = groupBySubFolderNameSecond('Drawing', folderName)
    setFolders(folderData)
    
    
    
    setSubFolderLoading(true)

    

  }, [folderName])


  useEffect(() => {

    const fetchData = async () => {

      const res2 = await apiGetCrmFileManagerDrawingData('', projectId, 'Drawing')

      const data2 = res2.data.DrawingData

      setData(data2);

      

      const folderMap = new Map();

      data2.forEach((obj) => {
        obj.files.forEach((file) => {
          if (!folderMap.has(file.sub_folder_name_first)) {
            folderMap.set(file.sub_folder_name_first, {
              sub_folder_name_first: file.sub_folder_name_first,
              folder_id: file.folder_id,
            });
          }
        });
      });

      // Convert Map to array
      const uniqueFolders = Array.from(folderMap.values());


      setTargetWords(uniqueFolders)
    }
    fetchData()



  }, [])


  const scaleFactor = 1.5;



  // const pdfOptions = [
  //   { label: "finance building first floor", value: "https://objectstore.nyc1.civo.com/dev-colonelz/670d0bdf9a23e9b6436486d9/template/company%20data/company%20policies/New%20Folder/a-16%2C%20garden%20city-21-02-25%20%281%29.pdf?AWSAccessKeyId=AAISH0GB3DMJX6X1105M&Expires=1897811031&Signature=zt4IVIOdKNOx7rqKzc9864CNr2A%3D" },
  //   { label: "finance building second floor", value: "https://objectstore.nyc1.civo.com/dev-colonelz/670d0bdf9a23e9b6436486d9/template/company%20data/company%20policies/New%20Folder/a-16%2C%20garden%20city-21-02-25%20%281%29.pdf?AWSAccessKeyId=AAISH0GB3DMJX6X1105M&Expires=1897811031&Signature=zt4IVIOdKNOx7rqKzc9864CNr2A%3D" },
  // ];

  useEffect(() => {

    const fetchData = async () => {
      const projectData = await apiGetCrmFileManagerProjects(projectId);
      const folderData = projectData?.data

      const selectedFolder = folderData.find((folder: any) => folder.folder_name?.toLowerCase() === 'blueprint');
      if (selectedFolder) {

        let options = [];
        selectedFolder.files.map((item:any) => {
          const obj = {
            "label" : item.fileName,
            "value" : item.fileUrl,
          }

          options.push(obj)

        })

        setPdfOptions(options)
      }
           
    }
    fetchData()

  }, [])

  const handleFileChange = (event) => {
    setLoading(true);
    const file = event.target.files[0];
    setWordSelected(false);

    
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setFileName(file.name)
      setSelectedOption({ label: "Select a File...", value: "" })
      setPdfUrl(URL.createObjectURL(file)); // Update the PDF URL for rendering
      processPDF(file); // Call processPDF directly with the selected file
    } else {
      alert("Please select a valid PDF file.");
    } 

    setLoading(false);

  };

  const handleUrlChange = async (option) => {
    setLoading(true);
    setWordSelected(false);
    const selectedUrl = option.value;
    setPdfUrl(selectedUrl);
    setSelectedOption(option)
    setFileName("")
    if (selectedUrl) {
      try {
        const response = await fetch(selectedUrl);
        const blob = await response.blob();
        processPDF(blob);
      } catch (error) {
        console.error("Error fetching PDF:", error);
        alert("Failed to load PDF.");
      } finally {
        setLoading(false);
      }
    }
  };

  const processPDF = async (fileOrBlob) => {
    if (!fileOrBlob) {
      alert("Please upload or select a PDF.");
      return;
    }

    // setLoading(true);

    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const pdfData = new Uint8Array(e.target.result);
        const loadingTask = getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;

        const pages = [];
        const allLinks = [];

        for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
          const page = await pdf.getPage(pageIndex + 1);
          const viewport = page.getViewport({ scale: 1 });
          const textContent = await page.getTextContent();

          const textPositions = textContent.items.map((item) => {
            const [a, b, c, d, x, y] = item.transform;
            const fontSize = Math.hypot(a, b);
            const isVertical = Math.abs(b) > Math.abs(a);
            const wordWidthFactor = 0.6;
            const width = isVertical ? fontSize : item.str.length * fontSize * wordWidthFactor;
            const height = isVertical ? item.str.length * fontSize * wordWidthFactor : fontSize;
            const boxSizeIncreaseFactor = 1.2;
            const positionAdjustmentFactorX = -0.1;
            const positionAdjustmentFactorY = 0.14;

            return {
              text: item.str,
              x: x + width * positionAdjustmentFactorX,
              y: viewport.height - y + height * positionAdjustmentFactorY,
              fontSize: fontSize,
              isVertical: isVertical,
              width: width * boxSizeIncreaseFactor,
              height: height * boxSizeIncreaseFactor,
            };
          });
          

          // const targetWords = [
          //   { sub_folder_name_second: "MASTER BEDROOM", url: "https://google.com" },
          //   { sub_folder_name_second: "BALCONY", url: "https://youtube.com" },
          //   { sub_folder_name_second: "KITCHEN", url: "https://takeuforward.org/" },
          //   { sub_folder_name_second: "CENTER TABLE", url: "https://www.hackerrank.com/" },
          //   { sub_folder_name_second: "LIVING AREA", url: "https://amazon.com" },
          //   { sub_folder_name_second: "CENTER", url: "https://pdfkit.org/" },
          //   { sub_folder_name_second: "LIFT", url: "https://www.npmjs.com/package/tesseract.js/v/4.1.1" },
          //   { sub_folder_name_second: "BED ROOM 2", url: "https://takeuforward.org/" },
          //   { sub_folder_name_second: "BED ROOM 3", url: "https://www.npmjs.com/package/tesseract.js/v/4.1.1" },
          //   { sub_folder_name_second: "BED ROOM 1", url: "https://google.com" },
          //   { sub_folder_name_second: "MASTER BED ROOM", url: "https://www.npmjs.com/package/tesseract.js/v/4.1.1" },
          //   { sub_folder_name_second: "TOILET", url: "https://amazon.com" },
          //   { sub_folder_name_second: "STUDY ROOM", url: "https://amazon.com" },
          //   { sub_folder_name_second: "SIDE TABLE", url: "https://amazon.com" },
          // ];


          const foundWords = textPositions.filter((item) =>
            targetWords.some(target => target.sub_folder_name_first.toLowerCase() === item.text.toLowerCase())
          );


          foundWords.forEach((word) => {
            const target = targetWords.find(target => target.sub_folder_name_first.toLowerCase() === word.text.toLowerCase());
            allLinks.push({
              pageIndex,
              x: word.x * scaleFactor,
              y: (word.y - word.height) * scaleFactor,
              width: word.width * scaleFactor,
              height: word.height * scaleFactor,
              folder_id: target.folder_id,
              sub_folder_name_first: target.sub_folder_name_first,
            });
          });

          pages.push({
            pageIndex,
            numPages: pdf.numPages,
            width: viewport.width,
            height: viewport.height,
          });
        }

        setPdfPages(pages);
        setLinks(allLinks);
      };

      fileReader.readAsArrayBuffer(fileOrBlob);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Failed to process PDF. Please try again.");
    }
  };

  return (
    
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div>
            <Button
              variant='solid' size='sm' className='flex justify-center items-center gap-4'
              onClick={() => navigate(-1)}>
              <span><IoArrowBackOutline /></span>  <span>Back</span>
              
            </Button>
      
            {/* other content of the page */}
          </div>
      <span className="text-3xl font-bold">Upload or Select a Blueprint PDF</span>

      <div className="mt-4">

        <div className="flex flex-col gap-2 items-center border-2 border-[#A15AA3] border-opacity-50 rounded-xl bg-[#A15AA3] bg-opacity-10 w-full p-6 mb-6">

          <input id="fileInput" className="hidden" type="file" accept="application/pdf" onChange={(event:any) => handleFileChange(event)} />

          <div className="flex flex-col gap-2 items-center">
            <label
              htmlFor="fileInput"
              className="w-fit px-4 py-2 bg-[#A15AA3] text-white rounded cursor-pointer text-center hover:bg-opacity-70"
            >
              {"Upload"}

            </label>

            <span>{fileName && fileName }</span>

          </div>


          <span className="text-lg">or</span>

          <Select
              className="w-fit"
              placeholder={selectedOption.label}
              options={pdfOptions}
              value={selectedOption.label}
              onChange={(option:any) => handleUrlChange(option)}
          />

        </div>


        {loading ? <span>Loading file...</span> : pdfUrl && 
        <div className="flex-col-reverse xl:flex-row  flex gap-2 border-2 rounded-xl p-4 border-[#6A63AB] border-opacity-50 bg-[#6A63AB] bg-opacity-10">

          {pdfUrl && <PdfScreen setFolderName={setFolderName} loading={loading} pdfUrl={pdfUrl} pdfPages={pdfPages} links={links} scaleFactor={scaleFactor} setWordSelected={setWordSelected} />}


          {wordSelected && <RightSideBar folders={folders} />}
        </div>}
      </div>
    </div>
  );
};

export default PdfTextLinker;
