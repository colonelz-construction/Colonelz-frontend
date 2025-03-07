import { useEffect, useState } from "react";
import Timeline from "@/components/ui/Timeline";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import { apiGetCrmTimeline, apiGetCrmLeadsDetails } from "@/services/CrmService";
import useQuery from "@/utils/hooks/useQuery";
import { MdExpandMore } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import { Button } from "@/components/ui";
import { StickyFooter } from "@/components/shared";
import { useNavigate } from "react-router-dom";


type leadInterface = {
  username: string,
  role: string,
  updated_date: string,
  message: string,
  tags: string,
  type: string,
  _id: string,
}

const TimelineAvatar = ({ children, ...rest }: any) => (
  <Avatar {...rest} size={25} shape="circle">
    {children}
  </Avatar>
);

const LeadTimeline = () => {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<any | null>(null);
  const query = useQuery();
  const lead_id = query.get("id");
  const org_id = query.get("org_id");
  const [timelineData, setTimelineData] = useState<any | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({});
  // console.log(timelineData)
  const navigate = useNavigate();

  const toggleDetails = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const lead = details?.data?.[0];
  // console.log("Lead ", lead?.name);
  // console.log("Timeline Data", timelineData);
  const formatDate = (date: any): any => {
    return date?.toString()?.replace(/:\d{2}\sGMT.*/, "")?.trim();
  };

  useEffect(() => {
    setLoading(true)
    apiGetCrmTimeline(lead_id).then((response) => {
      if (response.code === 200) {
        setTimelineData(response.data)
        setLoading(false)
      }
      else if (response.code === 404) {
        console.log(`Timeline for Lead ${lead?.name} was not found.`);
      }
    })

    const fetchData = async () => {
      try {
        const response = await apiGetCrmLeadsDetails(lead_id, org_id);
        setLoading(false);
        setDetails(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    setLoading(false);
  }, [])


  const toggleProject = (id: number) => {
    setExpandedProject(expandedProject === id ? null : id);
  };

  // console.log(timelineData)

  const colors = ["bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-red-500", "bg-blue-500"];
  return (
    <>
      <div className="flex justify-between">
        <h3 className="pb-5">Lead - {lead?.name}</h3>
      </div>

      <div className="max-w-[60rem]">

        {timelineData != null ?
          <Timeline>
            {timelineData.map((item: any, index: any) => (
              <div key={index} className="p-3 mb-3 bg-grey-100">
                <div
                  className="cursor-pointer font-bold text-lg flex justify-start gap-2 items-center"
                  onClick={() => toggleDetails(index)}
                >
                  <span>{expandedItems[index] ? <MdExpandMore /> : <MdKeyboardArrowRight />}</span>
                  <span className="capitalize">
                    {item?.project_name ? `Project - ${item?.project_name}` : `Lead - ${item?.lead_name}`}
                  </span>
                </div>

                {expandedItems[index] && (
                  <div className="mt-2 ml-10 border-[0.09rem] p-4 rounded-lg">

                    {item.leadEvents.length > 0 && <span className="font-semibold mt-5 mb-2 text-base">Lead Events</span>}

                    <div className="max-h-40 overflow-y-auto p-2 mb-3 scrollbar-none rounded-xl border">
                    {item.leadEvents.map((lead: any, leadIndex: number) =>
                      lead.username ? (
                        <Timeline.Item
                          key={`lead-${index}-${leadIndex}`}
                          media={
                            <TimelineAvatar
                              className={`bg-${["green", "yellow", "purple", "orange", "red", "teal"][leadIndex % 6]}-500`}
                            >
                              {lead?.type ? lead.type.charAt(0).toUpperCase() : lead?.message?.match(/\bhas\b\s+(\w)/) && lead?.message?.match(/\bhas\b\s+(\w)/)[1]}
                            </TimelineAvatar>
                          }
                        >
                          <p className="my-1 flex items-center">
                            <span className="font-semibold"><span className="font-semibold text-gray-900 dark:text-gray-100">{lead.username} </span> {lead.message}</span>
                            <span className="ml-3 font-semibold text-gray-900 dark:text-gray-100">{formatDate(lead?.updated_date)}</span>
                          </p>
                        </Timeline.Item>
                      ) : null
                    )}
                    </div>

                    {item.projectEvents.length > 0 && <span className="font-semibold mt-2 mb-2 text-base">Project Events</span>}
                    {item.projectEvents.length > 0 && <div className="max-h-40 overflow-y-auto p-2 scrollbar-none rounded-xl border">
                    {item.projectEvents.map((lead: any, leadIndex: number) => (
                      <Timeline.Item
                        key={`project-${index}-${leadIndex}`}
                        media={
                          <TimelineAvatar
                            className={`bg-${["green", "yellow", "purple", "orange", "red", "teal"][leadIndex % 6]}-500`}
                          >
                            {lead?.type ? lead.type.charAt(0).toUpperCase() : lead?.message?.match(/\bhas\b\s+(\w)/) && lead?.message?.match(/\bhas\b\s+(\w)/)[1]}
                          </TimelineAvatar>
                        }
                      >
                        <p className="my-1 flex items-center">
                          <span className="font-semibold"><span className="font-semibold text-gray-900 dark:text-gray-100">{lead.username} </span>{lead.message}</span>
                          <span className="ml-3 font-semibold text-gray-900 dark:text-gray-100">{formatDate(lead?.updated_date)}</span>
                        </p>
                      </Timeline.Item>
                    ))}
                    </div>}
                  </div>
                )}
              </div>
            ))}
          </Timeline> :
          <h4 className="pb-5 font-semibold">Timeline for Lead {lead?.name} was not found.</h4>
        }

      </div >

      <StickyFooter
        className="-mx-8 px-8 flex items-center justify-between py-4 mt-7"
        stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      >
        <div className="md:flex items-center">
          <Button
            size="sm"
            className="ltr:mr-3 rtl:ml-3"
            type="button"
            onClick={() => {
              navigate('/app/crm/timeline')
            }}
          >
            Back
          </Button>
        </div>
      </StickyFooter>
    </>
  );
};

export default LeadTimeline;


