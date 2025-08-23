// PublicVisualizer.tsx (mirroring Visualizer.tsx but without auth-dependent parts like back/public buttons)

import React, { useEffect, useState } from 'react'
import PublicSecond from './PublicSecond'
import PublicFirst from './PublicFirst'
import { apiGetCrmMainThreeImagePublic } from '@/services/CrmService'
import { FaPanorama } from "react-icons/fa6";
import { useLocation } from 'react-router-dom';

type DataItem = {
    img_id: string;
    hp?: any[];
    [key: string]: any;
};

const PublicVisualizer = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const leadId = queryParams.get('lead_id') || '';
    const projectId = queryParams.get('project_id') || '';
    const [orgId] = useState(() => queryParams.get('org_id') || '');
    const [userId] = useState(() => queryParams.get('user_id') || '');

    console.log("org id : ",orgId)
    console.log("user id : ",userId)

    const [data, setData] = useState<DataItem[]>([]);
    const [mainLoading, setMainLoading] = useState<boolean>(false);

    const [imgIdList, setImgList] = useState<any>([]);
    // console.log(imgIdList)

    const [currentImage, setCurrentImage] = useState<any>({});
    // console.log(currentImage)

    useEffect(() => {

        const fetchData = async () => {
            setMainLoading(true);

            try {
                // Fetch main images
                const mainRes = await apiGetCrmMainThreeImagePublic('main', '', leadId, projectId, orgId, userId);
                // Fetch hotspot images
                const hotspotRes = await apiGetCrmMainThreeImagePublic('hp', '', leadId, projectId, orgId, userId);

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

    return (
        <div className='mt-5 p-5'>
            <div className='w-full flex justify-center items-center mb-4 gap-3'>
                <FaPanorama className='text-4xl' />
                <span className='text-4xl font-bold'>Panoramic View</span>
            </div>

            <div className='border-b-[0.12rem] mb-3'></div>


            <div className='flex gap-2'>

                <PublicSecond setImgList={setImgList} data={data} mainLoading={mainLoading} currentImage={currentImage} setCurrentImage={setCurrentImage} orgId={orgId} userId={userId}/>

                <PublicFirst imgIdList={imgIdList} currentImage={currentImage} setCurrentImage={setCurrentImage} setImgList={setImgList} orgId={orgId} userId={userId} />
            </div>

        </div>
    )
}

export default PublicVisualizer