import LeadTimeline from './LeadTimeline';

export default LeadTimeline


{/* <Timeline>
          {timelineData && timelineData.map((item: any, index: any) => (
            <div key={index} className=" p-3 mb-3  bg-white">

              <div
                className="cursor-pointer font-bold text-lg flex justify-start gap-2 items-center"
                onClick={() => toggleDetails(index)}
              >
                <span>{openIndex === index ? <MdExpandLess /> : <MdExpandMore />}</span>
                <span className="capitalize"> {item?.project_id ? `Project - ${item?.project_id}` : `Lead - ${item?.lead_id}`}</span>
              </div>


              {openIndex === index && (
                <div className="mt-2 ml-10">

                  <h4 className="font-semibold mt-2 mb-2">Lead Events:</h4>
                  {item.leadEvents.map((lead: any, leadIndex: any) => {

                    return (lead.username && <Timeline.Item
                      key={`lead-${index}-${leadIndex}`}
                      media={
                        <TimelineAvatar className={`bg-${["green", "yellow", "purple", "orange", "red", "teal"][leadIndex % 6]}-500`}>
                          {lead?.type ? lead.type.charAt(0) : "C"}
                        </TimelineAvatar>
                      }
                    >
                      <p className="my-1 flex items-center">
                        <span className="font-semibold">{lead.username} {lead.message}</span>
                        <span className="ml-3">{formatDate(lead?.updated_date)}</span>
                      </p>
                    </Timeline.Item>)

                  })}

                  {item.projectEvents.length > 0 && <h4 className="font-semibold mt-2">Project Events:</h4>}
                  {item.projectEvents.map((lead: any, leadIndex: any) => (
                    <Timeline.Item
                      key={`project-${index}-${leadIndex}`}
                      media={
                        <TimelineAvatar className={`bg-${["green", "yellow", "purple", "orange", "red", "teal"][leadIndex % 6]}-500`}>
                          {lead?.type ? lead.type.charAt(0) : "C"}
                        </TimelineAvatar>
                      }
                    >
                      <p className="my-1 flex items-center">
                        <span className="font-semibold">{lead.username} {lead.message}</span>
                        <span className="ml-3">{formatDate(lead?.updated_date)}</span>
                      </p>
                    </Timeline.Item>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Timeline> */}