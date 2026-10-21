import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Bot, Loader2, Phone, RotateCcw, Send, ShieldAlert, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useAuth, Profile } from '@/hooks/use-auth';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { PRIMARY_EMERGENCY_NUMBER, telHref } from '@/lib/emergency-numbers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AnswerContent from '@/components/assistant/AnswerContent';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardSkeleton from '@/components/DashboardSkeleton';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type StoredMessage = { role: 'user' | 'assistant'; content: string; timestamp: string };

const SUGGESTIONS = [
  'Someone is choking',
  'How do I treat a burn?',
  'What are the signs of a stroke?',
  'How do I stop heavy bleeding?',
  'Someone is having an asthma attack',
  'What should I do for a nosebleed?',
];

/** Preference only (no health data): whether to include the medical profile in prompts. */
const SHARE_PREF_KEY = 'uhailink.ai.share-medical-context';

const readSharePreference = () => {
  try {
    return localStorage.getItem(SHARE_PREF_KEY) === '1';
  } catch {
    return false;
  }
};

const listOrNone = (items: string[] | null | undefined) => (items && items.length > 0 ? items.join(', ') : 'none recorded');

/**
 * The user's name is never sent. Medical details are included only when the user
 * has switched on "Use my medical profile" (DPIA: AI chat is not linked to the
 * medical profile by default).
 */
function buildSystemPrompt(profile: Profile | null, shareMedical: boolean): string {
  const medicalContext = shareMedical && profile
    ? `The user chose to share this medical background:
- Blood type: ${profile.blood_type || 'not recorded'}
- Allergies: ${listOrNone(profile.allergies)}
- Medications: ${listOrNone(profile.medications)}
- Chronic conditions: ${listOrNone(profile.chronic_conditions)}`
    : 'No medical background was shared. Do not assume any.';

  return `You are Uhai Assist, a first-aid guidance assistant for people in Kenya.

1. Give clear, step-by-step first-aid instructions in plain, non-technical language.
2. For anything life-threatening (unresponsive, not breathing, severe bleeding, chest pain, stroke signs, severe allergic reaction, seizures) tell the user to call 999 or 112 immediately, before anything else.
3. Never diagnose, prescribe, or give medication doses. Recommend professional medical care for anything serious.
4. Ask a short clarifying question when the situation is unclear.
5. Be calm, kind and brief.

${medicalContext}

Structure first-aid answers with these headings:
### Immediate actions
### While waiting for help
### When to call 999 or 112`;
}

