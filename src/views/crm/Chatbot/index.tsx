import { Button } from "@/components/ui/Button";
import { useState } from "react";

interface Message {
    text: string;
    sender: "user" | "bot";
}

const Index = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    const fetchData = async (inputValue: string) => {
        try {
            const response = await fetch(`https://chatbot.test.initz.run/query/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: inputValue }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let result = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    result += decoder.decode(value, { stream: true });

                    // Process complete messages as they arrive
                    const messages = result.split("\n\n");
                    messages.forEach((msg) => {
                        if (msg.startsWith("data: ")) {
                            const message = msg.slice(6).trim(); // Extract the message

                            // Update the messages state progressively
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                { text: message, sender: "bot" },
                            ]);
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: "There was an error communicating with the chatbot.", sender: "bot" },
            ]);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!inputValue.trim()) return;

        // Add user message to the messages array
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: inputValue, sender: "user" },
        ]);

        // Call the chatbot API
        fetchData(inputValue);
        setInputValue(''); // Clear the input field
    };

    return (
        <div className="input-container">
            <h2>Chatbot</h2>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="messages flex-1 h-96 overflow-y-auto mb-4 border border-gray-300 rounded-lg p-2">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message p-2 rounded mb-2 ${
                                message.sender === "user"
                                    ? "bg-blue-100 text-left"
                                    : "bg-gray-200 text-right"
                            }`}
                        >
                            <strong>{message.sender === "user" ? "User:" : "Bot:"}</strong>{" "}
                            {message.text}
                        </div>
                    ))}
                </div>
                <div className="flex">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleChange}
                        placeholder="Type your message..."
                        className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:ring-blue-400"
                        autoFocus
                    />
                    <Button className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 transition" type="submit">
                        Send
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Index;
