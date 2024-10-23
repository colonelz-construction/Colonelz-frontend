import { Button } from "@/components/ui/Button";
import { useEffect, useRef, useState } from "react";
import { LuSendHorizonal } from "react-icons/lu";
import { IoCopyOutline } from "react-icons/io5";
import { IoCheckmarkDone } from "react-icons/io5";
import { Skeleton } from "@/components/ui";
import Input from '@/components/ui/Input'
 
interface Message {
    text: string;
    sender: "user" | "bot";
}
 
const Index = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<any>([]);
 
    console.log(messages)
    // const [data, setData] = useState<any>([]);
    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<any>(false);
 
 
    const messageRefs = useRef<any>([]);
 
    const copyToClipboard = (index: any) => {
        const textToCopy = messageRefs.current[index].innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            console.log('Text copied to clipboard!');
            setCopiedMessageIndex(index); // Set the copied message index
        setTimeout(() => setCopiedMessageIndex(null), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
       
 
    };
 
    console.log(messages)
 
    const fetchData = async (inputValue: string) => {
        try {
            setLoading(true);
            const response = await fetch(`https://chatbot.test.initz.run/query/`, {
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
 
                    accumulatedMessages += decoder.decode(value, { stream: true });
                }
            }
 
            console.log(accumulatedMessages)
 
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
 
        // Add user message to the messages array
        setMessages((prevMessages: any) => [
            ...prevMessages,
            { text: inputValue, sender: "user" },
        ]);
 
        // Call the chatbot API
        fetchData(inputValue);
        setInputValue(''); // Clear the input field
    };
 
    return (
        <div className="h-full">
            <h2>Chatbot</h2>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className=" messages flex-1 h-96 overflow-y-auto mb-4 border border-gray-300 rounded-lg p-2">
                    {messages.map((message: any, index: any) => (
 
                        <div className={`flex w-full ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
 
                            <div
                                key={index}
                                ref={(el) => (messageRefs.current[index] = el)}
                                className={`relative w-[70%] flex gap-2 flex-col message p-2 rounded mb-2 ${message.sender === "user" ? "bg-gray-200" : "bg-blue-100 pt-6 px-3"
                                    }`}
 
                            >
 
 
                                {message.sender === "bot" &&
 
                                    <div className="absolute right-0 top-0 flex justify-center items-center m-2 cursor-pointer text-black gap-1" onClick={() => copyToClipboard(index)}>
 
                                        {
                                            copiedMessageIndex === index ? <IoCheckmarkDone/> : <IoCopyOutline/>
                                        }
                                       
                                        <div>{copiedMessageIndex === index ? "Copied" : `Copy`}</div>
                                    </div>}
 
 
 
                                {/* <strong>{message.sender === "user" ? "User:" : "Bot:"}</strong> */}
                                {" "}
                                {message.sender === "user" ? message.text.split('data: ').map((line: any, lineIndex: any) => (
                                    <div key={lineIndex}>{line}{lineIndex < message.text.split('\n').length - 1 && <br />}</div>
                                )) : message.text.split('data: ').map((line: any, lineIndex: any) => (
                                    <div key={lineIndex}>{lineIndex + 1}{". "}{line}{lineIndex < message.text.split('\n').length - 1 && <br />}</div>
 
                                ))}
 
 
 
                            </div>
                        </div>
 
))}
{loading && <Skeleton width={850} height={100}/>}
                </div>
                <div className="flex ">
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={handleChange}
                        placeholder="Ask anthing..."
                        className="flex-1 w-6 text-[1.1rem] p-2 rounded-l-md focus:outline-none bg-[#F4F4F4]"
                        autoFocus
                    />
                    <Button 
                    // className="flex justify-start items-center bg-[#F4F4F4] text-black px-2 py-3 rounded-r-md hover:bg-gray-400 transition border-none w-[3rem]" 
                    type="submit">
                        <LuSendHorizonal className="text-[1.7rem]" />
                    </Button>
                </div>
            </form>
        </div>
    );
};
 
export default Index;