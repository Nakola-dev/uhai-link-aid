import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const africasTalkingApiKey = Deno.env.get("AFRICAS_TALKING_API_KEY");
const africasTalkingUsername = Deno.env.get("AFRICAS_TALKING_USERNAME") || "sandbox";
// The sandbox only simulates delivery; real messages need the production endpoint.
const africasTalkingUrl =
  Deno.env.get("AFRICAS_TALKING_BASE_URL") ||
  (africasTalkingUsername === "sandbox"
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging");
const africasTalkingSenderId = Deno.env.get("AFRICAS_TALKING_SENDER_ID");
const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase configuration");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Contact {
  name: string;
  phone: string;
}

interface RequestBody {
  userId: string;
  incidentId: string;
}

type Provider = "africas_talking" | "twilio";

interface RecipientResult {
  phone: string;
  sent: boolean;
  provider: Provider | null;
  error?: string;
}

/** Providers need E.164; users often store Kenyan numbers as 07XX / 01XX / 254XX. */
function toE164(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("254")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `+254${digits}`;
  return digits;
}

/** Providers may echo numbers in a different format; compare on the subscriber digits. */
const phoneKey = (phone: string) => phone.replace(/\D/g, "").slice(-9);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function sendViaAfricasTalking(phones: string[], message: string): Promise<Map<string, RecipientResult>> {
  const results = new Map<string, RecipientResult>();
  if (!africasTalkingApiKey) return results;

  try {
    const params = new URLSearchParams({ username: africasTalkingUsername, to: phones.join(","), message });
    if (africasTalkingSenderId) params.set("from", africasTalkingSenderId);
    const response = await fetch(africasTalkingUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        apikey: africasTalkingApiKey,
      },
      body: params.toString(),
    });
    const data = (await response.json()) as {
      SMSMessageData?: { Recipients?: Array<{ number: string; status: string }> };
    };
    for (const recipient of data.SMSMessageData?.Recipients ?? []) {
      const sent = recipient.status === "Success";
      results.set(phoneKey(recipient.number), {
        phone: recipient.number,
        sent,
        provider: "africas_talking",
        error: sent ? undefined : recipient.status,
      });
    }
  } catch (error) {
    console.error("Africa's Talking request failed:", error instanceof Error ? error.message : error);
  }
  return results;
}

async function sendViaTwilio(phone: string, message: string): Promise<RecipientResult> {
  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    return { phone, sent: false, provider: null, error: "No SMS provider available" };
  }
  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: phone, From: twilioPhoneNumber, Body: message }).toString(),
    });
    if (response.ok) return { phone, sent: true, provider: "twilio" };
    const errorData = (await response.json()) as { message?: string };
    return { phone, sent: false, provider: "twilio", error: errorData.message ?? `HTTP ${response.status}` };
  } catch (error) {
    return { phone, sent: false, provider: "twilio", error: error instanceof Error ? error.message : String(error) };
  }
}

/** Plain GSM-7 text: emoji would force UCS-2 (70 chars per SMS) and render poorly on basic phones. */
function buildMessage(name: string, bloodType: string, lat: number | null, lng: number | null, triggeredAt: string | null) {
  const time = new Date(triggeredAt ?? Date.now()).toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const location = lat != null && lng != null
    ? `Location: https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}`
    : "Location: not available";
  return `EMERGENCY ALERT from UhaiLink: ${name} has triggered an SOS at ${time}.\n${location}\nBlood type: ${bloodType}\nPlease contact them now. If they are in danger, call 999 or 112.`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return json({ error: "Invalid or expired authentication token" }, 401);

    const { userId, incidentId } = (await req.json()) as RequestBody;
    if (!userId || !incidentId) return json({ error: "Missing required fields" }, 400);
    if (user.id !== userId) return json({ error: "Unauthorized: user mismatch" }, 403);

    // The incident must belong to the caller.
    const { data: incident } = await supabase
      .from("emergency_incidents")
      .select("triggered_at, location_lat, location_lng")
      .eq("id", incidentId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!incident) return json({ error: "Incident not found" }, 404);

    // Recipients come from the database, never from the request body, so this
    // endpoint cannot be used to text arbitrary numbers.
    const { data: contactRows, error: contactsError } = await supabase
      .from("emergency_contacts")
      .select("name, phone")
      .eq("user_id", userId)
      .order("priority", { ascending: true });
    if (contactsError) throw contactsError;

    const contacts: Contact[] = (contactRows ?? []).filter((c) => c.phone && c.phone.trim());
    if (contacts.length === 0) {
      return json({ success: false, error: "No emergency contacts with phone numbers", details: { success: 0, failed: 0 } }, 422);
    }

    const { data: profile } = await supabase.from("profiles").select("full_name, blood_type").eq("id", userId).maybeSingle();
    const message = buildMessage(
      profile?.full_name || "A UhaiLink user",
      profile?.blood_type || "not recorded",
      incident.location_lat,
      incident.location_lng,
      incident.triggered_at,
    );

    const phones = contacts.map((c) => toE164(c.phone));
    const atResults = await sendViaAfricasTalking(phones, message);
    const results: RecipientResult[] = [];
    for (const phone of phones) {
      // Fall back to Twilio only for numbers Africa's Talking did not accept, so nobody is texted twice.
      const viaAt = atResults.get(phoneKey(phone));
      results.push(viaAt?.sent ? viaAt : await sendViaTwilio(phone, message));
    }

    const sentAt = new Date().toISOString();
    const { error: logError } = await supabase.from("notifications").insert(
      contacts.map((contact, i) => ({
        user_id: userId,
        emergency_incident_id: incidentId,
        recipient_name: contact.name,
        recipient_phone: contact.phone,
        message_text: message,
        notification_type: "sms",
        status: results[i].sent ? "sent" : "failed",
        provider: results[i].provider,
        error_message: results[i].error ?? null,
        sent_at: results[i].sent ? sentAt : null,
      })),
    );
    if (logError) console.error("Error logging notifications:", logError.message);

    const sent = results.filter((r) => r.sent).length;
    const details = { success: sent, failed: results.length - sent };
    return sent > 0
      ? json({ success: true, message: `Sent ${sent} of ${results.length} SMS notifications`, details })
      : json({ success: false, error: "No SMS could be sent", details }, 502);
  } catch (error) {
    console.error("Edge function error:", error instanceof Error ? error.message : error);
    return json({ error: "An unexpected error occurred" }, 500);
  }
});
