import React, { useEffect, useState, useMemo, useCallback } from 'react'
import Second from './Second'
import First from './First'
import { apiGetCrmMainThreeImage } from '@/services/CrmService'
import { FaPanorama } from "react-icons/fa6";
import { Button } from '@/components/ui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoArrowBackOutline } from "react-icons/io5";

type DataItem = {
  img_id: string;
  [key: string]: any;
};

const Visualizer = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<DataItem[]>([]);
  const [mainLoading, setMainLoading] = useState<boolean>(false);
  const [imgIdList, setImgList] = useState<any>([]);
  const [currentImage, setCurrentImage] = useState<any>({});

  // Memoize query params to prevent unnecessary re-renders
  const { leadId, projectId } = useMemo(() => ({
    leadId: searchParams.get('lead_id') || '',
    projectId: searchParams.get('project_id') || ''
  }), [searchParams]);

  // Memoized fetch function to prevent recreation on every render
  const fetchData = useCallback(async () => {
    if (!leadId && !projectId) return;
    
    setMainLoading(true);
    try {
      // Use Promise.all for concurrent requests instead of sequential
      const [mainRes, hotspotRes] = await Promise.all([
        apiGetCrmMainThreeImage('main', '', leadId, projectId),
        apiGetCrmMainThreeImage('hp', '', leadId, projectId)
      ]);

      const mainImages = (mainRes?.data || []) as unknown as DataItem[];
      const hotspotImages = (hotspotRes?.data || []) as unknown as DataItem[];
      
      // More efficient deduplication
      const allImagesMap = new Map<string, DataItem>();
      [...mainImages, ...hotspotImages].forEach((img: DataItem) => {
        if (img.img_id) {
          allImagesMap.set(img.img_id, img);
        }
      });
      
      const allImages = Array.from(allImagesMap.values());
      setData(allImages);
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setMainLoading(false);
    }
  }, [leadId, projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData])

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

export default React.memo(Visualizer);