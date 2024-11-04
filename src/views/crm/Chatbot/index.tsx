import { Button } from "@/components/ui/Button";
import { useContext, useEffect, useRef, useState } from "react";
import { LuSendHorizonal } from "react-icons/lu";
import { IoCopyOutline } from "react-icons/io5";
import { IoCheckmarkDone } from "react-icons/io5";
import { InputGroup, Skeleton } from "@/components/ui";
import { UserDetailsContext } from '@/views/Context/userdetailsContext'
import Input from '@/components/ui/Input'
import ActionLink from '../../../components/shared/ActionLink';

interface Message {
    text: string;
    sender: "user" | "bot";
}

const Index = () => {
    const [inputValue, setInputValue] = useState('');
    const [project_id, setProject_id] = useState('');
    const [whileLoading, setWhileLoading] = useState(false);
    // console.log(project_id)
    const [messages, setMessages] = useState<any>([]);
    console.log(messages)

    // console.log(messages.length)

    const org_id = localStorage.getItem("orgId")
    const user_id = localStorage.getItem("userId")

    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<any>(false);


    const messageRefs = useRef<any>([]);
    const data = useContext<any>(UserDetailsContext)

    useEffect(() => {
        const greetingMessage: Message = {
            text: `Hello ${data && data?.username ? data?.username : "there"}! How can I assist you today?`,
            sender: 'bot',
        }
        setMessages((prevMessages: any) => [...prevMessages, greetingMessage])
    }, [])

    const copyToClipboard = (index: any) => {
        let textToCopy = messageRefs.current[index].innerText;
        const regex = /\bCopy\b/;
        textToCopy = textToCopy.replace(regex, '').trim();
        const regex2 = /\bClick here to see more info\b/;
        textToCopy = textToCopy.replace(regex2, '').trim();

        navigator.clipboard.writeText(textToCopy).then(() => {
            console.log('Text copied to clipboard!');
            setCopiedMessageIndex(index);
            setTimeout(() => setCopiedMessageIndex(null), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };




    const fetchData = async (inputValue: string) => {
        try {
            setLoading(true);
            const response = await fetch(`http://127.0.0.1:8000/query/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: inputValue, org_id, user_id }),
            });

            // console.log(response)

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedMessages = "";

            // console.log(reader)

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
    
                    // Decode the chunk and append to the accumulated message
                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedMessages += chunk;
    
                    // Only update the latest chunk, without re-rendering all previous words
                    setMessages((prevMessages: any) => {
                        // Check if the last message is from the user
                        const lastMessage = prevMessages[prevMessages.length - 1];
                        if (lastMessage?.sender === "user") {
                            // If the last message is from the user, add a new bot message
                            return [
                                ...prevMessages,
                                { text: chunk.trim(), sender: "bot" },
                            ];
                        } else {
                            // If the last message is from the bot, append to its text
                            const newMessageText = (lastMessage?.text || "") + chunk;
                            return [
                                ...prevMessages.slice(0, -1), // Remove the last entry
                                { text: newMessageText.trim(), sender: "bot" }, // Append the new chunk
                            ];
                        }
                    });
                }
            }

            setMessages((prevMessages: any) => {

            const lastMessage = prevMessages[prevMessages.length - 1];
            const newMessageText = (lastMessage?.text || "") + 'responseEnd';
            return [
                ...prevMessages.slice(0, -1), // Remove the last entry
                { text: newMessageText.trim(), sender: "bot" }, // Append the new chunk
            ];

        })

            // console.log(accumulatedMessages)


            if (accumulatedMessages.includes("404: Project not found.")) {
                setMessages((prevMessages: any) => [
                    ...prevMessages,
                    { text: "There is no project with this name", sender: "bot" },
                ]);

                return
            }
            if (accumulatedMessages.includes("404: Lead not found.")) {

                setMessages((prevMessages: any) => [
                    ...prevMessages,
                    { text: "There is no Lead with this name", sender: "bot" },
                ]);

                return
            }

            // console.log(accumulatedMessages)

            const match : any= accumulatedMessages.match(/project_id:(.{11})/);
            if(match) {
                const result = match[1]
                setProject_id(result)
            }

            // After receiving all data, we create a single message for the bot
            // if (accumulatedMessages.startsWith("data: ")) {
            //     const message = accumulatedMessages.slice(6).trim();
            //     setMessages((prevMessages: any) => [
            //         ...prevMessages,
            //         { text: message, sender: "bot" },
            //     ]);
            // }

            // console.log(messages)
            setWhileLoading(true)

        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            setMessages((prevMessages: any) => [
                ...prevMessages,
                { text: "There was an error communicating with the chatbot.", sender: "bot" },
            ]);
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!inputValue.trim()) return;

        setMessages((prevMessages: any) => [
            ...prevMessages,
            { text: inputValue, sender: "user" },
        ]);

        fetchData(inputValue);
        setInputValue('');
    };

    return (
        <div className="h-full mb-4">
            <h2 className="mb-2 text-blue-700">Ada</h2>
            <form onSubmit={handleSubmit} className="flex flex-col h-full ">
                <div className="bg-gray-100 dark:bg-[#1F2937] messages flex-1 h-96 overflow-y-auto mb-4 border border-gray-300 rounded-lg p-2">
                    {messages.map((message: any, index: any) => (

                        <div className={`flex w-full ${message.sender === "user" ? "justify-end" : "justify-start"}`}>

                            <div
                                key={index}
                                ref={(el) => (messageRefs.current[index] = el)}
                                className={`relative gap-2 message p-2 rounded mb-2 ${message.sender === "user" ? "bg-blue-100" : "bg-white dark:bg-[#111827] dark:border-none  px-3 border-[0.13rem] border-blue-100 w-[70%]"
                                    } group`}

                            >


                                {message.sender === "bot" &&

                                    <div className="bg-gray-100 dark:bg-[#1F2937] dark:text-white p-1 rounded-md absolute right-1 top-1 flex justify-center items-center cursor-pointer text-black gap-1 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(index)}>

                                        {
                                            copiedMessageIndex === index ? <IoCheckmarkDone /> : <IoCopyOutline />
                                        }

                                        <div>{copiedMessageIndex === index ? "Copied" : `Copy`}</div>
                                    </div>}



                                {" "}
                                {message.sender === "user" ? message.text.split('data: ').map((line: any, lineIndex: any) => (
                                    <div key={lineIndex} className="flex justify-end"><span>{line}{lineIndex < message.text.split('\n').length - 1 && <br />}</span></div>
                                )) : 
                                
                                message.text.split('data: ').filter((line: any) => (!line.includes('project_id:') && !line.includes("lead_id:"))).map((line: any, lineIndex: any, lines:any) => {
                                    // Use regex to extract project ID if present in the line
                                    const projectIdMatch = message.text.match(/project_id:(.{11})/);
                                    const leadIdMatch = message.text.match(/lead_id:(.{6})/);
                                    const projectId = projectIdMatch && projectIdMatch[1];
                                    // console.log(projectId)
                                    const leadId = leadIdMatch && leadIdMatch[1];

                                    // console.log(line)
                                    // console.log(leadId)

                                    // console.log("line", line)
                                    // console.log("lines", lines)
                                    console.log("index", lineIndex)
                                
                                    return (
                                        <span className="" key={lineIndex}>
                                            <span>
                                            {/* <span className={line.includes("How can I assist you today?") ? "hidden": ""}>•</span> */}
                                             {line.replace("responseEnd", "").replace("data:", "")} {" "}

                                             
                                                {/* {lineIndex < message.text.split('\n').length - 1 && <br />} */}
                                            </span>
                                            {line[line.length - 1] === '.' && line.includes('.') && <br/>}
                                
                                            {line.includes('responseEnd') && projectId && projectId != '00000000000' ? lineIndex === lines.length - 1 && (
                                                <div className="flex mt-[0.30rem]">
                                                    {/* <span className="mr-[0.10rem]">•</span> */}

                                                    <div>
                                                        <ActionLink to={`/app/crm/project-details?project_id=${projectId}&id=670d0bdf9a23e9b6436486db&type=details`}>
                                                            {"Click here "}
                                                        </ActionLink>
                                                        to see more info
                                                    </div>
                                                    
                                                </div>
                                                
                                            ) : line.includes('responseEnd') &&  projectId &&  projectId == '00000000000' && lineIndex === lines.length - 1 && (
                                                <div className="flex ">
                                                    {/* <span className="mr-[0.10rem]">•</span> */}

                                                    <div>
                                                        <ActionLink to={`/app/crm/projectslist`}>
                                                        {"Click here "}
                                                        </ActionLink>
                                                        to see more info
                                                    </div>


                                                </div>
                                                
                                            )}
                                            {line.includes('responseEnd') && leadId && leadId != '111111' ? lineIndex === lines.length - 1 && (
                                                <div className="flex ">
                                                    {/* <span className="mr-[0.10rem]">•</span> */}

                                                    <div>
                                                        <ActionLink to={`/app/crm/lead/?id=${leadId}&tab=Actions`}>
                                                            {"Click here "}
                                                        </ActionLink>
                                                        to see more info
                                                    </div>


                                                </div>
                                                
                                            ) :line.includes('responseEnd') &&  leadId &&  leadId == '111111' && lineIndex === lines.length - 1 && (
                                                <div className="flex ">
                                                    {/* <span className="mr-[0.10rem]">•</span> */}

                                                    <div>
                                                        <ActionLink to={`/app/leads`}>
                                                        {"Click here "}
                                                        </ActionLink>
                                                        to see more info
                                                    </div>


                                                </div>
                                                
                                            )}
                                        </span>
                                    );
                                })}

                                

                                



                            </div>
                        </div>

                    ))}
                    {/* {loading && <Skeleton width={850} height={100} />} */}
                </div>

                <InputGroup className="bottom-0">
                    <Input
                        placeholder="Ask anything..."
                        type="text"
                        value={inputValue}
                        onChange={handleChange}
                        className="flex-1 w-6 text-[1.1rem] p-2 rounded-l-md"
                        autoFocus
                    />
                    <Button
                        icon={<LuSendHorizonal className="text-[1.7rem]" />}
                        type='submit'

                        className="w-14"
                    />
                </InputGroup>
            </form>
        </div>
    );
};

export default Index;