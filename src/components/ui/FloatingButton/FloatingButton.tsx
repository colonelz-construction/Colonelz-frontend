import { useState } from "react";
import { FaComments, FaTimes } from "react-icons/fa";
import Chatbot from "../../../views/crm/Chatbot/index";
import { TbMessageChatbot } from "react-icons/tb";
import { RxCross2 } from "react-icons/rx";
import { RxCrossCircled } from "react-icons/rx";

const FloatingButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <div
                // className={`fixed bottom-20 right-6 w-[440px] h-[520px] bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-600 shadow-2xl dark:shadow-2xl rounded-2xl p-4 transition-transform duration-300 ${isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
                //     }`}
                className={`fixed bottom-10 right-4 sm:bottom-16 sm:right-6 w-[90%] sm:w-[440px] h-[80vh] sm:h-[520px] max-w-[440px] bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-600 shadow-2xl dark:shadow-2xl rounded-2xl p-4 transition-transform duration-300 
                    ${isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"}
                  `}
                  
                style={{ visibility: isOpen ? "visible" : "hidden" }}
            >

                <button
                    onClick={() => setIsOpen(false)}
                    className="fixed top-2 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
                >
                 
                    <RxCrossCircled className="text-xl pt-1" />
                </button>


                <div className="h-full pt-6 pb-11" style={{ scrollbarWidth: "none" }}>
                    <Chatbot />
                </div>
            </div>
            <div className="relative group">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-4 rounded-full shadow-lg dark:shadow-lg bg-gradient-to-br from-[#6764AC] to-[#7961A9] text-white hover:scale-105 transition-transform duration-200"
                >
                    <TbMessageChatbot size={30} />
                </button>

                <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 hidden group-hover:flex items-center px-3 py-1 text-sm font-medium text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap">
                    Ask Ada
                </span>
            </div>
        </div>
    );
};

export default FloatingButton;

