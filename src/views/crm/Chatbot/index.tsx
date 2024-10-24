import { Button } from "@/components/ui/Button";
import { useContext, useEffect, useRef, useState } from "react";
import { LuSendHorizonal } from "react-icons/lu";
import { IoCopyOutline } from "react-icons/io5";
import { IoCheckmarkDone } from "react-icons/io5";
import { InputGroup, Skeleton } from "@/components/ui";
import { UserDetailsContext } from '@/views/Context/userdetailsContext'
import Input from '@/components/ui/Input'

interface Message {
    text: string;
    sender: "user" | "bot";
}

const Index = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<any>([]);

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
            const response = await fetch(`https://chatbot.test.initz.run/query/`, {
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

                    accumulatedMessages += decoder.decode(value, { stream: true });
                }
            }


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

            // After receiving all data, we create a single message for the bot
            if (accumulatedMessages.startsWith("data: ")) {
                const message = accumulatedMessages.slice(6).trim();
                setMessages((prevMessages: any) => [
                    ...prevMessages,
                    { text: message, sender: "bot" },
                ]);
            }

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
            <h2 className="mb-2">Chat Bot</h2>
            <form onSubmit={handleSubmit} className="flex flex-col h-full ">
                <div className="bg-gray-100 dark:bg-[#1F2937] messages flex-1 h-96 overflow-y-auto mb-4 border border-gray-300 rounded-lg p-2">
                    {messages.map((message: any, index: any) => (

                        <div className={`flex w-full ${message.sender === "user" ? "justify-end" : "justify-start"}`}>

                            <div
                                key={index}
                                ref={(el) => (messageRefs.current[index] = el)}
                                className={`relative flex gap-2 flex-col message p-2 rounded mb-2 ${message.sender === "user" ? "bg-blue-100" : "bg-white dark:bg-[#111827] dark:border-none  px-3 border-[0.13rem] border-blue-100 w-[70%]"
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
                                )) : message.text.split('data: ').map((line: any, lineIndex: any) => (
                                    <div className="flex justify-start" key={lineIndex}><span>{lineIndex + 1}{". "}{line}{lineIndex < message.text.split('\n').length - 1 && <br />}</span></div>

                                ))}



                            </div>
                        </div>

                    ))}
                    {loading && <Skeleton width={850} height={100} />}
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