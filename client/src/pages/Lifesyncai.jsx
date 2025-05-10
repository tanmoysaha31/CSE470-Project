import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars, faPaperPlane, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../assets/styles/lifesyncai.css';

export default function Lifesyncai() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, type: 'bot', content: 'Hello! How can I assist you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    fetchChats();
    console.log('Component mounted, fetching chats');
  }, []);

  useEffect(() => {
    console.log('Chats updated:', chats);
  }, [chats]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    setChatHistory([
      { id: 1, type: 'bot', content: 'Hello! How can I assist you today?' }
    ]);
    setCurrentChatId(null);
  };

  const fetchChats = async () => {
    try {
        const { data } = await axios.get('/chats');
        console.log('Fetched chats:', data);
        setChats(data);
    } catch (error) {
        console.error('Failed to fetch chats:', error);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const { data } = await axios.get(`/chats/${chatId}`);
      setChatHistory(data.messages);
      setCurrentChatId(chatId);
    } catch (error) {
      console.error('Failed to load chat:', error);
      toast.error('Failed to load chat');
    }
  };

  const saveChat = async (messages) => {
    try {
      if (currentChatId) {
        // Update existing chat
        const { data } = await axios.put(`/chats/${currentChatId}`, {
          messages: messages || chatHistory
        });
        console.log('Chat updated:', data);
      } else {
        // Create new chat
        const { data } = await axios.post('/chats', {
          messages: messages || chatHistory
        });
        setCurrentChatId(data._id);
        console.log('New chat created:', data);
        await fetchChats(); // Refresh chat list
      }
    } catch (error) {
      console.error('Failed to save chat:', error);
    }
  };

  // Add the simulateTyping helper function
  const simulateTyping = (fullText, botMessageId) => {
    let index = 0;
    const interval = setInterval(() => {
      setChatHistory(prevHistory =>
        prevHistory.map(msg =>
          msg.id === botMessageId ? { ...msg, content: fullText.substring(0, index) } : msg
        )
      );
      index++;
      if (index > fullText.length) {
        clearInterval(interval);
      }
    }, 50); // adjust the speed as desired
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: chatHistory.length + 1,
      type: 'user',
      content: inputMessage
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get AI response
      const response = await axios.post('/ai/generate', {
        prompt: inputMessage
      });

      // Prepare full bot response text
      const fullBotText = response.data.message;
      
      // Create a placeholder for the bot message with empty content
      const botMessageId = chatHistory.length + 2;
      const botResponse = {
        id: botMessageId,
        type: 'bot',
        content: ''
      };
      
      // Update chat history with the empty bot message
      const newHistory = [...chatHistory, userMessage, botResponse];
      setChatHistory(newHistory);
      
      // Simulate realtime typing effect
      simulateTyping(fullBotText, botMessageId);

      // Optionally, after typing is done, save the chat history
      if (newHistory.length > 1) {
        await saveChat(newHistory);
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: chatHistory.length + 2,
        type: 'bot',
        content: `Error: ${error.response?.data?.error || 'Failed to get response'}`
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`/chats/${chatId}`);
      await fetchChats();
      if (currentChatId === chatId) {
        handleNewChat();
      }
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const formatResponse = (content) => {
    const formatBoldText = (text) => {
      return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      const formattedLine = formatBoldText(line);
      
      const createMarkup = (htmlContent) => {
        return { __html: htmlContent };
      };

      if (/^\d+\./.test(line)) {
        return (
          <div key={index} className="list-item numbered" 
            dangerouslySetInnerHTML={createMarkup(formattedLine)} />
        );
      } else if (line.startsWith('*') && !line.startsWith('**')) {
        return (
          <div key={index} className="list-item bulleted"
            dangerouslySetInnerHTML={createMarkup(formattedLine)} />
        );
      } else if (line.includes(':')) {
        const [header, content] = line.split(':');
        return (
          <div key={index} className="message-header">
            <span dangerouslySetInnerHTML={createMarkup(formatBoldText(header))} />:
            <span dangerouslySetInnerHTML={createMarkup(formatBoldText(content))} />
          </div>
        );
      } else {
        return (
          <div key={index} className="message-paragraph"
            dangerouslySetInnerHTML={createMarkup(formattedLine)} />
        );
      }
    });
  };

  return (
    <div className="ai-chat-container">
      <div className={`ai-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        
        <button className="new-chat-btn" onClick={handleNewChat}>
          <FontAwesomeIcon icon={faPlus} />
          <span className="btn-text">New Chat</span>
        </button>
        
        <div className="chat-history-list">
          {chats.map((chat) => (
            <div 
              key={chat._id} 
              className={`chat-history-item ${currentChatId === chat._id ? 'active' : ''}`}
              onClick={() => loadChat(chat._id)}
            >
              <span className="history-text">{chat.title}</span>
              <button
                className="delete-chat-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat._id);
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="ai-main-content">
        <div className="chat-messages">
          {chatHistory.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                {message.type === 'bot' && (
                  <div className="bot-avatar">AI</div>
                )}
                <div className="message-text">
                  {message.type === 'bot' ? formatResponse(message.content) : message.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-content">
                <div className="bot-avatar">AI</div>
                <div className="message-text">Thinking...</div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </div>
    </div>
  );
}
