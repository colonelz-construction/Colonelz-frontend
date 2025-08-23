// PublicSecond.tsx (mirroring Second.tsx but view-only, remove import/delete dialogs)

import React, { useEffect, useState } from "react";
import { apiGetCrmPanoImagesFileManagerPublic} from "@/services/CrmService";
import { useSearchParams, useLocation } from "react-router-dom";

const PublicSecond = ({ setImgList, data, mainLoading, setCurrentImage, currentImage, orgId, userId }: any) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const leadId = queryParams.get("lead_id") || "";
    const projectId = queryParams.get("project_id") || "";

    console.log("public second org: ",orgId)
    console.log("puclice secon user : ",userId)
    
    const imgId = queryParams.get("imgId") || "";

    const [panoImages, setPanoImages] = useState<any[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const fetchData = async () => {
            // Fetch main images (with nested hp)
            const mainRes = await apiGetCrmPanoImagesFileManagerPublic(leadId, projectId, orgId, userId);
            const mainImages = mainRes.data?.files || [];

            // Helper to recursively collect all images (main + hp)
            const collectImages = (images: any[]): any[] => {
                let result: any[] = [];
                images.forEach(img => {
                    result.push(img);
                    if (img.hp && img.hp.length > 0) {
                        result = result.concat(collectImages(img.hp));
                    }
                });
                return result;
            };

            const allImages = collectImages(mainImages);
            setPanoImages(allImages);
            setImgList(allImages); // If you want to update the parent list as well
        };
        fetchData();
    }, [leadId, projectId, setImgList]);

    const handleClick = (image: any) => {
        setImgList([]);
        setCurrentImage(image);
        const updatedParams = new URLSearchParams();
        if (leadId) updatedParams.set("lead_id", leadId);
        if (projectId) updatedParams.set("project_id", projectId);
        updatedParams.set("imgId", image.img_id);
        setSearchParams(updatedParams);
    };

    const flattenImages = (images: any[]): any[] => {
        let result: any[] = [];
        images.forEach(img => {
            result.push(img); // Add main image
            if (img.hp && img.hp.length > 0) {
                result = result.concat(flattenImages(img.hp)); // Add hp images recursively
            }
        });
        return result;
    };

    // Flatten the data to include both main and hp images
    const allImages = data ? flattenImages(data) : [];

    return (
        <div className="w-[30%] border rounded-lg p-2">
            <div className="flex flex-col gap-1 p-1">
                <div className="flex flex-col gap-2 mt-4 max-h-[30rem] overflow-y-auto">
                    {allImages?.map((image: any) => (
                        <div key={image.img_id} onClick={() => handleClick(image)}>
                            <div className="flex items-center gap-2">
                                <div
                                    className={`flex justify-between p-2 w-full items-center border rounded-md capitalize cursor-pointer ${image?.img_id === imgId ? "bg-gray-100 font-[600]" : ""
                                        }`}
                                >
                                    <span>{image?.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PublicSecond;