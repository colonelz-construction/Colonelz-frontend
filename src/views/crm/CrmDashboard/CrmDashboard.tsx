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

    const data=[
        {
            key: 'inReview',
            label: 'Design',
            value: apiData?.Design_Phase,
            growShrink: -0.7,
        },
        {
            key: 'inReview',
            label: 'Design & Execution',
            value: apiData?.Design_Phase,
            growShrink: -0.7,
        },
        {
            key: 'inProgress',
            label: 'Execution',
            value:apiData?.Execution_Phase,
            growShrink: 5.5,
        },
        
        {
            key: 'completed',
            label: 'Completed',
            value: apiData?.completed,
            growShrink: 2.6,
        },
    ]
    const role=localStorage.getItem('role') || '';
    const {roleData} = useRoleContext();
    const hasProjectReadPermission = roleData?.data?.project?.read?.includes(role);
    const hasLeadReadPermission = roleData?.data?.lead?.read?.includes(role);
    return (
        <div className="flex flex-col gap-4 h-full">
         <div className="flex justify-between gap-4">
            <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.project?.read??[]}
                    >
                        <Card className="w-1/2">
                    <Statistic data={data} />
                    </Card>
                        <Card className="w-1/2">
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
            series={[75, 25]}
            height={250}
            type="pie"
        />
                    </Card>
                    
                    </AuthorityCheck>
                    </div>
                <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
                </div>
                <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.project?.read??[]}
                    >
                <Project />
                </AuthorityCheck>
                <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.lead?.read??[]}
                    >
               <Leads />
               </AuthorityCheck>
               {(!hasProjectReadPermission && !hasLeadReadPermission) && <FileManager />}
                
          
        </div>
    )
}

export default CrmDashboard
