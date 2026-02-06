
'use client';

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Wrench, X, Bot, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatKitConfig } from "./chatkit/ChatKitProvider";
import { useAuth } from "./AuthProvider";
import ConversationHistory from "./ConversationHistory";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  tool_calls?: Array<{ tool: string; args: any }>;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: string;
  description?: string;
  created_at: string;
}

export default function AIChatPanel({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
  const config = useChatKitConfig();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: "Hi! I'm your AI task assistant. Ask me to manage your tasks naturally.",
      created_at: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showConversationHistory, setShowConversationHistory] = useState(false);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Load sidebar state (only relevant on desktop)
    if (!isMobile) {
      const savedState = localStorage.getItem('sidebar-open');
      setSidebarOpen(savedState !== null ? savedState === 'true' : true);
    }
  }, [isMobile]);

  useEffect(() => {
    // Fetch user info from API
    async function fetchUserInfo() {
      try {
        const token = config.token;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    }

    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Load messages for a specific conversation
  const loadConversationMessages = async (convId: number) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${config.userId}/conversations/${convId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data?.messages) {
        // Transform backend messages to our frontend format
        const transformedMessages: Message[] = data.data.messages.map((msg: any) => ({
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content,
          created_at: msg.created_at,
          tool_calls: msg.tool_calls,
        }));

        setMessages(transformedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
      // Show error message in chat
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Error loading conversation history. Starting fresh.',
        created_at: new Date().toISOString(),
      }]);
      setMessages([{
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: "Hi! I'm your AI task assistant. Ask me to manage your tasks naturally.",
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);
    setStreamingMessage("");

    abortControllerRef.current = new AbortController();

    try {
      console.log("📤 Sending message to:", config.apiUrl);

      // Use the API URL from config but construct the proper endpoint
      const chatEndpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${config.userId}/chat`;

      const response = await fetch(chatEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: currentInput,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let assistantContent = "";
      let toolCalls: Array<{ tool: string; args: any }> = [];
      let shouldFetchTasks = false;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("✅ Stream completed");
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);

            try {
              const data = JSON.parse(jsonStr);

              console.log("📨 SSE Event:", data);

              if (data.type === "message") {
                let cleanContent = data.content;
                // Reduced filtering to prevent over-removal of valid content
                cleanContent = cleanContent
                  .replace(/Rules $$   never say them   $$:.*/gi, "")
                  .replace(/That's all.*/gi, "")
                  .replace(/Greeting:.*/gi, "")
                  .replace(/Name answer:.*/gi, "")
                  .replace(/Keep it.*/gi, "")
                  .replace(/Rules \(remember but NEVER.*$/gi, "")
                  .replace(/That's all.*$/gi, "")
                  .replace(/For greeting:.*$/gi, "")
                  .replace(/For name:.*$/gi, "")
                  .replace(/Keep it.*$/gi, "")
                  .replace(/8d673d91-.*$/gi, "")
                  .trim();

                // Less aggressive internal thought filtering
                const internalThoughtPatterns = [
                  /internal thought/i,
                  /thinking process/i,
                  /reasoning:/i,
                  /analysis:/i,
                  /considering:/i,
                  /evaluating:/i,
                  /checking:/i,
                  /verifying:/i,
                ];

                const isInternalThought = internalThoughtPatterns.some(
                  (pattern) => pattern.test(cleanContent),
                );

                if (isInternalThought) {
                  console.log("Filtered internal thought:", cleanContent);
                  continue;
                }

                // Reduced skip patterns
                const skipPatterns = [
                  "complete problem solve",
                  "ache se or UI me text doble baar",
                  "simpe an chaye",
                  "who am i? this is",
                  "there's no tool usage rule",
                  "but we must not mention",
                ];

                if (
                  skipPatterns.some((pattern) =>
                    cleanContent.toLowerCase().includes(pattern.toLowerCase()),
                  )
                ) {
                  console.log("Filtered skip pattern:", cleanContent);
                  continue;
                }

                assistantContent += cleanContent;
                setStreamingMessage(assistantContent);

                if (cleanContent.toLowerCase().includes('tasks') &&
                    (cleanContent.toLowerCase().includes('here are') ||
                     cleanContent.toLowerCase().includes('your') ||
                     cleanContent.toLowerCase().includes('all'))) {
                  shouldFetchTasks = true;
                }
              } else if (data.type === "tool_call") {
                console.log("🔧 Tool call:", data.tool, data.args);
                toolCalls.push({ tool: data.tool, args: data.args });

                if (data.tool === 'list_tasks') {
                  shouldFetchTasks = true;
                }

                setStreamingMessage(
                  (prev) => prev + `\n\n🔧 Using tool: ${data.tool}`,
                );
              } else if (data.type === "done") {
                console.log("✅ Conversation ID:", data.conversation_id);

                // Update conversation ID if new
                if (data.conversation_id) {
                  setConversationId(data.conversation_id);
                }
              } else if (data.type === "error") {
                console.error("❌ Stream error:", data.message);
                throw new Error(data.message || "Stream error occurred");
              }
            } catch (parseError) {
              console.warn("⚠️ Failed to parse SSE line:", jsonStr);
            }
          }
        }
      }

      if (assistantContent) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: assistantContent,
          created_at: new Date().toISOString(),
          tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }

      if (shouldFetchTasks) {
        await fetchTasks();
      }

      setStreamingMessage("");
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("⚠️ Request cancelled");
        return;
      }

      console.error("❌ Chat error:", error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Error: ${error.message}`,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setStreamingMessage("");
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fetchTasks = async () => {
    try {
      const tasksApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${config.userId}/tasks`;

      const response = await fetch(tasksApiUrl, {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
        return data.data || [];
      } else {
        console.error(
          "Failed to fetch tasks:",
          response.status,
          response.statusText,
        );
        return [];
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  };

  const TaskList = ({ tasks }: { tasks: Task[] }) => {
    if (tasks.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No tasks yet. Add one to get started!
        </div>
      );
    }

    return (
      <div className="space-y-2 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-200 mb-3">Your Tasks</h3>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              task.completed
                ? "bg-green-900/30 border-green-700"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            <div className="flex-shrink-0 text-xl">
              {task.completed ? "✅" : "⏳"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium ${
                    task.completed
                      ? "line-through text-gray-400"
                      : "text-gray-100"
                  }`}
                >
                  {task.id}. {task.title}
                </span>
                <span className="text-sm">
                  {task.priority === "high" && "🔥"}
                  {task.priority === "medium" && "📝"}
                  {task.priority === "low" && "✨"}
                </span>
              </div>
              {task.description && (
                <p className="text-sm text-gray-300 mt-1">{task.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Calculate dynamic left position based on sidebar state
  const sidebarWidth = isMobile ? 0 : (sidebarOpen ? 256 : 64);
  const panelStyle = {
    left: `${sidebarWidth}px`,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-y-0 right-0 z-40 bg-gray-900 flex flex-row shadow-2xl"
        >
          {/* Conversation History Sidebar */}
          {showConversationHistory && (
            <ConversationHistory
              currentConversationId={conversationId}
              onSelectConversation={(id) => {
                setConversationId(id);
                loadConversationMessages(id);
                setShowConversationHistory(false);
              }}
              onCreateNewConversation={() => {
                setConversationId(null);
                setMessages([{
                  id: 'welcome-' + Date.now(),
                  role: 'assistant',
                  content: "Hi! I'm your AI task assistant. Ask me to manage your tasks naturally.",
                  created_at: new Date().toISOString(),
                }]);
                setShowConversationHistory(false);
              }}
              onClose={() => setShowConversationHistory(false)}
            />
          )}

          {/* Main Chat Panel */}
          <div
            className={`flex-1 flex flex-col ${showConversationHistory ? '' : 'w-full'}`}
            style={{ minWidth: 0 }} // Allow flex child to shrink
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConversationHistory(!showConversationHistory)}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 p-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-2">
                  <Bot className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">AI Task Assistant</h2>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
              {messages.length === 0 && !loading && (
                <div className="text-center text-gray-500 mt-8">
                  <p className="text-lg mb-2">👋 Hi! I'm your AI task assistant</p>
                  <p className="text-sm">Ask me to manage your tasks naturally</p>
                  <div className="mt-4 space-y-2">
                    <div className="bg-gray-800 rounded-lg p-3 text-left text-gray-200">
                      "Add a task to buy groceries"
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-left text-gray-200">
                      "Show me all my tasks"
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-left text-gray-200">
                      "Mark task 1 as complete"
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => {
                // Check if this is a task list display message
                if (message.content === "task_list_display") {
                  return (
                    <div key={message.id} className="flex justify-start">
                      <div className="max-w-[80%] bg-gray-800 rounded-lg px-4 py-2 w-full">
                        <TaskList tasks={tasks} />
                      </div>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-700 text-gray-100 rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && (
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-300" />
                        )}
                        {message.role === 'user' && (
                          <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-200" />
                        )}
                        <div className="flex-1">
                          {message.content.split('\n').map((line, i) => (
                            <p key={i} className="mb-1 last:mb-0">{line}</p>
                          ))}

                          {/* Show tool calls if any */}
                          {message.tool_calls && message.tool_calls.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-600">
                              {message.tool_calls.map((tool, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs opacity-70"
                                >
                                  <Wrench className="h-3 w-3" />
                                  <span>Used: {tool.tool}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Streaming message */}
              {loading && streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] rounded-2xl rounded-bl-none bg-gray-700 text-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-300" />
                      <div className="flex-1">
                        {streamingMessage.split('\n').map((line, i) => (
                          <p key={i} className="mb-1 last:mb-0">{line}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs opacity-70">Typing...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Loading indicator (when no streaming content yet) */}
              {loading && !streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] rounded-2xl rounded-bl-none bg-gray-700 text-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-300" />
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs opacity-70">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 resize-none rounded-lg bg-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] max-h-32"
                  rows={1}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 h-auto px-4 py-3"
                >
                  <Send className="h-5 w-5 text-white" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                AI Assistant can help you create, update, and manage your tasks
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}