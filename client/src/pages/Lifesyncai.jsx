import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars, faPaperPlane, faTrash, faStop } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../assets/styles/lifesyncai.css';

export default function Lifesyncai() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('aiSidebarOpen');
    return savedState ? JSON.parse(savedState) : true;
  });
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [controller, setController] = useState(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    fetchChats();
    console.log('Component mounted, fetching chats');
    
    const handleResize = () => {
      if (messagesContainerRef.current) {
        adjustContainerHeight();
      }
    };

    adjustContainerHeight();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('aiSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const adjustContainerHeight = () => {
    const navbarHeight = 64;
    const mainPadding = 16;
    const windowHeight = window.innerHeight;
    const availableHeight = windowHeight - navbarHeight - mainPadding;
    
    if (messagesContainerRef.current) {
      messagesContainerRef.current.style.height = `${availableHeight}px`;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setCurrentChatId(null);
  };

  const fetchChats = async () => {
    try {
        const { data } = await axios.get('/chats', {
            withCredentials: true
        });
        console.log('Fetched chats:', data);
        setChats(data);
    } catch (error) {
        console.error('Failed to fetch chats:', error);
        console.error('Error details:', error.response?.data);
        
        // Handle unauthorized errors (usually token issues)
        if (error.response?.status === 401) {
            toast.error('Session expired. Please log in again.');
            // You might want to redirect to login page here
        } else {
            toast.error('Failed to load chat history');
        }
        
        // Return empty array in case of error
        setChats([]);
    }
  };

  const loadChat = async (chatId) => {
    try {
        const { data } = await axios.get(`/chats/${chatId}`, {
            withCredentials: true
        });
        
        if (data && Array.isArray(data.messages)) {
            setChatHistory(data.messages.map(msg => ({
                id: msg.id,
                type: msg.type,
                content: msg.content
            })));
            setCurrentChatId(chatId);
            console.log('Chat loaded successfully:', data);
        } else {
            throw new Error('Invalid chat data received');
        }
    } catch (error) {
        console.error('Failed to load chat:', error);
        toast.error('Failed to load chat');
        handleNewChat();
    }
  };

  const saveChat = async (messages) => {
    try {
        if (currentChatId) {
            const { data } = await axios.put(`/chats/${currentChatId}`, {
                title: messages[1]?.content?.substring(0, 30) + "..." || "New Chat",
                messages: messages.map(msg => ({
                    id: msg.id,
                    type: msg.type,
                    content: msg.content
                }))
            }, {
                withCredentials: true
            });
            console.log('Chat updated:', data);
        } else {
            
            const { data } = await axios.post('/chats', {
                title: messages[1]?.content?.substring(0, 30) + "..." || "New Chat",
                messages: messages.map(msg => ({
                    id: msg.id,
                    type: msg.type,
                    content: msg.content
                }))
            }, {
                withCredentials: true
            });
            setCurrentChatId(data._id);
            console.log('New chat created:', data);
            await fetchChats();
        }
    } catch (error) {
        console.error('Failed to save chat:', error);
        toast.error('Failed to save chat');
    }
  };

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
    }, 50);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const messageToSend = inputMessage;
    const userMessage = {
        id: chatHistory.length + 1,
        type: 'user',
        content: messageToSend
    };

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setInputMessage('');
    setIsLoading(true);
    setIsGenerating(true);

    try {
        const abortController = new AbortController();
        setController(abortController);

        const response = await axios.post('/ai/generate', {
            prompt: messageToSend,
            chatId: currentChatId
        }, {
            withCredentials: true,
            signal: abortController.signal
        });

        const botResponse = {
            id: updatedHistory.length + 1,
            type: 'bot',
            content: response.data.message
        };

        const newHistory = [...updatedHistory, botResponse];
        setChatHistory(newHistory);

        await saveChat(newHistory);

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Response generation cancelled');
        } else {
            console.error('Error:', error);
            const errorMessage = {
                id: chatHistory.length + 2,
                type: 'bot',
                content: `Error: ${error.response?.data?.error || 'Failed to get response'}`
            };
            setChatHistory(prev => [...prev, errorMessage]);
        }
    } finally {
        setIsLoading(false);
        setIsGenerating(false);
        setController(null);
    }
  };

  const handlePause = () => {
    if (controller) {
        controller.abort();
        setIsGenerating(false);
        setIsLoading(false);
        setController(null);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      console.log('Attempting to delete chat with ID:', chatId);
      const response = await axios.delete(`/chats/${chatId}`, {
        withCredentials: true
      });
      console.log('Delete response:', response.data);
      await fetchChats();
      if (currentChatId === chatId) {
        handleNewChat();
      }
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to delete chat: ${error.response?.data?.error || error.message}`);
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
    <div className="ai-chat-wrapper">
      <div className="ai-chat-container" ref={messagesContainerRef}>
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
            {chats.length === 0 ? (
              <div className="no-chats-message">No saved chats</div>
            ) : (
              chats.map((chat) => (
                <div 
                  key={chat._id} 
                  className={`chat-history-item ${currentChatId === chat._id ? 'active' : ''}`}
                >
                  <span 
                    className="history-text"
                    onClick={() => loadChat(chat._id)}
                  >
                    {chat.title || 'New Chat'}
                  </span>
                  <button
                    className="delete-chat-btn"
                    onClick={() => handleDeleteChat(chat._id)}
                    title="Delete chat"
                    aria-label="Delete chat"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="ai-main-content">
          <div className="chat-messages">
            {chatHistory.length === 0 && !isLoading ? (
              <div className="empty-chat-placeholder">
                <div className="placeholder-content">
                  <h2>LifeSync AI Assistant</h2>
                  <p>Type a message to start a conversation with the AI assistant.</p>
                  <p>Your chat history will be saved automatically.</p>
                </div>
              </div>
            ) : (
              chatHistory.map((message) => (
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
              ))
            )}
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
            />
            <button 
              type="button" 
              className={`${isGenerating ? 'pause-button' : 'send-button'}`}
              onClick={isGenerating ? handlePause : handleSendMessage}
            >
              <FontAwesomeIcon icon={isGenerating ? faStop : faPaperPlane} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
