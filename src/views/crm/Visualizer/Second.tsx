//Second.tsx


import { Button, Dialog, FormItem,Input, Notification, Select, toast, Tooltip } from "@/components/ui";
import { apiDeleteCrmMainImage, apiGetCrmPanoImagesFileManager, apiPostCrmThreeImage } from "@/services/CrmService";
import { Field, Formik, Form } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from 'yup'
import { useSearchParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/shared";
import { MdDeleteOutline } from "react-icons/md";

const Second = ({setImgList, data, mainLoading, setCurrentImage, currentImage}:any) => {

  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('lead_id') || '';
  const projectId = queryParams.get('project_id') || '';
  const imgId = queryParams.get('imgId') || '';
  const mainImgId = queryParams.get('2') || '';

  const [dialogIsOpen, setIsOpen] = useState(false)
  const [dialogIsOpen2, setIsOpen2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toDeleteId, setToDeleteId] = useState('')
  const [panoImages, setPanoImages] = useState<any>([])
  const org_id = localStorage.getItem('orgId')
  const [searchParams, setSearchParams] = useSearchParams();



  // console.log(data);

  useEffect(() => {

    const fetchData = async () => {

      const res = await apiGetCrmPanoImagesFileManager(leadId, projectId);

      console.log(res.data)

      const panoImg = res.data?.files
      setPanoImages(panoImg)

    }
    fetchData()

  }, [leadId, projectId])

  
  
  
  const openDialog = () => {
    setIsOpen(true)
  }

  const onDialogClose = () => {
    setIsOpen(false)
  }

  const openDialog2 = (imgId:any) => {
    setIsOpen2(true)
    setToDeleteId(imgId)
  }

  const onDialogClose2 = () => {
    setIsOpen2(false)
  }

  const hanldleDelete = async (img_id:any) => {
    try {

      const  data = {
        lead_id: leadId,
        project_id: projectId,
        img_id: img_id,
        type: "main",
        org_id: org_id,
      }

      const  response =  await apiDeleteCrmMainImage(data);


      if (response.code === 200) {
        toast.push(
          <Notification closable type="success" duration={2000}>
            Image Deleted successfully
          </Notification>, { placement: 'top-end' }
        )

        window.location.reload();
      }
      else {
        toast.push(
          <Notification closable type="danger" duration={2000}>
            {response.errorMessage}
          </Notification>, { placement: 'top-end' }
        )
      }
      
    } catch (error:any) {

      throw new Error(error)
      
    }
  }

  const handleClick = (image:any) => {
    setImgList([]);
    setCurrentImage(image);
    const updatedParams = new URLSearchParams();

    if(leadId) {
      updatedParams.set("lead_id", leadId);
    } else if(projectId) {
      updatedParams.set("project_id", projectId);

    }
      updatedParams.set("imgId", image.img_id); // Add or update "name"

      // Apply the updated params
      setSearchParams(updatedParams);
  }
  

  return (
    <>
    
      <div className="w-[30%] border-[0.1rem] rounded-lg p-2">

      <div className="flex flex-col gap-1 p-1">
        <div className="flex flex-row-reverse">
          <Button onClick={openDialog} variant="solid" size="sm">
            Import Image
          </Button>
        </div>

        {/* Scrollable List */}
        <div className="flex flex-col gap-2 mt-4 max-h-[30rem] overflow-y-auto">
          {data &&
            data.map((image: any) => {
              return (
                <div key={image.img_id} className="flex items-center gap-2">
                  <div
                      className={`flex justify-between p-2 w-full items-center border-[0.09rem] rounded-md capitalize cursor-pointer ${
                        image?.img_id == mainImgId || image?.img_id == imgId
                          ? "bg-gray-100 font-[600]"
                          : ""
                      }`}
                  
                  >

                  <div
                    onClick={() => handleClick(image)}
                  >
                    <span>{image?.name}</span>
                  </div>

                  <div
                    className="ml-3 cursor-pointer"
                    onClick={() => openDialog2(image?.img_id)}
                  >
                    <Tooltip title="Delete">
                      <span className="cursor-pointer">
                        <MdDeleteOutline className="text-xl text-center hover:text-red-500" />
                      </span>
                    </Tooltip>
                  </div>

                  </div>
                 
                </div>
              );
            })}
        </div>
      </div>

      </div>

      <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose} className='z-20'>
          <div className="pl-4 ">
              <h3>Import an Image</h3>
          </div>
          <Formik 
                  initialValues={{
                  user_id: localStorage.getItem('userId') || '',
                  org_id: localStorage.getItem('orgId') || '',
                  lead_id: leadId || '',
                  project_id: projectId || '',
                  name: '',
                  url: '',
                  rename: '',
                }}
                validationSchema={Yup.object().shape({
                    url: Yup.string().required("url is required"),
                    name: Yup.string().required("name is required"),
                    rename: Yup.string(),
                })
                }
                onSubmit={async(values, actions) => {

                  // console.log(values)

                  const formData = {
                        org_id: values?.org_id,
                        user_id: values?.user_id,
                        lead_id: values?.lead_id,
                        project_id: values?.project_id,
                        type: 'main',
                        url: values?.url,
                        name: values?.name,
                        rename: values?.rename,
                        crd: [],
                        hp: [],
                      };
                  
                      try {
                        const res = await apiPostCrmThreeImage(formData);
                        // console.log(res);

                        window.location.reload()

                      } catch (error) {
                        console.error("Error adding hotspot:", error);
                      }

                  
                  }
                      
                }
                >
                  {({ values, setFieldValue, touched, errors,}) => (
                  <Form className=' p-4 max-h-96 overflow-y-auto'>
                      <div className=' grid grid-row-2 gap-x-5'>

                       <FormItem label="Images">
                          <Select
                              options={panoImages?.map((files:any) => ({ value: files.fileUrl, label: files.fileName }))}
                              onChange={(option:any) => {
                                  setFieldValue('url', option?.value || '')
                                  setFieldValue('name', option?.label || '')
                                }
                              }
                            />
                        </FormItem>
                        <FormItem label='Rename'
                          invalid={errors.rename && touched.rename}
                          errorMessage={errors.rename}
                          >
                              <Field
                              name='rename'
                              placeholder='Enter'
                              >
                                  {({ field,form }:any) => (
                                      <Input
                                      name='rename'
                                      placeholder='Enter'
                                      onChange={(e) => {
                                          form.setFieldValue(field.name, e.target.value)
                                      }}
                                      />
                                  )}
                              </Field>
                          </FormItem>
                      
                      </div>
                      <div className='flex justify-end'>
                          <Button type='submit' variant='solid' size='sm' loading={loading}>{loading?'Importing':'Import'}</Button>
                      </div>
                  </Form>)}
          </Formik>
    </Dialog>

    <ConfirmDialog
      isOpen={dialogIsOpen2}
      type="danger"
      onClose={onDialogClose2}
      confirmButtonColor="red-600"
      onCancel={onDialogClose2}
      onConfirm={() => hanldleDelete(toDeleteId)}
      title="Delete Image"
      onRequestClose={onDialogClose2}>
      <p> Are you sure you want to delete this Image? </p>
    </ConfirmDialog>
    
    </>

    
  );
};

export default Second;