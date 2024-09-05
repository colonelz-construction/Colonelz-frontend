// import { StickyFooter } from '@/components/shared';
// import { Button, FormItem, Input, Upload } from '@/components/ui';
// import React, { useState } from 'react';
// import { HiOutlineCloudUpload } from 'react-icons/hi';
// import { useLocation, useNavigate } from 'react-router-dom';

// interface FormData {
//   project_id: string | null;
//   item: string;
//   description: string;
//   unit: string;
//   quantity: string;
//   rate: string;
//   discount: string;
//   offer_price: string;
//   total_price: string;
//   remark: string;
//   client_notes: string;
//   type: string;
//   files: File[];
//   calculatedOfferPrice: number | null;
//   calculatedTotalPrice: number | null;
// }

// const MyForm= () => {
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
//   const projectId = searchParams.get('project_id');

//   const [formData, setFormData] = useState<FormData>({
//     project_id: projectId,
//     item: '',
//     description: '',
//     unit: '',
//     quantity: '',
//     rate: '',
//     discount: '',
//     offer_price: '',
//     total_price: '',
//     remark: '',
//     client_notes: '',
//     type: '',
//     files: [],
//     calculatedOfferPrice: null,
//     calculatedTotalPrice: null,
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));

//     // Recalculate offer price and total price when rate, discount, or quantity changes
//     if (name === 'rate' || name === 'discount' || name === 'quantity') {
//       calculateOfferPrice();
//       calculateTotalPrice();
//     }
//   };

//   const handleFileChange = (files: FileList | null) => {
//     if (files) {
//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         files: Array.from(files),
//       }));
//     }
//   };

//   const calculateOfferPrice = () => {
//     const { rate, discount } = formData;

//     if (rate && discount) {
//       const calculatedPrice = (parseFloat(rate) * parseFloat(discount)) / 100;
//       setFormData((prevData) => ({
//         ...prevData,
//         calculatedOfferPrice: calculatedPrice,
//         offer_price: calculatedPrice.toString(),
//       }));
//     } else {
//       setFormData((prevData) => ({
//         ...prevData,
//         calculatedOfferPrice: null,
//         offer_price: '',  // Reset offer_price when either rate or discount is empty
//       }));
//     }
//   };3

//   const calculateTotalPrice = () => {
//     const { quantity, rate, discount } = formData;

//     if (quantity && rate && discount) {
//       const calculatedPrice = (parseFloat(quantity) * parseFloat(rate) * parseFloat(discount)) / 100;
//       setFormData((prevData) => ({
//         ...prevData,
//         calculatedTotalPrice: calculatedPrice,
//         total_price: calculatedPrice.toString(),
//       }));
//     } else {
//       setFormData((prevData) => ({
//         ...prevData,
//         calculatedTotalPrice: null,
//       }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const formDataToSend = new FormData();

//     Object.entries(formData).forEach(([key, value]) => {
//       if (key === 'files') {
//         formData.files.forEach((file) => formDataToSend.append('files', file));
//       } else {
//         formDataToSend.append(key, value);
//       }
//     });

//     try {
//       const response = await fetch('https://col-phase4.test.initz.run/v1/api/admin/create/quotation', {
//         method: 'POST',
//         body: formDataToSend,
//       });

//       if (response.ok) {
//         alert('Quotation created successfully');
//         window.location.reload();
//         navigate(-1);
//       } else {
//         alert('Failed to create Quotation');
//       }
//     } catch (error) {
//       console.error('Error submitting form data:', error);
//     }
//   };

//   const navigate = useNavigate();

//   return (
//     <form className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' onSubmit={handleSubmit}>
//       {Object.entries(formData).map(([key, value]) => {
//         if (key === 'project_id' || key === 'calculatedOfferPrice' || key === 'calculatedTotalPrice') {
//           return null;
//         }

//         const formattedLabel = key.replace(/_/g, ' ');

//         if (key === 'files') {
//           return (
//             <div key={key} className="">
//               <FormItem label='Files'>
//                 <Upload onChange={(files) => handleFileChange(files)}>
//                   <Button variant="solid" icon={<HiOutlineCloudUpload />} type='button'>
//                     Upload your file
//                   </Button>
//                 </Upload>
//               </FormItem>
//             </div>
//           );
//         }

//         return (
//           <div key={key} className=''>
//             <FormItem label={formattedLabel} className='capitalize'>
//               <Input
//                 type="text"
//                 id={key}
//                 name={key}
//                 value={value}
//                 onChange={handleChange}
//               />
//             </FormItem>
//           </div>
//         );
//       })}

//       <div className=''>
//         <FormItem label='Calculated Offer Price' className='capitalize'>
//           <Input
//             type='text'
//             id='calculatedOfferPrice'
//             name='calculatedOfferPrice'
//             value={formData.calculatedOfferPrice !== null ? formData.calculatedOfferPrice.toString() : ''}
//             readOnly
//           />
//         </FormItem>
//       </div>

//       <div className=''>
//         <FormItem label='Calculated Total Price' className='capitalize'>
//           <Input
//             type='text'
//             id='calculatedTotalPrice'
//             name='calculatedTotalPrice'
//             value={formData.calculatedTotalPrice !== null ? formData.calculatedTotalPrice.toString() : ''}
//             readOnly
//           />
//         </FormItem>
//       </div>

//       <StickyFooter
//         className="-mx-8 px-8 flex items-center justify-between py-4"
//         stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
//       >
//         <div className="md:flex items-center">
//           <Button
//             size="sm"
//             className="ltr:mr-3 rtl:ml-3"
//             type="button"
//             onClick={() => {
//               navigate(-1);
//             }}
//           >
//             Discard
//           </Button>
//           <Button size="sm" variant="solid" type="submit">
//             Submit
//           </Button>
//         </div>
//       </StickyFooter>
//     </form>
//   );
// };

// export default MyForm;
