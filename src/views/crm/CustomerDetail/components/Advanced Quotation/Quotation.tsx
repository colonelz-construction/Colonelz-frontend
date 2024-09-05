import React, { useEffect, useState } from 'react';
import {  MainQuotationData } from './quoteTypeData'; // Replace with your actual library
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Tabs } from '@/components/ui';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import TabContent from '@/components/ui/Tabs/TabContent';
import { apiGetCrmSingleProjectQuotation } from '@/services/CrmService';

interface TabbedContentProps {
  data: MainQuotationData | null;
}

const TabbedContent: React.FC<TabbedContentProps> = ({ data }) => {
  const location = useLocation();
    if (!data || !data.data || !data.data.main_quotation) {
      return null; 
    }
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('project_id');
    return (
      <Tabs defaultValue='Final Estimate' className=''>
      
        <div className='flex flex-row justify-between'>
            <div className='flex flex-row '>

            <>
            <TabList className=' ' style={{ scrollbarWidth: "none" }} >
        <TabNav value='Final Estimate'>Final Estimate</TabNav>
          {data.data.main_quotation.map((quotation) => (
              <TabNav key={quotation.qutation_id} value={quotation.type} className=' capitalize'>
                {quotation.type}
              </TabNav>
            ))}
            </TabList>
            </>
          </div>
      
        </div>
        <TabContent value='Final Estimate'>
           <FinalEstimate/>
        </TabContent>
        {data.data.main_quotation.map((quotation) => (
          <TabContent key={quotation.type} value={quotation.type}>
            <div className="p-4">
              <Filtering quotation_type={quotation.type} quotation_id={quotation.qutation_id} project_id={projectId} />
            </div>
          </TabContent>
        ))}
      </Tabs>
    );
  };

const YourMainComponent: React.FC = () => {
  const location = useLocation();
  const [mainQuotationData, setMainQuotationData] = useState<MainQuotationData | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('project_id');

    if (projectId) {
      const fetchData = async () => {
        try {
          const data = await apiGetCrmSingleProjectQuotation(projectId);
          setMainQuotationData(data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [location.search]);
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('project_id');
const navigate=useNavigate()
  return (
    <div className=''>
      <div className='flex justify-end'>
          <Button className=' justify-end' variant='solid' onClick={()=>navigate(`/app/crm/project/quotation-form?project_id=${projectId}`)}>Add Quotaiotn</Button>
          </div> <TabbedContent data={mainQuotationData} />
    </div>
  );
};

export default YourMainComponent;