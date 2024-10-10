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

interface Data {
    Execution_Phase: string,
    Design_Phase: string,
    completed: string
}
const CrmDashboard = () => {
    const { apiData, loading } = useProjectContext()
    console.log(apiData)

    const residentialCount = apiData?.projects?.reduce((acc:any, obj:any) => obj.project_type === "residential" ? acc + 1 : acc, 0);
    const commercialCount = apiData?.projects?.length - residentialCount;
    console.log(residentialCount, commercialCount)
    // const apiData : any = []

    // console.log(parseInt(apiData?.commercial))


    const data = [
        {
            key: 'inReview',
            label: 'Design',
            value: apiData?.Design_Phase | 0,
        },
        {
            key: 'design & execution',
            label: 'Design & Execution',
            value: apiData?.Design_Execution | 0
        },
        {
            key: 'inProgress',
            label: 'Execution',
            value: apiData?.Execution_Phase | 0,
        },

        {
            key: 'completed',
            label: 'Completed',
            value: apiData?.completed | 0,
        },
    ]
    const role = localStorage.getItem('role') || '';
    const { roleData } = useRoleContext();
    const hasProjectReadPermission = roleData?.data?.project?.read?.includes(role);
    const hasLeadReadPermission = roleData?.data?.lead?.read?.includes(role);
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex justify-between flex-col lg:flex-row gap-4">
                {hasProjectReadPermission && <>
                    <Card className="lg:w-1/2">
                        <Statistic data={data} />
                    </Card>
                    {/* <Card className="lg:w-1/2">
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
                                tooltip: {
                                    y: {
                                        // Formatter should always return a string
                                        formatter: (value, { seriesIndex }) => {
                                            if (seriesIndex === 0 && isNaN(parseInt(apiData?.commercial))) {
                                                return '0'; // Show '0' for Commercial if data is invalid
                                            }
                                            if (seriesIndex === 1 && isNaN(parseInt(apiData?.residential))) {
                                                return '0'; // Show '0' for Residential if data is invalid
                                            }
                                            return value.toString(); // Show valid value as a string
                                        },
                                    },
                                },
                            }}
                            series={[
                                isNaN(parseInt(apiData?.commercial)) ? 50 : parseInt(apiData?.commercial),
                                isNaN(parseInt(apiData?.residential)) ? 50 : parseInt(apiData?.residential),
                            ]}
                            height={250}
                            type="pie"
                        />


                    </Card> */}

<Card className="lg:w-1/2">
    <h3 className="mb-3">Project Type</h3>
    {isNaN(parseInt(apiData?.commercial)) && isNaN(parseInt(apiData?.residential)) ? (
        <p>No data available</p>
    ) : (
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
                tooltip: {
                    y: {
                        formatter: (value, { seriesIndex }) => {
                            if (seriesIndex === 0) {
                                return commercialCount.toString(); // Show '0' for Commercial if data is invalid
                            }
                            if (seriesIndex === 1) {
                                return residentialCount.toString(); // Show '0' for Residential if data is invalid
                            }
                            return '0'.toString()
                        },
                    },
                },
            }}
            series={[
                isNaN(parseInt(apiData?.commercial)) ? 0 : parseInt(apiData?.commercial),
                isNaN(parseInt(apiData?.residential)) ? 0 : parseInt(apiData?.residential),
            ]}
            height={250}
            type="pie"
        />
    )}
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
