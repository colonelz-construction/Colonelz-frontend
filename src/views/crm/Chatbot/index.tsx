const Index = () => {
  return (
      <div>
        <div className="messages h-96 overflow-y-auto mb-4 border border-gray-300 rounded-lg p-2">
          {/* Chat messages will go here */}
          <div className="message bg-blue-100 p-2 rounded mb-2">
            Hello! How can I assist you today?
          </div>
          {/* Add more messages here */}
        </div>
        <div className="flex">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:ring-blue-400"
          />
          <button className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 transition">
            Send
          </button>
        </div>
      </div>
  );
};

export default Index;
