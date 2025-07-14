import {
  Button,
  Dialog,
  FormItem,
  Input,
  Notification,
  toast,
  Tooltip,
} from "@/components/ui";
import {
  apiDeleteCrmMainImage,
  apiGetCrmPanoImagesFileManager,
  apiPostCrmThreeImage,
} from "@/services/CrmService";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { ConfirmDialog } from "@/components/shared";
import { MdDeleteOutline } from "react-icons/md";
import * as Yup from "yup";

const Second = ({ setImgList, data, mainLoading, setCurrentImage, currentImage }: any) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get("lead_id") || "";
  const projectId = queryParams.get("project_id") || "";
  const imgId = queryParams.get("imgId") || "";

  const [dialogIsOpen, setIsOpen] = useState(false);
  const [dialogIsOpen2, setIsOpen2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toDeleteId, setToDeleteId] = useState("");
  const [panoImages, setPanoImages] = useState<any[]>([]);
  const org_id = localStorage.getItem("orgId") || "";
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formValues, setFormValues] = useState({
    user_id: localStorage.getItem("userId") || "",
    org_id: org_id,
    lead_id: leadId,
    project_id: projectId,
    name: "",
    url: "",
    rename: "",
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      // Fetch main images (with nested hp)
      const mainRes = await apiGetCrmPanoImagesFileManager(leadId, projectId);
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

  const openDialog = () => setIsOpen(true);
  const onDialogClose = () => setIsOpen(false);
  const openDialog2 = (imgId: string) => {
    setIsOpen2(true);
    setToDeleteId(imgId);
  };
  const onDialogClose2 = () => setIsOpen2(false);

  const handleDelete = async (img_id: string) => {
    try {
      const data = {
        lead_id: leadId,
        project_id: projectId,
        img_id,
        type: "main",
        org_id,
      };
      const response = await apiDeleteCrmMainImage(data);
      if (response.code === 200) {
        toast.push(
          <Notification closable type="success" duration={2000}>
            Image Deleted successfully
          </Notification>,
          { placement: "top-end" }
        );
        window.location.reload();
      } else {
        toast.push(
          <Notification closable type="danger" duration={2000}>
            {response.errorMessage}
          </Notification>,
          { placement: "top-end" }
        );
      }
    } catch (error: any) {
      console.error("Delete Error:", error.message);
    }
  };

  const handleClick = (image: any) => {
    setImgList([]);
    setCurrentImage(image);
    const updatedParams = new URLSearchParams();
    if (leadId) updatedParams.set("lead_id", leadId);
    if (projectId) updatedParams.set("project_id", projectId);
    updatedParams.set("imgId", image.img_id);
    setSearchParams(updatedParams);
  };

  const validationSchema = Yup.object().shape({
    url: Yup.string().required("Image URL is required"),
    name: Yup.string().required("Name is required"),
    rename: Yup.string(),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormValues((prev) => ({
        ...prev,
        name: file.name,
        url: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormValues((prev) => ({
        ...prev,
        name: file.name,
        url: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      setErrors({});
      setLoading(true);

      const formData = {
        org_id: formValues.org_id,
        user_id: formValues.user_id,
        lead_id: formValues.lead_id,
        project_id: formValues.project_id,
        type: "main",
        url: formValues.url,
        name: formValues.name,
        rename: formValues.rename,
        crd: [],
        hp: [],
      };

      await apiPostCrmThreeImage(formData);
      window.location.reload();
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const formErrors: any = {};
        err.inner.forEach((validationError: any) => {
          formErrors[validationError.path] = validationError.message;
        });
        setErrors(formErrors);
      } else {
        console.error("Submission error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to flatten images (main + hp)
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
  
  // Console log to see the data
  console.log("Original data:", data);
  console.log("Flattened images:", allImages);

  return (
    <>
      <div className="w-[30%] border rounded-lg p-2">
        <div className="flex flex-col gap-1 p-1">
          <div className="flex flex-row-reverse">
            <Button onClick={openDialog} variant="solid" size="sm">
              Import Image
            </Button>
          </div>

          <div className="flex flex-col gap-2 mt-4 max-h-[30rem] overflow-y-auto">
            {allImages?.map((image: any) => (
              <div key={image.img_id} onClick={() => handleClick(image)}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex justify-between p-2 w-full items-center border rounded-md capitalize cursor-pointer ${
                      image?.img_id === imgId ? "bg-gray-100 font-[600]" : ""
                    }`}
                  >
                    <span>{image?.name}</span>
                    <div className="ml-3 cursor-pointer" onClick={(e) => {
                      e.stopPropagation();
                      openDialog2(image?.img_id);
                    }}>
                      <Tooltip title="Delete">
                        <span className="cursor-pointer">
                          <MdDeleteOutline className="text-xl hover:text-red-500" />
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Upload Dialog */}
      <Dialog isOpen={dialogIsOpen} onClose={onDialogClose}>
        <form onSubmit={handleSubmit} className="p-4 max-h-96 overflow-y-auto">
          <div className="grid grid-row-2 gap-x-5">
            <FormItem
              label="Upload Image"
              invalid={!!(errors.url || errors.name)}
              errorMessage={errors.url || errors.name}
            >
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-gray-600">
                  <Button className="text-blue-600" type="button">
                    click to browse
                  </Button>
                  <br /> OR <br />
                  Drag & drop an image here
                </p>
                {formValues.name && (
                  <p className="mt-2 text-sm text-gray-800 font-medium">{formValues.name}</p>
                )}
              </div>

              {formValues.url && (
                <div className="mt-4">
                  <img
                    src={formValues.url}
                    alt="Uploaded Preview"
                    className="max-w-xs rounded border border-gray-200 shadow-sm"
                  />
                </div>
              )}
            </FormItem>

            <FormItem label="Rename" invalid={!!errors.rename} errorMessage={errors.rename}>
              <Input
                name="rename"
                placeholder="Enter"
                value={formValues.rename}
                onChange={handleChange}
              />
            </FormItem>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="submit" variant="solid" size="sm" loading={loading}>
              {loading ? "Importing" : "Import"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={dialogIsOpen2}
        type="danger"
        onClose={onDialogClose2}
        confirmButtonColor="red-600"
        onCancel={onDialogClose2}
        onConfirm={() => handleDelete(toDeleteId)}
        title="Delete Image"
        onRequestClose={onDialogClose2}
      >
        <p>Are you sure you want to delete this image?</p>
      </ConfirmDialog>
    </>
  );
};

export default Second;
