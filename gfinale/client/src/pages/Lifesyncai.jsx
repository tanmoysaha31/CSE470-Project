import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars, faPaperPlane, faTrash, faStop, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../assets/styles/lifesyncai.css';

export default function Lifesyncai() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [controller, setController] = useState(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      setTimeout(() => {
        chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('aiSidebarOpen');
      if (savedState !== null) {
        setIsSidebarOpen(JSON.parse(savedState));
      }
      
      fetchChats();
      
      const handleResize = () => adjustContainerHeight();
      window.addEventListener('resize', handleResize);
      
      adjustContainerHeight();
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      console.error("Error in initial load:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('aiSidebarOpen', JSON.stringify(isSidebarOpen));
    } catch (error) {
      console.error("Error saving sidebar state:", error);
    }
  }, [isSidebarOpen]);

  const adjustContainerHeight = () => {
    try {
      if (!messagesContainerRef.current) return;
      
      const navbarHeight = 64;
      const inputAreaHeight = 70;
      const paddingTotal = 30;
      
      const windowHeight = window.innerHeight;
      const availableHeight = windowHeight - navbarHeight - inputAreaHeight - paddingTotal;
      
      messagesContainerRef.current.style.height = `${Math.max(availableHeight, 300)}px`;
    } catch (error) {
      console.error("Error adjusting container height:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setCurrentChatId(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const fetchChats = async () => {
    try {
      const { data } = await axios.get('/chats', {
        withCredentials: true
      });
      setChats(data || []);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to load chat history');
      }
      setChats([]);
    }
  };

  const loadChat = async (chatId) => {
    try {
      setIsLoading(true);
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
      } else {
        throw new Error('Invalid chat data');
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      toast.error('Failed to load chat');
      handleNewChat();
    } finally {
      setIsLoading(false);
    }
  };

  const saveChat = async (messages) => {
    try {
      if (currentChatId) {
        await axios.put(`/chats/${currentChatId}`, {
          title: messages[1]?.content?.substring(0, 30) + "..." || "New Chat",
          messages: messages.map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content
          }))
        }, { withCredentials: true });
      } else {
        const { data } = await axios.post('/chats', {
          title: messages[1]?.content?.substring(0, 30) + "..." || "New Chat",
          messages: messages.map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content
          }))
        }, { withCredentials: true });
        
        setCurrentChatId(data._id);
        await fetchChats();
      }
    } catch (error) {
      console.error('Failed to save chat:', error);
      toast.error('Failed to save chat');
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    if (e) e.stopPropagation();
    
    try {
      await axios.delete(`/chats/${chatId}`, {
        withCredentials: true
      });
      
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

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (isLoading || !inputMessage.trim()) return;
    
    const messageText = inputMessage.trim();
    setInputMessage('');
    
    const userMessageId = Date.now();
    const userMessage = {
      id: userMessageId,
      type: 'user',
      content: messageText
    };
    
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    
    setIsLoading(true);
    setIsGenerating(true);
    
    // Check if this is a note summarization request
    if (messageText.toLowerCase().includes('summarize note') || 
        messageText.toLowerCase().includes('summarize my note') ||
        messageText.toLowerCase().match(/summarize\s+.*\s+note/i)) {
      
      handleNoteSummarization(messageText, updatedHistory);
      return;
    }
    
    const abortController = new AbortController();
    setController(abortController);
    
    axios.post('/ai/generate', {
      prompt: messageText,
      chatId: currentChatId
    }, {
      withCredentials: true,
      signal: abortController.signal
    })
    .then(response => {
      const botMessageId = Date.now() + 1;
      const botMessage = {
        id: botMessageId,
        type: 'bot',
        content: response.data.message
      };
      
      const newHistory = [...updatedHistory, botMessage];
      setChatHistory(newHistory);
      
      return saveChat(newHistory);
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
      } else {
        console.error('Error generating response:', error);
        
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: `Error: ${error.response?.data?.error || 'Failed to get response'} ${error.response?.data?.details ? '- ' + error.response?.data?.details : ''}`
        };
        
        setChatHistory([...updatedHistory, errorMessage]);

        // Show a toast with more details about the error
        toast.error(`AI Error: ${error.response?.data?.details || error.message || 'Unknown error'}`);
      }
    })
    .finally(() => {
      setIsLoading(false);
      setIsGenerating(false);
      setController(null);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
  };

  // Handle note summarization requests
  const handleNoteSummarization = (message, updatedHistory) => {
    // Extract note name from the message
    // Pattern: "summarize note [note name]" or similar variations
    const noteNamePattern = /summarize\s+(?:my\s+)?(?:note\s+)?(?:named\s+)?["']?([^"']+)["']?/i;
    const match = message.match(noteNamePattern);
    
    if (!match || !match[1]) {
      // No note name found, send a clarification message
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'd be happy to summarize a note for you. Could you specify which note you'd like me to summarize? For example: 'Summarize note Meeting Notes'"
      };
      setChatHistory([...updatedHistory, botMessage]);
      
      setIsLoading(false);
      setIsGenerating(false);
      return;
    }
    
    const noteName = match[1].trim();
    let customPrompt = '';
    
    // Check for additional instructions after the note name
    const instructionsPattern = new RegExp(`${noteName}\\s+(.+)$`, 'i');
    const instructionMatch = message.match(instructionsPattern);
    if (instructionMatch && instructionMatch[1]) {
      customPrompt = instructionMatch[1].trim();
    }
    
    // Make the API call to summarize the note
    axios.post('/api/ai/summarize-note', {
      noteName,
      prompt: customPrompt
    }, {
      withCredentials: true
    })
    .then(response => {
      const { summary, note } = response.data;
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `**Summary of "${note.title}":**\n\n${summary}`
      };
      
      const newHistory = [...updatedHistory, botMessage];
      setChatHistory(newHistory);
      
      return saveChat(newHistory);
    })
    .catch(error => {
      console.error('Error summarizing note:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: error.response?.status === 404
          ? `I couldn't find a note with the name "${noteName}". Please check the name and try again.`
          : `Error: ${error.response?.data?.error || 'Failed to summarize note'} ${error.response?.data?.details ? '- ' + error.response?.data?.details : ''}`
      };
      
      setChatHistory([...updatedHistory, errorMessage]);
      toast.error(`Error: ${error.response?.data?.details || error.message || 'Failed to summarize note'}`);
    })
    .finally(() => {
      setIsLoading(false);
      setIsGenerating(false);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
  };

  const handleStopGeneration = () => {
    if (controller) {
      controller.abort();
      setIsGenerating(false);
      setIsLoading(false);
      setController(null);
    }
  };

  const handleSuggestionClick = (text) => {
    setInputMessage(text);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const formatBotResponse = (content) => {
    if (!content) return { __html: '' };
    
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
      
    return { __html: html };
  };

  return (
    <div className="lifesyncai-container">
      <div className={`chat-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button 
            className="new-chat-btn" 
            onClick={handleNewChat}
            type="button"
          >
            <FontAwesomeIcon icon={faPlus} /> New Chat
          </button>
        </div>
        
        <div className="feature-hints">
          <h3>What can I do?</h3>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span className="feature-text">Check your upcoming tasks</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span className="feature-text">Track your expenses</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📝</span>
              <span className="feature-text">Summarize your notes</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">❓</span>
              <span className="feature-text">Answer general questions</span>
            </div>
          </div>
        </div>
        
        <div className="sidebar-chats">
          <h3>Recent Chats</h3>
          <div className="chat-list">
            {chats.length === 0 ? (
              <div className="no-chats">No chat history</div>
            ) : (
              chats.map(chat => (
                <div 
                  key={chat._id} 
                  className={`chat-item ${currentChatId === chat._id ? 'active' : ''}`}
                  onClick={() => loadChat(chat._id)}
                >
                  <div className="chat-title">{chat.title}</div>
                  <button 
                    className="delete-chat-btn"
                    onClick={(e) => handleDeleteChat(chat._id, e)}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="chat-main">
        <button 
          className="toggle-sidebar-btn" 
          onClick={toggleSidebar}
          type="button"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        
        <div className="chat-messages" ref={messagesContainerRef}>
          {chatHistory.length === 0 ? (
            <div className="chat-welcome">
              <h1>LifeSync AI Assistant</h1>
              <p>How can I help you today?</p>
              
              <div className="suggestions">
                <h3>Try asking about:</h3>
                <div className="suggestion-grid">
                  <button 
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick("What tasks do I have today?")}
                    type="button"
                  >
                    What tasks do I have today?
                  </button>
                  <button 
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick("How much have I spent this month?")}
                    type="button"
                  >
                    How much have I spent this month?
                  </button>
                  <button 
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick("Summarize note Meeting Notes")}
                    type="button"
                  >
                    Summarize note Meeting Notes
                  </button>
                  <button 
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick("Find notes about work")}
                    type="button"
                  >
                    Find notes about work
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((message) => (
                <div 
                  key={message.id}
                  className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
                >
                  <div className="message-content">
                    {message.type === 'user' ? (
                      message.content
                    ) : (
                      <div dangerouslySetInnerHTML={formatBotResponse(message.content)} />
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </>
          )}
        </div>
        
        <form 
          className="chat-input" 
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
            ref={inputRef}
          />
          {isGenerating ? (
            <button 
              type="button" 
              className="stop-btn"
              onClick={handleStopGeneration}
              title="Stop generating"
            >
              <FontAwesomeIcon icon={faStop} />
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || isLoading}
              title="Send message"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
