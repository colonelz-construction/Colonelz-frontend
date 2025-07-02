//visualizer.tsx



import React, { useEffect, useState } from 'react'
import Second from './Second'
import First from './First'
import { apiGetCrmMainThreeImage } from '@/services/CrmService'
import { FaPanorama } from "react-icons/fa6";
import { Button} from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackOutline } from "react-icons/io5";

const Visualizer = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<any>([]);
  const [mainLoading, setMainLoading] = useState<any>(false);

  const [imgIdList, setImgList] = useState<any>([]);
  // console.log(imgIdList)

  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('lead_id') || '';
  const projectId = queryParams.get('project_id') || '';

  const [currentImage, setCurrentImage] = useState<any>({});
  // console.log(currentImage)

  useEffect(() => {

    const fetchData = async() => {
      setMainLoading(true);

      try {

        const res = await apiGetCrmMainThreeImage('main', '', leadId, projectId);

        // console.log(res)
        setData(res?.data);
        setMainLoading(false);
        
      } catch (error:any) {
        throw new Error(error);
        
      }

    }

    fetchData();

  }, [leadId, projectId])

  return (
    <div>
       <div>
      <Button
        variant='solid' size='sm' className='flex justify-center items-center gap-4'
        onClick={() => navigate(-1)}>
        <span><IoArrowBackOutline /></span>  <span>Back</span>
        
      </Button>

      {/* other content of the page */}
    </div>

      <div className='w-full flex justify-center items-center mb-4 gap-3'>
        <FaPanorama className='text-4xl'/>
        <span className='text-4xl font-bold'>Panoramic View</span>

      </div>

      <div className='border-b-[0.12rem] mb-3'></div>
  

      <div className='flex gap-2'>
        
        <Second setImgList={setImgList} data={data} mainLoading={mainLoading} currentImage={currentImage} setCurrentImage={setCurrentImage}/>

        <First imgIdList={imgIdList} currentImage={currentImage} setCurrentImage={setCurrentImage} setImgList={setImgList}/>
      </div>

    </div>
  )
}

export default Visualizer