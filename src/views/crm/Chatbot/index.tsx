import { Button } from "@/components/ui/Button";
import { useContext, useEffect, useRef, useState } from "react";
import { IoCopyOutline } from "react-icons/io5";
import { IoCheckmarkDone } from "react-icons/io5";
import { InputGroup } from "@/components/ui";
import { UserDetailsContext } from '@/views/Context/userdetailsContext'
import Input from '@/components/ui/Input'
import ActionLink from '../../../components/shared/ActionLink';
import { FaChevronCircleUp } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import ScrollableFeed from "react-scrollable-feed";
import { apiGetUserData } from "@/services/CrmService";

interface Message {
    text: string;
    sender: "user" | "bot";
}

const Index = () => {
    const [inputValue, setInputValue] = useState('');
    const [project_id, setProject_id] = useState('');
    const [fileUrl, setFileUrl] = useState<(any)>([null]);
      
    const [user, setUser] = useState<any>('')
    useEffect(() => {

        const fetchData = async() => {
            try {
                const res = await apiGetUserData(localStorage.getItem("userId"))
                console.log(res)
             
                setUser(res?.data?.username)
                
            } catch (error) {
                
            }
        }

        fetchData();

    }, [])

    const data = useContext<any>(UserDetailsContext)
    const [messages, setMessages] = useState<any>([]);

    useEffect(() => {
        const greetingMessage: any = [{
            text: `data: {"content":"Hello ${user ? user : "there"}! How can I assist you today?"}`,
            sender: 'bot',
        }]

        setMessages(greetingMessage)

    }, [user])

    const org_id = localStorage.getItem("orgId")
    const user_id = localStorage.getItem("userId")

    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<any>(false);
    const messageRefs = useRef<any>([]);

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

            console.log(response)

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedMessages = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    // Decode the chunk and append to the accumulated message
                    const chunk = decoder.decode(value, { stream: false });

                    console.log(chunk)
                    const regex = /"content":"(.*?)"/g;

                            // Use matchAll to find all matches
                            const matches = Array.from(chunk.matchAll(regex));

                            // Extract the first capture group (the actual content)
                            const extractedContents = matches.map(match => match[1]);

                            let isCollecting = false;
                            let result = '';
                            const popularExtensions = ['txt', '.txt', 'pdf', '.pdf', 'png', '.png', 'jpg', '.jpg', 'jpeg', '.jpeg', 'csv', '.csv', 'doc', '.doc', 'docx', '.docx', 'xls', '.xls', 'xlsx', '.xlsx', 'mp4', '.mp4', 'mp3', '.mp3', 'zip', '.zip', 'rar', '.rar', 'gif', '.gif'];

                            // Iterate through the list
                            extractedContents.forEach(str => {
                                str = str.trim();
                                if (str === ' https' || str === 'https' || str === 'http' || str === 'htt') isCollecting = true; 
                                if (isCollecting) result += str; 
                                if (popularExtensions.includes(str)) isCollecting = false; 
                            });

                            setFileUrl((prevUrls : any) => [...prevUrls, result ? result : null]);
                            
                            console.log(fileUrl)

                    accumulatedMessages += chunk;

                    // Only update the latest chunk, without re-rendering all previous words
                    setMessages((prevMessages: any) => {
                        // Check if the last message is from the user
                        const lastMessage = prevMessages[prevMessages.length - 1];
                        if (lastMessage?.sender === "user") {
                            return [
                                ...prevMessages,
                                { text: chunk.trim(), sender: "bot" },
                            ];
                        } else {
                            // If the last message is from the bot, append to its text
                            const newMessageText = (lastMessage?.text || "") + chunk;

                            // console.log(newMessageText)
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

            if (accumulatedMessages.includes("404: Project not found.")) {
                setMessages((prevMessages: any) => [
                    ...prevMessages,
                    { text: `data: {"content":"There is no project with this name"}`, sender: "bot" },
                ]);
                return
            }
            if (accumulatedMessages.includes("lead not found")) {
                setMessages((prevMessages: any) => [
                    ...prevMessages,
                    { text: 'data: {"content":"There is no Lead with this name"}', sender: "bot" },
                ]);
                return
            }

            const match: any = accumulatedMessages.match(/project_id:(.{11})/);
            if (match) {
                const result = match[1]
                setProject_id(result)
            }

        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            setMessages((prevMessages: any) => [
                ...prevMessages,
                { text: `data: {"content":"There was some problem communicating with the Ada."}`, sender: "bot" },
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

    const handleClear = () => {
        const greetingMessage: any = [{
            text: `data: {"content":"Hello ${user ? user : "there"}! How can I assist you today?"}`,
            sender: 'bot',
        }]
        setMessages(greetingMessage)
    }

    return (
        <div className="h-full mb-4">
            <div className="flex justify-between">
                <h2 className="mb-2 text-blue-700">Ada</h2>
                <Button size="sm" className="" onClick={handleClear}>Clear</Button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col h-full ">
                <div className="flex flex-col bg-gray-100 dark:bg-[#1F2937] messages flex-1 h-96 overflow-y-auto mb-4 border border-gray-300 rounded-lg p-2">
                    <ScrollableFeed className="h-full flex flex-col scrollbar-thumb-[#d4d1d1] scrollbar-thin scrollbar-track-transparent pr-6">
                        {messages.map((message: any, index: any) => (
                            <div className={`flex w-full ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    key={index}
                                    ref={(el) => (messageRefs.current[index] = el)}
                                    className={`relative gap-2 message p-2 rounded ${message.sender === "user" ? "bg-blue-100 dark:bg-[#46516b] my-2" : "bg-white dark:bg-[#111827] dark:border-none  px-3 w-[70%]"
                                        } group`}>
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

                                        message.text?.split('data: ').filter((line: any) => (!line.includes('project_id:') && !line.includes("lead_id:"))).map((line: any, lineIndex: any, lines: any) => {
                                            // Use regex to extract project ID if present in the line
                                            const projectIdMatch = message.text.match(/project_id:(.{11})/);
                                            const projectId = projectIdMatch && projectIdMatch[1];

                                            const leadIdMatch = message.text.match(/lead_id:(.{6})/);
                                            const leadId = leadIdMatch && leadIdMatch[1];

                                            const taskIdMatch = message.text.match(/task_id:(.{9})/);
                                            const taskId = taskIdMatch && taskIdMatch[1];

                                            const userId = localStorage.getItem('userId')

                                            const match = line.replace("responseEnd", "").replace("data:", "").match(/"content":"(.*?)"/);

                                            let lineShow = ''

                                            if (match) {
                                                lineShow = match[1].replace("\\n\\n", "").replace("\\n", "").replace(":\\n", "").replace("**", "")
                                            }                                           

                                            return (
                                                <span className="" key={lineIndex}>
                                                    <span className={lineShow == '\\t' ? "ml-4" : ""}>
                                                        {lineShow.replace(/["*\n]/g, "").replace("\\t", "").replace("+", "")}
                                                    </span>
                                                    {line.includes("\\n") && <br />}

                                                    {fileUrl[index/2] != null && lineIndex === lines.length - 1 &&
                                                        line.includes('responseEnd') && 
                                                        <div className="flex mt-[0.30rem]">
                                                            <div>
                                                            <ActionLink target="_blank" to={fileUrl[index/2]}>
                                                                    {"Click here "}
                                                                </ActionLink>
                                                                to view file

                                                            </div>
                                                        </div>
                                                    }

                                                    {/* For Tasks */}
                                                    {line.includes('responseEnd') && projectId && taskId && projectId != '00000000000' && taskId != '222222222' ? lineIndex === lines.length - 1 && (
                                                        <div className="flex mt-[0.30rem]">
                                                            <div>
                                                                <ActionLink target="_blank" to={`/app/crm/Projects/TaskDetails?project_id=${projectId}&task=${taskId}`}>
                                                                    {"Click here "}
                                                                </ActionLink>
                                                                to see more info
                                                            </div>

                                                        </div>

                                                    ) : line.includes('responseEnd') && projectId && taskId && projectId != '00000000000' && taskId == '222222222' && lineIndex === lines.length - 1 && (
                                                        <div className="flex ">
                                                            <div>
                                                                <ActionLink target="_blank" to={`/app/crm/project-details?project_id=${projectId}&id=${userId}&type=task`}>
                                                                    {"Click here "}
                                                                </ActionLink>
                                                                to see more info
                                                            </div>


                                                        </div>

                                                    )}

                                                    {/* For Project */}
                                                    {line.includes('responseEnd') && projectId && !taskId && projectId != '00000000000' ? lineIndex === lines.length - 1 && (
                                                        <div className="flex mt-[0.30rem]">
                                                            <div>
                                                                <ActionLink target="_blank" to={`/app/crm/project-details?project_id=${projectId}&id=${userId}&type=details`}>
                                                                    {"Click here "}
                                                                </ActionLink>
                                                                to see more info
                                                            </div>

                                                        </div>

                                                    ) : line.includes('responseEnd') && projectId && !taskId && projectId == '00000000000' && lineIndex === lines.length - 1 && (
                                                        <div className="flex ">
                                                            <div>
                                                                <ActionLink target="_blank" to={`/app/crm/projectslist`}>
                                                                    {"Click here "}
                                                                </ActionLink>
                                                                to see more info
                                                            </div>
                                                        </div>
                                                    )}


                                                    {/* For Leads */}
                                                    {line.includes('responseEnd') && leadId && leadId != '111111' ? lineIndex === lines.length - 1 && (
                                                        <div className="flex ">
                                                            <div>
                                                                <ActionLink target="_blank" to={`/app/crm/lead/?id=${leadId}&tab=Actions`}>
                                                                    {"Click here "}
                                                                </ActionLink>
                                                                to see more info
                                                            </div>
                                                        </div>

                                                    ) : line.includes('responseEnd') && leadId && leadId == '111111' && lineIndex === lines.length - 1 && (
                                                        <div className="flex ">
                                                            <div>
                                                                <ActionLink target="_blank" to={`/app/leads`}>
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

                        {loading && <div className={`relative gap-2 message rounded p-1 mb-2 bg-white dark:bg-[#111827] dark:border-none  px-3 w-[70%] group text-[1.7rem]`}><GoDotFill /></div>}
                    </ScrollableFeed>
{/* 
                    <Markdown remarkPlugins={[remarkGfm]}>{test}</Markdown> */}
                 
                </div>

                <InputGroup className="bottom-0 border rounded-md border-[#9f9e9e]">
                    <Input
                        placeholder="Ask anything..."
                        type="text"
                        value={inputValue}
                        onChange={handleChange}
                        className="focus:ring-0 flex-1 w-6 text-[1.1rem] p-2 rounded-l-md border-r-0"
                        autoFocus
                    />
                    <Button
                        icon={<FaChevronCircleUp className="text-[1.7rem] text-[#9f9e9e]" />}
                        type='submit'

                        className="w-12 border-l-[0.2rem]"
                    />
                </InputGroup>
            </form>
        </div>
    );
};

export default Index;