const UserAIAssistant = () => {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const { isOnline } = useOnlineStatus();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [shareMedical, setShareMedical] = useState(readSharePreference);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending, failedPrompt]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const loadSession = async () => {
      try {
        const { data: chat } = await supabase
          .from('chat_history')
          .select('id, messages')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;
        if (chat) {
          setSessionId(chat.id);
          const stored = (chat.messages as unknown as StoredMessage[]) ?? [];
          setMessages(stored.map((m) => ({ id: crypto.randomUUID(), role: m.role, content: m.content, timestamp: new Date(m.timestamp) })));
        } else {
          const { data: created } = await supabase
            .from('chat_history')
            .insert({ id: crypto.randomUUID(), user_id: user.id, session_start: new Date().toISOString(), messages: [] })
            .select('id')
            .single();
          if (created && !cancelled) setSessionId(created.id);
        }
      } catch {
        // History is a convenience; the assistant still works without it.
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    };
    loadSession();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const toggleShare = (value: boolean) => {
    setShareMedical(value);
    try {
      localStorage.setItem(SHARE_PREF_KEY, value ? '1' : '0');
    } catch {
      // Preference simply won't persist.
    }
  };

  const persist = async (all: Message[]) => {
    if (!sessionId) return;
    await supabase
      .from('chat_history')
      .update({
        messages: all.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp.toISOString() })) as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);
  };

  const ask = async (prompt: string, history: Message[]) => {
    setSending(true);
    setFailedPrompt(null);
    try {
      const { data, error } = await supabase.functions.invoke<{ content?: string }>('ai-chat-proxy', {
        body: {
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: buildSystemPrompt(profile, shareMedical),
        },
      });
      if (error || !data?.content) throw error ?? new Error('Empty response');
      const answer: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.content, timestamp: new Date() };
      const next = [...history, answer];
      setMessages(next);
      persist(next);
    } catch {
      setFailedPrompt(prompt);
    } finally {
      setSending(false);
    }
  };

  const send = (text: string) => {
    const prompt = text.trim();
    if (!prompt || sending) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: prompt, timestamp: new Date() };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    ask(prompt, history);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  if (authLoading || loadingHistory) {
    return (
      <DashboardLayout user={profile} isAdmin={isAdmin}>
        <DashboardSkeleton showHeader cards={0} rows={6} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="mx-auto flex max-w-3xl flex-col h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-8rem)] min-h-[28rem]">
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
              Uhai Assist
            </h1>
            <p className="text-sm text-muted-foreground">AI first-aid guidance. Not a doctor and not an emergency service.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="destructive">
              <a href={telHref(PRIMARY_EMERGENCY_NUMBER.number)}>
                <Phone className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Call {PRIMARY_EMERGENCY_NUMBER.number}
              </a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/emergency">
                <ShieldAlert className="h-4 w-4 mr-1.5" aria-hidden="true" />
                SOS
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border bg-card p-4" role="log" aria-live="polite" aria-label="Conversation">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col justify-center gap-5 text-center">
              <div>
                <p className="font-semibold">What's happening?</p>
                <p className="text-sm text-muted-foreground">Describe the situation, or start with one of these.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <Button key={suggestion} variant="outline" size="sm" className="rounded-full" disabled={!isOnline}
                    onClick={() => send(suggestion)}>
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[88%] rounded-2xl px-4 py-3',
                    message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'
                  )}>
                    <span className="sr-only">{message.role === 'user' ? 'You said:' : 'Uhai Assist said:'}</span>
                    {message.role === 'assistant' ? (
                      <AnswerContent text={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    )}
                    <span className={cn('mt-1 block text-[11px]', message.role === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Uhai Assist is writing a response…
                </div>
              )}
              {failedPrompt && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm" role="alert">
                  <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                  <span className="flex-1">
                    {isOnline ? "The assistant didn't respond." : "You're offline, so the assistant can't respond."}{' '}
                    If this is an emergency, call {PRIMARY_EMERGENCY_NUMBER.number} now.
                  </span>
                  <Button size="sm" variant="outline" disabled={!isOnline} onClick={() => ask(failedPrompt, messages)}>
                    <RotateCcw className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Try again
                  </Button>
                </div>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={onSubmit} className="pt-3 space-y-2">
          {!isOnline && (
            <p className="flex items-center gap-2 text-sm text-warning" role="status">
              <WifiOff className="h-4 w-4" aria-hidden="true" />
              You're offline. The assistant needs an internet connection.
            </p>
          )}
          <div className="flex items-end gap-2">
            <label htmlFor="assistant-input" className="sr-only">Describe the situation or ask a first-aid question</label>
            <Textarea
              id="assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Describe what's happening…"
              rows={1}
              className="min-h-11 max-h-32 resize-none"
              disabled={!isOnline}
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={sending || !input.trim() || !isOnline} aria-label="Send">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              <Switch checked={shareMedical} onCheckedChange={toggleShare} aria-describedby="share-hint" />
              Use my medical profile
            </label>
            <span id="share-hint">
              {shareMedical
                ? 'Blood type, allergies, medications and conditions are sent with your question — never your name.'
                : 'Off: only your question is sent.'}{' '}
              <Link to="/medical-disclaimer" className="underline underline-offset-2">Disclaimer</Link>
            </span>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UserAIAssistant;
