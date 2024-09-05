import Project from "./components/Projects";
import Statistic from "./components/Statistic";
import Leads from "./components/Leads";
import { useProjectContext } from "../Customers/store/ProjectContext";
import { useRoleContext } from "../Roles/RolesContext";
import { AuthorityCheck } from "@/components/shared";
import Chart from 'react-apexcharts'
import FileManager from "../FileManager";
import { Card } from "@/components/ui";
import { COLORS } from "@/constants/chart.constant";

interface Data{
    Execution_Phase:string,
    Design_Phase:string,
    completed:string
}
const CrmDashboard = () => {
    const {apiData,loading}=useProjectContext()
    console.log(apiData);
    

    const data=[
        {
            key: 'inReview',
            label: 'Design',
            value: apiData?.Design_Phase,
        },
        {
            key: 'design & execution',
            label: 'Design & Execution',
            value: apiData?.Design_Execution
        },
        {
            key: 'inProgress',
            label: 'Execution',
            value:apiData?.Execution_Phase,
        },
        
        {
            key: 'completed',
            label: 'Completed',
            value: apiData?.completed,
        },
    ]
    const role=localStorage.getItem('role') || '';
    const {roleData} = useRoleContext();
    const hasProjectReadPermission = roleData?.data?.project?.read?.includes(role);
    const hasLeadReadPermission = roleData?.data?.lead?.read?.includes(role);
    return (
        <div className="flex flex-col gap-4 h-full">
         <div className="flex justify-between flex-col lg:flex-row gap-4">
           {hasProjectReadPermission &&<>
                        <Card className="lg:w-1/2">
                    <Statistic data={data} />
                    </Card>
                        <Card className="lg:w-1/2">
                        <h3 className="mb-3">Project Type</h3>
                        <Chart
            options={{
                colors: COLORS,
                labels: ['Commercial', 'Residential'],
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            chart: {
                                width: 150,
                                height: 100,
                            },
                            legend: {
                                position: 'bottom',
                            },
                        },
                    },
                ],
            }}
            series={[parseInt(apiData?.commercial), parseInt(apiData?.residential)]}
            height={250}
            type="pie"
        />
                    </Card>
                    </>
        }
                    </div>
                <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
                </div>
                {hasProjectReadPermission &&
                <Project />
}
                {hasLeadReadPermission &&
               <Leads />}
               {(!hasProjectReadPermission && !hasLeadReadPermission) && <FileManager />}
                
          
        </div>
    )
}

export default CrmDashboard
