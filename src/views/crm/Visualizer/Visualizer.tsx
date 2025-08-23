import React, { useEffect, useState } from 'react'
import Second from './Second'
import First from './First'
import { apiGetCrmMainThreeImage } from '@/services/CrmService'
import { FaPanorama } from "react-icons/fa6";
import { Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackOutline } from "react-icons/io5";

type DataItem = {
  img_id: string;
  [key: string]: any;
};

const Visualizer = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<DataItem[]>([]);
  const [mainLoading, setMainLoading] = useState<boolean>(false);

  const [imgIdList, setImgList] = useState<any>([]);
  // console.log(imgIdList)

  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('lead_id') || '';
  const projectId = queryParams.get('project_id') || '';

  const [currentImage, setCurrentImage] = useState<any>({});
  // console.log(currentImage)

  useEffect(() => {

    const fetchData = async () => {
      setMainLoading(true);

      try {

        // Fetch main images
        const mainRes = await apiGetCrmMainThreeImage('main', '', leadId, projectId);
        // Fetch hotspot images
        const hotspotRes = await apiGetCrmMainThreeImage('hp', '', leadId, projectId);

        // Merge and remove duplicates (if any)
        const mainImages = (mainRes?.data || []) as unknown as DataItem[];
        const hotspotImages = (hotspotRes?.data || []) as unknown as DataItem[];
        // Optional: Remove duplicates by img_id
        const allImagesMap = new Map();
        ([...mainImages, ...hotspotImages] as DataItem[]).forEach((img: DataItem) => {
          allImagesMap.set(img.img_id, img);
        });
        const allImages = Array.from(allImagesMap.values());

        setData(allImages);
        setMainLoading(false);

      } catch (error: any) {
        setMainLoading(false);
        throw new Error(error);

      }

    }

    fetchData();

  }, [leadId, projectId])

  const openPublicView = () => {
    const orgId = localStorage.getItem('orgId') || '';
    const userId = localStorage.getItem('userId') || '';
    const publicUrl = `/publicView?lead_id=${leadId}&project_id=${projectId}&org_id=${orgId}&user_id=${userId}`;
    window.open(publicUrl, '_blank');
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button
          variant='solid' size='sm' className='flex justify-center items-center gap-4'
          onClick={() => navigate(-1)}>
          <span><IoArrowBackOutline /></span>  <span>Back</span>

        </Button>
        <Button
          variant='solid' size='sm' className='flex justify-center items-center gap-4'
          onClick={openPublicView}>
          <span>Public View</span>
        </Button>

        {/* other content of the page */}
      </div>

      <div className='w-full flex justify-center items-center mb-4 gap-3'>
        <FaPanorama className='text-4xl' />
        <span className='text-4xl font-bold'>Panoramic View</span>

      </div>

      <div className='border-b-[0.12rem] mb-3'></div>


      <div className='flex gap-2'>

        <Second setImgList={setImgList} data={data} mainLoading={mainLoading} currentImage={currentImage} setCurrentImage={setCurrentImage} />

        <First imgIdList={imgIdList} currentImage={currentImage} setCurrentImage={setCurrentImage} setImgList={setImgList} />
      </div>

    </div>
  )
}

export default Visualizer