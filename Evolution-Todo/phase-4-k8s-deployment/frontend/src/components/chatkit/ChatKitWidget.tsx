"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatKitConfig } from "./ChatKitProvider";
import { Send, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedInput } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  tool_calls?: Array<{ tool: string; args: any }>;
}

interface BackendMessage {
  id: number;
  conversation_id: number;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  expires_at?: string;
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

const ChatKitWidget: React.FC = () => {
  const config = useChatKitConfig();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Fetch user info from API
    async function fetchUserInfo() {
      try {
        const token = config.token; // Use the same token from config that works for chat API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.data);

          // After fetching user info, load conversation history
          loadConversationHistory(data.data.id);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    }

    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  // Load conversation history for the user
  const loadConversationHistory = async (userId: string) => {
    try {
      console.log("🔄 Loading conversation history for user:", userId);

      // First, get the user's conversations
      const conversationsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/${userId}/conversations?limit=5&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        }
      );

      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json();
        const conversations = conversationsData.data || [];

        if (conversations.length > 0) {
          // Get the most recent conversation
          const mostRecentConversation = conversations[0];
          console.log("🔄 Loading messages from conversation:", mostRecentConversation.id);

          // Load messages from the most recent conversation
          const messagesResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/${userId}/conversations/${mostRecentConversation.id}/messages`,
            {
              headers: {
                Authorization: `Bearer ${config.token}`,
              },
            }
          );

          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            const conversationMessages = messagesData.data || [];

            // Transform backend messages to our frontend format and clean content
            const transformedMessages: Message[] = conversationMessages.map((msg: BackendMessage) => {
              // Apply the same filtering logic used for new messages
              let cleanContent = msg.content;

              // Remove common AI internal instructions and templates
              cleanContent = cleanContent
                .replace(/Rules \$\$   never say them   \$\$:?.*/gi, "")
                .replace(/That's all.*/gi, "")
                .replace(/Greeting:?.*/gi, "")
                .replace(/Name answer:?.*/gi, "")
                .replace(/Keep it.*/gi, "")
                .replace(/Rules \(remember but NEVER.*\)/gi, "")
                .replace(/This is greeting reply.*/gi, "")
                .replace(/Use emojis.*/gi, "")
                .replace(/Max 1 line.*/gi, "")
                .replace(/Let's do that.*/gi, "")
                .replace(/We must respond with greeting reply:.*/gi, "")
                .replace(/This is greeting reply.*/gi, "")
                .replace(/Use emojis.*/gi, "")
                .replace(/Max 1 line.*/gi, "")
                .replace(/Let's do that.*/gi, "")
                .replace(/add \[task\].*/gi, "")
                .replace(/create \[task\].*/gi, "")
                .replace(/remind me to \[task\].*/gi, "")
                .replace(/[a-f0-9-]{36}/gi, "") // Remove UUIDs
                .replace(/show tasks.*/gi, "")
                .replace(/list tasks.*/gi, "")
                .replace(/what\\?'s on my list.*/gi, "")
                .replace(/show pending.*/gi, "")
                .replace(/what\\?'s left.*/gi, "")
                .replace(/pending.*/gi, "")
                .replace(/complete task \[id\].*/gi, "")
                .replace(/mark \[id\] done.*/gi, "")
                .replace(/delete task \[id\].*/gi, "")
                .replace(/remove \[id\].*/gi, "")
                .replace(/update task \[id\].*/gi, "")
                .replace(/bilkul aesa nhi hona chaye.*/gi, "")
                .replace(/maximum greeting ka answer.*/gi, "")
                .replace(/etc\.\..*/gi, "")
                .replace(/show task me bhi.*/gi, "")
                .replace(/format se line se ajaye.*/gi, "")
                .replace(/tareekes e simple sa.*/gi, "")
                .replace(/lekin abhi response.*/gi, "")
                .replace(/nilkul thk nhi arha hai.*/gi, "")
                .replace(/User says.*They want greeting reply.*/gi, "")
                .replace(/According to instruction:.*/gi, "")
                .replace(/So we respond with that.*/gi, "")
                .replace(/We need to respond with a short answer.*/gi, "")
                .replace(/The instructions:.*So cannot repeat greeting.*/gi, "")
                .replace(/Must be one line max 2.*/gi, "")
                .replace(/Provide 1-2 emojis.*/gi, "")
                .replace(/Must not repeat.*/gi, "")
                .replace(/Maybe just state that the tasks are listed.*/gi, "")
                .replace(/The instruction:.*max 1 line.*max 2 for task list.*.*Let's respond:.*/gi, "")
                .replace(/We need to call.*Use user_id.*/gi, "")
                .replace(/We need to.*/gi, "")
                .replace(/according to.*instruction.*/gi, "")
                .trim();

              // Remove excessive repetitions
              const sentences = cleanContent.split(/[.!?]+/);
              const uniqueSentences = [];
              const seen = new Set();

              for (const sentence of sentences) {
                const trimmed = sentence.trim();
                if (trimmed && !seen.has(trimmed)) {
                  seen.add(trimmed);
                  uniqueSentences.push(trimmed);
                }
              }

              cleanContent = uniqueSentences.join('. ');

              return {
                id: msg.id.toString(),
                role: msg.role,
                content: cleanContent,
                created_at: msg.created_at,
                tool_calls: msg.tool_calls,
              };
            });

            console.log("✅ Loaded", transformedMessages.length, "messages from history");
            setMessages(transformedMessages);

            // Set the conversation ID so new messages go to the same conversation
            setConversationId(mostRecentConversation.id);
          } else {
            console.error("Failed to load messages:", messagesResponse.status);
          }
        } else {
          console.log("💬 No previous conversations found for user");
        }
      } else {
        console.error("Failed to load conversations:", conversationsResponse.status);
      }
    } catch (error) {
      console.error("❌ Error loading conversation history:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

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

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      console.log("📤 Sending message to:", config.apiUrl);

      const response = await fetch(config.apiUrl, {
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

      // ✅ Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let assistantContent = "";
      let toolCalls: Array<{ tool: string; args: any }> = [];
      let shouldFetchTasks = false; // Flag no longer used - agent handles tasks via MCP tools

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("✅ Stream completed");
          break;
        }

        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });

        // Split by newlines (SSE format)
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6); // Remove "data: " prefix

            try {
              const data = JSON.parse(jsonStr);

              console.log("📨 SSE Event:", data);

              // Handle different event types
              if (data.type === "message") {
                // Aggressive filtering for cleaner responses
                let cleanContent = data.content;

                // Remove common AI internal instructions and templates
                cleanContent = cleanContent
                  .replace(/Rules \$\$   never say them   \$\$:?.*/gi, "")
                  .replace(/That's all.*/gi, "")
                  .replace(/Greeting:?.*/gi, "")
                  .replace(/Name answer:?.*/gi, "")
                  .replace(/Keep it.*/gi, "")
                  .replace(/Rules \(remember but NEVER.*\)/gi, "")
                  .replace(/This is greeting reply.*/gi, "")
                  .replace(/Use emojis.*/gi, "")
                  .replace(/Max 1 line.*/gi, "")
                  .replace(/Let's do that.*/gi, "")
                  .replace(/We must respond with greeting reply:.*/gi, "")
                  .replace(/This is greeting reply.*/gi, "")
                  .replace(/Use emojis.*/gi, "")
                  .replace(/Max 1 line.*/gi, "")
                  .replace(/Let's do that.*/gi, "")
                  .replace(/add \[task\].*/gi, "")
                  .replace(/create \[task\].*/gi, "")
                  .replace(/remind me to \[task\].*/gi, "")
                  .replace(/[a-f0-9-]{36}/gi, "") // Remove UUIDs
                  .replace(/show tasks.*/gi, "")
                  .replace(/list tasks.*/gi, "")
                  .replace(/what\\?'s on my list.*/gi, "")
                  .replace(/show pending.*/gi, "")
                  .replace(/what\\?'s left.*/gi, "")
                  .replace(/pending.*/gi, "")
                  .replace(/complete task \[id\].*/gi, "")
                  .replace(/mark \[id\] done.*/gi, "")
                  .replace(/delete task \[id\].*/gi, "")
                  .replace(/remove \[id\].*/gi, "")
                  .replace(/update task \[id\].*/gi, "")
                  .replace(/bilkul aesa nhi hona chaye.*/gi, "")
                  .replace(/maximum greeting ka answer.*/gi, "")
                  .replace(/etc\.\..*/gi, "")
                  .replace(/show task me bhi.*/gi, "")
                  .replace(/format se line se ajaye.*/gi, "")
                  .replace(/tareekes e simple sa.*/gi, "")
                  .replace(/lekin abhi response.*/gi, "")
                  .replace(/nilkul thk nhi arha hai.*/gi, "")
                  .trim();

                // Remove excessive greetings repetitions
                if (cleanContent.includes("Hi Fatima Altaf!") && assistantContent.includes("Hi Fatima Altaf!")) {
                  continue; // Skip duplicate greetings
                }

                // Filter out internal thoughts and reasoning
                const internalThoughtPatterns = [
                  /^We need to/i,
                  /according to response rules/i,
                  /there's no specific template/i,
                  /we must follow/i,
                  /looking at the/i,
                  /this is a/i,
                  /complete problem solve/i,
                  /ache se or UI me text doble baar/i,
                  /simpe an chaye/i,
                  /who am i\? this is/i,
                  /there's no tool usage rule/i,
                  /we can use/i,
                  /that seems fine/i,
                  /but we must not mention/i,
                  /just friendly/i,
                  /so respond with/i,
                  /let's do that/i,
                  /according to/i,
                  /internal thought/i,
                  /thinking process/i,
                  /reasoning:/i,
                  /analysis:/i,
                  /considering:/i,
                  /evaluating:/i,
                  /checking:/i,
                  /verifying:/i,
                  /greeting reply/i,
                  /template/i,
                  /instructions/i,
                  /rules/i,
                  /must respond/i,
                  /we must/i,
                  /this is/i,
                  /let's/i,
                  /so/i,
                  /use emojis/i,
                  /max 1 line/i,
                ];

                const isInternalThought = internalThoughtPatterns.some(
                  (pattern) => pattern.test(cleanContent),
                );

                if (isInternalThought || cleanContent.length < 3) {
                  console.log("Filtered internal thought:", cleanContent);
                  continue; // Skip this content
                }

                // Filter out repetitive or incomplete sentences
                const skipPatterns = [
                  "We need to",
                  "complete problem solve",
                  "ache se or UI me text doble baar",
                  "simpe an chaye",
                  "who am i? this is",
                  "there's no tool usage rule",
                  "we can use",
                  "that seems fine",
                  "but we must not mention",
                  "just friendly",
                  "so respond with",
                  "let's do that",
                  "This is greeting reply",
                  "Use emojis",
                  "Max 1 line",
                  "Let's do that",
                  "We must respond with greeting reply",
                ];

                if (
                  skipPatterns.some((pattern) =>
                    cleanContent.toLowerCase().includes(pattern.toLowerCase()),
                  ) || cleanContent.includes("7a5f9193-9b60-4477-8aee-ba65274af606")
                ) {
                  console.log("Filtered skip pattern:", cleanContent);
                  continue; // Skip this content
                }

                // Only add clean content to assistant response
                if (cleanContent && cleanContent.trim()) {
                  assistantContent += (assistantContent ? " " : "") + cleanContent.trim();
                  setStreamingMessage(assistantContent);
                }

                // No longer fetching tasks separately - agent handles via MCP tools
                // Check if message contains task list indicator - commented out to prevent task fetching
                /*
                if (cleanContent.toLowerCase().includes('tasks') &&
                    (cleanContent.toLowerCase().includes('here are') ||
                     cleanContent.toLowerCase().includes('your') ||
                     cleanContent.toLowerCase().includes('all'))) {
                  shouldFetchTasks = true;
                }
                */
              } else if (data.type === "tool_call") {
                console.log("🔧 Tool call:", data.tool, data.args);
                toolCalls.push({ tool: data.tool, args: data.args });

                // No longer fetching tasks separately - agent handles via MCP tools
                // Commented out to prevent task fetching
                /*
                if (data.tool === 'list_tasks') {
                  shouldFetchTasks = true;
                }
                */

                // Optionally show tool execution in UI
                setStreamingMessage(
                  (prev) => prev + `\n\n🔧 Using tool: ${data.tool}`,
                );
              } else if (data.type === "done") {
                console.log("✅ Conversation ID:", data.conversation_id);

                // Update conversation ID if new
                if (data.conversation_id && !conversationId) {
                  setConversationId(data.conversation_id);
                }

                // The agent handles tasks via MCP tools, so no need to fetch tasks separately
                // Task information should be returned as part of the chat response
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

      // ✅ Add complete assistant message
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

  // Function to fetch tasks
  const fetchTasks = async () => {
    try {
      // Construct the correct API URL for tasks
      const tasksApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${config.userId}/tasks`;

      const response = await fetch(tasksApiUrl, {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []); // The tasks should be directly in data property
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

  // Task List Component
  const TaskList = ({ tasks }: { tasks: Task[] }) => {
    if (tasks.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No tasks yet. Add one to get started!
        </div>
      );
    }

    return (
      <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3">Your Tasks</h3>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              task.completed
                ? "bg-green-50 border-green-200"
                : "bg-white border-gray-200"
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
                      ? "line-through text-gray-500"
                      : "text-gray-900"
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
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg shadow-lg">
      {/* User Info Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
            {userInfo?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Task Assistant</h2>
            <p className="text-sm text-blue-100">
              {userInfo ? `${userInfo.name} (${userInfo.email})` : "Loading..."}
            </p>
          </div>
        </div>
        <p className="text-xs text-blue-100 mt-2">
          Ask me to manage your tasks naturally
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">👋 Hi! I'm your AI task assistant</p>
            <p className="text-sm">Try saying:</p>
            <div className="mt-4 space-y-2">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-left">
                "Add a task to buy groceries"
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-left">
                "Show me all my tasks"
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-left">
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
                <div className="max-w-[80%] bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 w-full">
                  <TaskList tasks={tasks} />
                </div>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Show tool calls if any */}
                {message.tool_calls && message.tool_calls.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-700">
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
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}

        {/* Streaming message */}
        {loading && streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <p className="text-sm whitespace-pre-wrap">{streamingMessage}</p>
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs opacity-70">Typing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator (when no streaming content yet) */}
        {loading && !streamingMessage && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex gap-2">
          <AnimatedInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatKitWidget;
