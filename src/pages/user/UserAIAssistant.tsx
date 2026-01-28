import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  user_id: string;
  session_start: Date;
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  full_name?: string;
  blood_type?: string;
  allergies?: string[];
  medications?: string[];
  chronic_conditions?: string[];
  [key: string]: unknown;
}

const UserAIAssistant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [emergencyTriggering, setEmergencyTriggering] = useState(false);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history and user profile
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate('/auth');
          return;
        }

        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setProfile(profileData as UserProfile);

        // Load or create chat session
        const { data: chatData } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (chatData) {
          setSessionId(chatData.id);
          const parsedMessages = (chatData.messages as Array<{role: 'user' | 'assistant'; content: string; timestamp: string}>).map((msg) => ({
            id: crypto.randomUUID(),
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(parsedMessages);
        } else {
          // Create new session
          const newSessionId = crypto.randomUUID();
          const { data: newChat } = await supabase
            .from('chat_history')
            .insert({
              id: newSessionId,
              user_id: session.user.id,
              session_start: new Date().toISOString(),
              messages: [],
            })
            .select()
            .single();

          if (newChat) {
            setSessionId(newChat.id);
            // Add welcome message
            const welcomeMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `Hello! I'm Uhai Assist, your AI-powered first aid guide. I'm here to provide step-by-step emergency guidance based on your medical profile. How can I help you today?`,
              timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load chat session',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [navigate, toast]);

  // Build system prompt with medical context
  const buildSystemPrompt = (): string => {
    const medicalContext = profile
      ? `
User Medical Profile:
- Name: ${profile.full_name || 'Not provided'}
- Blood Type: ${profile.blood_type || 'Unknown'}
- Allergies: ${Array.isArray(profile.allergies) ? profile.allergies.join(', ') : 'None listed'}
- Medications: ${Array.isArray(profile.medications) ? profile.medications.join(', ') : 'None listed'}
- Chronic Conditions: ${Array.isArray(profile.chronic_conditions) ? profile.chronic_conditions.join(', ') : 'None listed'}
`.trim()
      : '';

    return `You are Uhai Assist, an AI-powered first aid guidance system designed to provide emergency medical support. Your role is to:

1. Provide clear, step-by-step first aid instructions
2. Adapt guidance based on the user's medical history
3. Always prioritize calling emergency services (999 in Kenya) for life-threatening emergencies
4. Use non-technical, easy-to-understand language
5. Ask clarifying questions to understand the emergency
6. NEVER provide diagnosis or prescription advice
7. ALWAYS recommend professional medical evaluation for serious conditions

Medical Context:
${medicalContext}

Important Safety Guidelines:
- If the situation involves loss of consciousness, severe bleeding, difficulty breathing, chest pain, or other life-threatening symptoms, IMMEDIATELY advise calling 999 (Kenya Emergency Services)
- Guide the user to trigger the Emergency SOS feature if critical
- Provide first aid steps while emergency services are being contacted
- Be compassionate and reassuring

When providing first aid guidance, structure your response as:
1. Immediate Actions (what to do right now)
2. While Waiting for Help (ongoing care)
3. When to Call Emergency Services (danger signs)`;
  };

  // Call OpenRouter API
  const callAI = async (userMessage: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': 'UhaiLink First Aid Assistant',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(),
          },
          ...conversationHistory,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as Record<string, unknown>;
      throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as Record<string, unknown>;
    const choices = data.choices as Array<{ message: { content: string } }>;
    return choices[0].message.content;
  };

  // Send message
  const handleSendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    try {
      // Add user message to chat
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Call AI
      const assistantResponse = await callAI(userMessage);

      // Add assistant message
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Save to database
      if (sessionId) {
        const allMessages = [...messages, userMsg, assistantMsg];
        await supabase
          .from('chat_history')
          .update({
            messages: allMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp.toISOString(),
            })),
            updated_at: new Date().toISOString(),
          })
          .eq('id', sessionId);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get AI response';
      console.error('AI error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      });

      // Add error message
      const errorMsg_text: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I encountered an error while processing your request. Please try again or contact support if the problem persists.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg_text]);
    } finally {
      setSending(false);
    }
  };

  // Trigger emergency from chat
  const handleTriggerEmergency = async () => {
    if (emergencyTriggering) return;

    setEmergencyTriggering(true);
    try {
      // Navigate to emergency page which will handle the rest
      navigate('/dashboard/emergency');
    } catch (error) {
      console.error('Error triggering emergency:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to trigger emergency',
      });
    } finally {
      setEmergencyTriggering(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Uhai Assist</h1>
          <p className="text-muted-foreground">
            AI-powered first aid guidance available 24/7
          </p>
        </div>

        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Not a substitute for professional medical care.</strong> For life-threatening emergencies, call 999 immediately or use the Emergency SOS button.
          </AlertDescription>
        </Alert>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>First Aid Assistant</CardTitle>
            <CardDescription>
              Ask for first aid guidance or describe your situation
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 pr-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="text-muted-foreground">
                    <p className="text-lg mb-2">Start a conversation</p>
                    <p className="text-sm">Ask me about first aid, emergency procedures, or describe your situation</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground border border-border'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Describe your emergency or ask for first aid help..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !input.trim()}
                  size="icon"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Button
                onClick={handleTriggerEmergency}
                disabled={emergencyTriggering}
                variant="destructive"
                className="w-full h-10 text-base font-bold"
              >
                {emergencyTriggering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Triggering...
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Trigger Emergency SOS
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                For life-threatening emergencies, use the Emergency SOS button above or call 999
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Medical Context Summary */}
        {profile && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Your Medical Profile (Used for Guidance)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Blood Type</p>
                  <p className="font-semibold">{profile.blood_type || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Allergies</p>
                  <p className="font-semibold">
                    {Array.isArray(profile.allergies) && profile.allergies.length > 0
                      ? profile.allergies.join(', ')
                      : 'None listed'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Medications</p>
                  <p className="font-semibold">
                    {Array.isArray(profile.medications) && profile.medications.length > 0
                      ? profile.medications.join(', ')
                      : 'None listed'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Chronic Conditions</p>
                  <p className="font-semibold">
                    {Array.isArray(profile.chronic_conditions) && profile.chronic_conditions.length > 0
                      ? profile.chronic_conditions.join(', ')
                      : 'None listed'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Keep your profile updated to receive more personalized guidance
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserAIAssistant;
