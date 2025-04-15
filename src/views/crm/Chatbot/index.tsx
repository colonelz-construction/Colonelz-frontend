import { Button } from "@/components/ui/Button";
import { useContext, useEffect, useRef, useState } from "react";
import { IoCopyOutline } from "react-icons/io5";
import { IoCheckmarkDone } from "react-icons/io5";
import { FaCircleArrowUp } from "react-icons/fa6";
import { Dropdown, FormItem, InputGroup, Tooltip, Upload } from "@/components/ui";
import { UserDetailsContext } from '@/views/Context/userdetailsContext'
import Input from '@/components/ui/Input'
import ActionLink from '../../../components/shared/ActionLink';
import { FaChevronCircleUp } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import ScrollableFeed from "react-scrollable-feed";
import { apiGetCrmFileManagerDrawingData, apiGetUserData } from "@/services/CrmService";
import Tag from '@/components/ui/Tag'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const chatApiUrl = import.meta.env.VITE_CHATAPI_URL;
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface Message {
    text: string;
    sender: "user" | "bot";
}

interface FormData {
    question: string;
    file: File[];
}

const Index = () => {
    const [inputValue, setInputValue] = useState('');
    const [project_id, setProject_id] = useState('');
    const [fileUrl, setFileUrl] = useState<(any)>([null]);

    const [whole, setWhole] = useState<any>('');
    const [formData, setFormData] = useState<FormData>({
        question: '',
        file: [],
    });


    const [queryType, setQueryType] = useState<any>("crm");
    const [placeHolder, setPlaceHolder] = useState<any>("Ask Anything...");
    const [isFileChosen, setIsFileChosen] = useState<any>(true);

    const [user, setUser] = useState<any>('')
    useEffect(() => {

        const fetchData = async () => {
            try {
                const res = await apiGetUserData(localStorage.getItem("userId"))
                setUser(res?.data?.username)
            } catch (error) {

            }
        }

        fetchData();

    }, [])

    const data = useContext<any>(UserDetailsContext)
    const [messages, setMessages] = useState<any>([]);

    console.log("messages", messages);

    useEffect(() => {
        const greetingMessage: any = [{
            text: `data: {"content":"Hello ${user ? user : "there"}! How can I assist you today?"}`,
            sender: 'bot',
            type: "crm"
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
            setCopiedMessageIndex(index);
            setTimeout(() => setCopiedMessageIndex(null), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const fetchMail = async (inputValue: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${chatApiUrl}mail-gen`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: inputValue }),
            });
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedMessages = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: false });

                    accumulatedMessages += chunk;

                    setMessages((prevMessages: any) => {
                        const lastMessage = prevMessages[prevMessages.length - 1];
                        if (lastMessage?.sender === "user") {
                            return [
                                ...prevMessages,
                                { text: chunk.trim(), sender: "bot", type: "email" },
                            ];
                        } else {
                            const newMessageText = (lastMessage?.text || "") + chunk;
                            return [
                                ...prevMessages.slice(0, -1), // Remove the last entry
                                { text: newMessageText.trim(), sender: "bot", type: "email" }, // Append the new chunk
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
                    { text: newMessageText.trim(), sender: "bot", type: "email" }, // Append the new chunk
                ];
            })

            if (accumulatedMessages.includes("404: Project not found.")) {
                setMessages((prevMessages: any) => [
                    ...prevMessages,
                    { text: `data: {"content":"There is no project with this name"}`, sender: "bot", type: "email" },
                ]);
                return
            }
            if (accumulatedMessages.includes("lead not found")) {
                setMessages((prevMessages: any) => [
                    ...prevMessages,
                    { text: 'data: {"content":"There is no Lead with this name"}', sender: "bot", type: "email" },
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
                { text: `data: {"content":"There was some problem communicating with the Ada."}`, sender: "bot", type: "email" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummaryData = async () => {
        const postData = new FormData();

        postData.append('file', formData.file[0]);
        postData.append('question', inputValue ? inputValue : "");
        try {
            setLoading(true);
            const response = await fetch(`https://ada-bot.test.initz.run/summary`, {
                method: "POST",
                body: postData,
            });
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedMessages = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: false });

                    accumulatedMessages += chunk;

                    setMessages((prevMessages: any) => {
                        const lastMessage = prevMessages[prevMessages.length - 1];
                        if (lastMessage?.sender === "user") {
                            return [
                                ...prevMessages,
                                { text: chunk.trim(), sender: "bot", type: "summary" },
                            ];
                        } else {
                            const newMessageText = (lastMessage?.text || "") + chunk;
                            return [
                                ...prevMessages.slice(0, -1), // Remove the last entry
                                { text: newMessageText.trim(), sender: "bot", type: "summary" }, // Append the new chunk
                            ];
                        }
                    });
                }
            }

            setMessages((prevMessages: any) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                const newMessageText = (lastMessage?.text || "") + 'responseEnd';
                return [
                    ...prevMessages.slice(0, -1),
                    { text: newMessageText.trim(), sender: "bot", type: "summary" }, // Append the new chunk
                ];
            })

            if (accumulatedMessages.includes("404: Project not found.")) {
                setMessages((prevMessages: any) => [
                    ...prevMessages,
                    { text: `data: {"content":"There is no project with this name"}`, sender: "bot", type: "summary" },
                ]);
                return
            }
            if (accumulatedMessages.includes("lead not found")) {
                setMessages((prevMessages: any) => [
                    ...prevMessages,
                    { text: 'data: {"content":"There is no Lead with this name"}', sender: "bot", type: "summary" },
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
                { text: `data: {"content":"There was some problem communicating with the Ada."}`, sender: "bot", type: "summary" },
            ]);
        } finally {
            setLoading(false);
        }
    };



    const fetchData = async (inputValue: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${chatApiUrl}query/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: inputValue, org_id, user_id }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedMessages = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: false });
                    const regex = /"content":"(.*?)"/g;
                    const matches = Array.from(chunk.matchAll(regex));
                    const extractedContents = matches.map(match => match[1]);

                    // console.log("extractedContents", extractedContents);

                    let isCollecting = false;
                    let result = '';
                    const popularExtensions = ['txt', '.txt', 'pdf', '.pdf', 'png', '.png', 'jpg', '.jpg', 'jpeg', '.jpeg', 'csv', '.csv', 'doc', '.doc', 'docx', '.docx', 'xls', '.xls', 'xlsx', '.xlsx', 'mp4', '.mp4', 'mp3', '.mp3', 'zip', '.zip', 'rar', '.rar', 'gif', '.gif'];

                    let tempStr = '';
                    extractedContents.forEach(str => {

                        tempStr = tempStr + str;

                        str = str.trim();
                        if (str === ' https' || str === 'https' || str === 'http' || str === 'htt') isCollecting = true;
                        if (isCollecting) result += str;
                        if (popularExtensions.includes(str)) isCollecting = false;
                    });

                    // setWhole(tempStr);

                    setFileUrl((prevUrls: any) => [...prevUrls, result ? result : null]);

                    accumulatedMessages += chunk;

                    setMessages((prevMessages: any) => {
                        const lastMessage = prevMessages[prevMessages.length - 1];
                        if (lastMessage?.sender === "user") {
                            return [
                                ...prevMessages,
                                { text: chunk.trim(), sender: "bot", type: "crm" },
                            ];
                        } else {
                            const newMessageText = (lastMessage?.text || "") + chunk;

                            return [
                                ...prevMessages.slice(0, -1), // Remove the last entry
                                { text: newMessageText.trim(), sender: "bot", type: "crm" }, // Append the new chunk
                            ];
                        }
                    });
                }
            }

            // console.log("accumulatedMessages", accumulatedMessages);

            setMessages((prevMessages: any) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                const newMessageText = (lastMessage?.text || "") + 'responseEnd';
                return [
                    ...prevMessages.slice(0, -1), // Remove the last entry
                    { text: newMessageText.trim(), sender: "bot", type: "crm" }, // Append the new chunk
                ];
            })

            if (accumulatedMessages.includes("404: Project not found.")) {
                setMessages((prevMessages: any) => [
                    ...prevMessages,
                    { text: `data: {"content":"There is no project with this name"}`, sender: "bot", type: "crm" },
                ]);
                return
            }
            if (accumulatedMessages.includes("lead not found")) {
                setMessages((prevMessages: any) => [
                    ...prevMessages,
                    { text: 'data: {"content":"There is no Lead with this name"}', sender: "bot", type: "crm" },
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
                { text: `data: {"content":"There was some problem communicating with the Ada."}`, sender: "bot", type: "crm" },
            ]);
        } finally {
            setLoading(false);
        }
    };



    const fetchSummaryData2 = async () => {
        const postData = new FormData();

        postData.append('file', formData.file[0]);
        postData.append('question', inputValue ? inputValue : "");


        try {
            setLoading(true);
            const response = await fetch(`https://ada-bot.test.initz.run/summary`, {
                method: "POST",
                body: postData,
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedMessages = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: false });
                    const regex = /"summary":"(.*?)"/g;
                    const matches = Array.from(chunk.matchAll(regex));
                    const extractedContents = matches.map(match => match[1]);

                    // console.log("extractedContents", extractedContents);

                    let isCollecting = false;
                    let result = '';
                    const popularExtensions = ['txt', '.txt', 'pdf', '.pdf', 'png', '.png', 'jpg', '.jpg', 'jpeg', '.jpeg', 'csv', '.csv', 'doc', '.doc', 'docx', '.docx', 'xls', '.xls', 'xlsx', '.xlsx', 'mp4', '.mp4', 'mp3', '.mp3', 'zip', '.zip', 'rar', '.rar', 'gif', '.gif'];

                    let tempStr = '';
                    extractedContents.forEach(str => {

                        tempStr = tempStr + str;

                        str = str.trim();
                        if (str === ' https' || str === 'https' || str === 'http' || str === 'htt') isCollecting = true;
                        if (isCollecting) result += str;
                        if (popularExtensions.includes(str)) isCollecting = false;
                    });

                    accumulatedMessages += chunk;

                    setMessages((prevMessages: any) => {
                        const lastMessage = prevMessages[prevMessages.length - 1];
                        if (lastMessage?.sender === "user") {
                            return [
                                ...prevMessages,
                                { text: chunk.trim(), sender: "bot", type: "crm" },
                            ];
                        } else {
                            const newMessageText = (lastMessage?.text || "") + chunk;

                            return [
                                ...prevMessages.slice(0, -1), // Remove the last entry
                                { text: newMessageText.trim(), sender: "bot", type: "crm" }, // Append the new chunk
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
                    { text: newMessageText.trim(), sender: "bot", type: "crm" },
                ];
            })

        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            setMessages((prevMessages: any) => [
                ...prevMessages,
                { text: `data: {"content":"There was some problem communicating with the Ada."}`, sender: "bot", type: "crm" },
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
        if (queryType != "summary" && !inputValue.trim()) return;

        setMessages((prevMessages: any) => [
            ...prevMessages,
            { text: inputValue, sender: "user" },
        ]);

        if (queryType === "crm") {
            fetchData(inputValue);

        } else if (queryType === "email") {
            fetchMail(inputValue);
        }
        else if (queryType === "summary") {
            fetchSummaryData();
        }
        setInputValue('');
    };

    const handleClear = () => {
        const greetingMessage: any = [{
            text: `data: {"content":"Hello ${user ? user : "there"}! How can I assist you today?"}`,
            sender: 'bot',
            type: "crm"
        }]
        setMessages(greetingMessage)
    }

    const handleFileChange = (file: File[] | null) => {
        if (file) {
            setIsFileChosen(true);
            setFormData((prevFormData: any) => ({
                ...prevFormData,
                file: Array.from(file),
            }))

        }
    }


    const questionTags = [{ name: 'crm', state: false, dis: "Ask About CRM", placeHold: "Ask Anything..." },
    { name: 'email', state: false, dis: 'Draft Email', placeHold: "Write the Topic..." },
    {
        name: 'summary',
        state: false,
        dis: "Get Summary",
        placeHold: "Ask Related Questions (Optional)..."
    },
    ];

    const SearchTag = ({ tag }: any) => {
        const handleTagChange = (tag: any) => {
            setQueryType(tag.name);
            setPlaceHolder(tag.placeHold);
            handleClear();
        }

        return <div className="flex">
            <div onClick={() => handleTagChange(tag)} className="mr-2 rtl:ml-2 cursor-pointer">
                <Tag className={`text-sm ${queryType === tag.name ? 'bg-gray-200 dark:bg-[#354051]' : "bg-white dark:bg-[#1F2937]"}`}>{tag.dis}</Tag>
            </div>
        </div>
    }


    const Toggle = <Tooltip title={
        <div className="text-[0.6rem]">
            Example prompt questions
        </div>
    }><span className='flex justify-center items-center gap-2 text-lg cursor-pointer'>
            <span><HiOutlineExclamationCircle /></span></span> </Tooltip>

    return (
        <div className="h-full mb-4">
            <div className="flex justify-between">
                <h2 className="mb-2 text-blue-700">Ada</h2>
                <Button size="sm" className="" onClick={handleClear}>Clear</Button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col h-full gap-4">
                <div className="flex flex-col bg-gray-100 dark:bg-[#1F2937] messages flex-1 h-[23rem] overflow-y-auto border border-gray-300 rounded-lg p-2">
                    <ScrollableFeed className="h-full flex flex-col scrollbar-thumb-[#d4d1d1] scrollbar-thin scrollbar-track-transparent pr-6">
                        {(
                            console.log(messages, "Messages"),
                            messages.map((message: any, index: any) => (
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
                                        ))



                                            : message.text?.split('data: ').filter((line: any) => (!line.includes('project_id:') && !line.includes("lead_id:"))).map((line: any, lineIndex: any, lines: any) => {
                                                const projectIdMatch = message.text.match(/project_id:(.{11})/);
                                                const projectId = projectIdMatch && projectIdMatch[1];

                                                const leadIdMatch = message.text.match(/lead_id:(.{6})/);
                                                const leadId = leadIdMatch && leadIdMatch[1];

                                                const taskIdMatch = message.text.match(/task_id:(.{9})/);
                                                const taskId = taskIdMatch && taskIdMatch[1];

                                                const userId = localStorage.getItem('userId')

                                                let match;
                                                if (queryType === "summary") {
                                                    if(line.includes("responseEnd"))
                                                    match = line.match(/{"summary":"Chunk 1:(.*?)"}/s);
                                                else match = line.replace("responseEnd", "").replace("data:", "").match(/"content":"(.*?)"/);
                                                  } else {
                                                    match = line.replace("responseEnd", "").replace("data:", "").match(/"content":"(.*?)"/);
                                                  }

                                                let lineShow = ''
                                                let testShow = ''

                                                if (match) {
                                                    testShow = `${match[1].replace(/\\n/g, '\n')}`
                                                }

                                                console.log(testShow)

                                                if (match) {
                                                    lineShow = match[1].replace("\\n\\n", "").replace("\\n", "").replace(":\\n", "").replace("**", "")
                                                }
                                                return (
                                                    <span className="" key={lineIndex}>
                                                        {message.type === 'crm' && <span className={lineShow == '\\t' ? "ml-4" : ""}>
                                                            {lineShow.replace(/["*\n]/g, "").replace("\\t", "").replace("+", "")}
                                                        </span>}

                                                        {message.type === 'crm' && line.includes("\\n") && <br />}

                                                        {message.type === 'email' && <div style={{ whiteSpace: "pre-line" }}>
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{testShow}</ReactMarkdown>
                                                        </div>}

                                                        {message.type === 'summary' && <div style={{ whiteSpace: "pre-line" }}>
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{testShow}</ReactMarkdown>
                                                        </div>}

                                                        {message.type === 'crm' && fileUrl[index / 2] != null && lineIndex === lines.length - 1 &&
                                                            line.includes('responseEnd') &&
                                                            <div className="flex mt-[0.30rem]">
                                                                <div>
                                                                    <ActionLink target="_blank" to={fileUrl[index / 2]}>
                                                                        {"Click here "}
                                                                    </ActionLink>
                                                                    to view file

                                                                </div>
                                                            </div>
                                                        }

                                                        {/* For project  Tasks */}
                                                        {message.type === 'crm' && line.includes('responseEnd') && projectId && taskId && projectId != '00000000000' && taskId != '222222222' ? lineIndex === lines.length - 1 && (
                                                            <div className="flex mt-[0.30rem]">
                                                                <div>
                                                                    <ActionLink target="_blank" to={`/app/crm/Projects/TaskDetails?project_id=${projectId}&task=${taskId}`}>
                                                                        {"Click here "}
                                                                    </ActionLink>
                                                                    to see more info
                                                                </div>

                                                            </div>

                                                        ) : message.type === 'crm' && line.includes('responseEnd') && projectId && taskId && projectId != '00000000000' && taskId == '222222222' && lineIndex === lines.length - 1 && (
                                                            <div className="flex ">
                                                                <div>
                                                                    <ActionLink target="_blank" to={`/app/crm/project-details?project_id=${projectId}&id=${userId}&type=task`}>
                                                                        {"Click here "}
                                                                    </ActionLink>
                                                                    to see more info
                                                                </div>


                                                            </div>

                                                        )}

                                                        {/* For lead  Tasks */}
                                                        {message.type === 'crm' && line.includes('responseEnd') && leadId && taskId && leadId != '111111' && taskId != '222222222' ? lineIndex === lines.length - 1 && (
                                                            <div className="flex mt-[0.30rem]">
                                                                <div>
                                                                    <ActionLink target="_blank" to={`/app/crm/Leads/TaskDetails?lead_id=${leadId}&task=${taskId}`}>
                                                                        {"Click here "}
                                                                    </ActionLink>
                                                                    to see more info
                                                                </div>

                                                            </div>

                                                        ) : message.type === 'crm' && line.includes('responseEnd') && leadId && taskId && leadId != '111111' && taskId == '222222222' && lineIndex === lines.length - 1 && (
                                                            <div className="flex ">
                                                                <div>
                                                                    <ActionLink target="_blank" to={`/app/crm/lead/?id=${leadId}&tab=Tasks`}>
                                                                        {"Click here "}
                                                                    </ActionLink>
                                                                    to see more info
                                                                </div>


                                                            </div>

                                                        )}

                                                        {/* For open  Tasks */}
                                                        {message.type === 'crm' && line.includes('responseEnd') && !leadId && !projectId && taskId && leadId != '111111' && taskId != '222222222' ? lineIndex === lines.length - 1 && (
                                                            <div className="flex mt-[0.30rem]">
                                                                <div>
                                                                    <ActionLink target="_blank" to={`/app/crm/Tasks/OpenTaskDetails?task=${taskId}`}>
                                                                        {"Click here "}
                                                                    </ActionLink>
                                                                    to see more info
                                                                </div>

                                                            </div>

                                                        ) : message.type === 'crm' && line.includes('responseEnd') && !leadId && !projectId && taskId && leadId != '111111' && taskId == '222222222' && lineIndex === lines.length - 1 && (
                                                            <div className="flex ">
                                                                <div>
                                                                    <ActionLink target="_blank" to={`/app/crm/taskManager?tab=all`}>
                                                                        {"Click here "}
                                                                    </ActionLink>
                                                                    to see more info
                                                                </div>


                                                            </div>

                                                        )}

                                                        {/* For Project */}
                                                        {message.type === 'crm' && line.includes('responseEnd') && projectId && !taskId && projectId != '00000000000' ? lineIndex === lines.length - 1 && (
                                                            <div className="flex mt-[0.30rem]">
                                                                <div>
                                                                    <ActionLink target="_blank" to={`/app/crm/project-details?project_id=${projectId}&id=${userId}&type=details`}>
                                                                        {"Click here "}
                                                                    </ActionLink>
                                                                    to see more info
                                                                </div>

                                                            </div>

                                                        ) : message.type === 'crm' && line.includes('responseEnd') && projectId && !taskId && projectId == '00000000000' && lineIndex === lines.length - 1 && (
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
                                                        {message.type === 'crm' && line.includes('responseEnd') && leadId && !taskId && leadId != '111111' ? lineIndex === lines.length - 1 && (
                                                            <div className="flex ">
                                                                <div>
                                                                    <ActionLink target="_blank" to={`/app/crm/lead/?id=${leadId}&tab=Details`}>
                                                                        {"Click here "}
                                                                    </ActionLink>
                                                                    to see more info
                                                                </div>
                                                            </div>

                                                        ) : message.type === 'crm' && line.includes('responseEnd') && leadId && leadId == '111111' && lineIndex === lines.length - 1 && (
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
                            ))
                        )}

                        {loading && <div className={`relative gap-2 message rounded p-1 mb-2 bg-white dark:bg-[#111827] dark:border-none  px-3 w-[70%] group text-[1.7rem]`}><GoDotFill /></div>}
                    </ScrollableFeed>

                </div>

                <div className="flex items-center justify-center">

                    <div className="flex justify-center items-center">
                        {questionTags.map((tag: any) => {
                            return (<div>
                                <SearchTag tag={tag} />
                            </div>)
                        })}
                    </div>

                    {queryType === "crm" && <div>
                        <Dropdown renderTitle={Toggle} placement='top-end'>



                            <div className="w-[20rem] p-4 flex flex-col gap-2">
                                <span className="text-[1rem] font-semibold text-gray-500">Some example of prompt questions</span>

                                <div className="flex flex-col gap-1 text-gray-400 text-[0.74rem]">
                                    <div>{"1. give detials of project <PROJECT_NAME>."}</div>
                                    <div>{"2. what is project start date?"}</div>
                                    <div>{"3. give the name of designer."}</div>
                                    <div>{"4. give details of lead <LEAD_NAME>."}</div>
                                    <div>{"5. give the all details of mom of project <PROJECT_NAME>."}</div>
                                    <div>{"6. give details of task <TASK_NAME> of porject <PROJECT_NAME>."}</div>
                                    <div>{"7. give details of subtask <SUBTASK_NAME> of task <TASK_NAME>."}</div>
                                    <div>{"8. give the details of all subtasks of project <PROJECT_NAME>."}</div>
                                    <div>{"9. give details of user <USER_NAME>."}</div>

                                </div>
                            </div>
                        </Dropdown>
                    </div>}

                </div>
                {queryType === "summary" && (
                    <div className="flex items-center justify-center gap-2">
                        <Upload onChange={handleFileChange} showList={true} uploadLimit={1} multiple={false}>
                            {/* <FiPaperclip className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500 h-6 w-6" /> */}
                            <div className="border dark:border-[#4b5563] p-1.5 cursor-pointer rounded-2xl text-sm text-center">Upload PDF</div>
                        </Upload>
                    </div>
                )}

                <InputGroup className="bottom-0 border rounded-md border-[#9f9e9e]">
                {/* {queryType === "summary" && (
                            <div className="flex flex-col items-center justify-center ">
                                <FormItem label="File">
                                    <Upload
                                        draggable
                                        onChange={(file) => handleFileChange(file)}
                                        multiple={false}
                                    />
                                </FormItem>
                            </div>
                        )} */}
                    <Input
                        placeholder={placeHolder}
                        type="text"
                        value={inputValue}
                        onChange={handleChange}
                        className="focus:ring-0 flex-1 w-6 text-[1.1rem] p-2 rounded-l-md border-r-0"
                        autoFocus
                    />
                    <Button
                        icon={<FaCircleArrowUp className="text-[1.7rem] text-[#9f9e9e] hover:text-[#6d6c6c]" />}
                        type="submit"
                        className="w-12 border-l-[0.2rem]"
                    />
                </InputGroup>
            </form>
        </div>
    );
};

export default Index;
