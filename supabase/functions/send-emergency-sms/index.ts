import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const africasTalkingApiKey = Deno.env.get("AFRICAS_TALKING_API_KEY");
const africasTalkingUsername = Deno.env.get("AFRICAS_TALKING_USERNAME") || "sandbox";
const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase configuration");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Contact {
  id?: string;
  name: string;
  phone: string;
  relationship?: string;
}

interface RequestBody {
  userId: string;
  incidentId: string;
  contacts: Contact[];
}

async function sendSMSViaAfricasTalking(
  phoneNumbers: string[],
  message: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  if (!africasTalkingApiKey || !africasTalkingUsername) {
    return { success: 0, failed: phoneNumbers.length, errors: ["Africa's Talking not configured"] };
  }

  const errors: string[] = [];
  let successCount = 0;

  try {
    const response = await fetch(
      "https://api.sandbox.africastalking.com/version1/messaging",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "apikey": africasTalkingApiKey,
        },
        body: new URLSearchParams({
          username: africasTalkingUsername,
          to: phoneNumbers.join(","),
          message: message,
        }).toString(),
      }
    );

    const data = await response.json() as Record<string, unknown>;
    
    if (response.ok && data.SMSMessageData) {
      const smsData = data.SMSMessageData as Record<string, unknown>;
      const messages = smsData.Messages as Array<Record<string, unknown>>;
      messages?.forEach((msg) => {
        if (msg.Status === "Success") {
          successCount++;
        } else {
          errors.push(`Failed to send to ${msg.To}: ${msg.Status}`);
        }
      });
    } else {
      errors.push(`Africa's Talking API error: ${JSON.stringify(data)}`);
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Africa's Talking request failed: ${errorMsg}`);
  }

  return {
    success: successCount,
    failed: phoneNumbers.length - successCount,
    errors,
  };
}

async function sendSMSViaTwilio(
  phoneNumbers: string[],
  message: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    return { success: 0, failed: phoneNumbers.length, errors: ["Twilio not configured"] };
  }

  const errors: string[] = [];
  let successCount = 0;

  for (const phoneNumber of phoneNumbers) {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: phoneNumber,
            From: twilioPhoneNumber,
            Body: message,
          }).toString(),
        }
      );

      if (response.ok) {
        successCount++;
      } else {
        const errorData = await response.json() as Record<string, unknown>;
        errors.push(`Twilio failed for ${phoneNumber}: ${errorData}`);
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`Twilio request failed for ${phoneNumber}: ${errorMsg}`);
    }
  }

  return {
    success: successCount,
    failed: phoneNumbers.length - successCount,
    errors,
  };
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const { userId, incidentId, contacts } = body;

    if (!userId || !incidentId || !contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user profile for context
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, blood_type")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // Get incident for details
    const { data: incident, error: incidentError } = await supabase
      .from("emergency_incidents")
      .select("triggered_at, location_lat, location_lng")
      .eq("id", incidentId)
      .single();

    if (incidentError) {
      console.error("Error fetching incident:", incidentError);
    }

    // Build SMS message
    const name = profile?.full_name || "Someone";
    const bloodType = profile?.blood_type || "Unknown";
    const location = incident?.location_lat
      ? `Lat: ${incident.location_lat.toFixed(4)}, Lng: ${incident.location_lng.toFixed(4)}`
      : "Location unavailable";

    const smsMessage = `⚠️ EMERGENCY ALERT: ${name} has triggered an emergency on UhaiLink.\n\n📍 Location: ${location}\n🩸 Blood Type: ${bloodType}\n⏰ Time: ${new Date(incident?.triggered_at || Date.now()).toLocaleString()}\n\nPlease contact them immediately.`;

    // Get phone numbers
    const phoneNumbers = contacts
      .map((c) => c.phone)
      .filter((p) => p && p.trim());

    if (phoneNumbers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid phone numbers in contacts" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Try Africa's Talking first, fallback to Twilio
    let result = await sendSMSViaAfricasTalking(phoneNumbers, smsMessage);

    if (result.success === 0 && result.failed > 0) {
      console.log("Africa's Talking failed, trying Twilio...");
      result = await sendSMSViaTwilio(phoneNumbers, smsMessage);
    }

    // Log all notifications to database
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const { error: logError } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          emergency_incident_id: incidentId,
          recipient_name: contact.name,
          recipient_phone: contact.phone,
          message_text: smsMessage,
          notification_type: "sms",
          status: result.success > 0 ? "sent" : "failed",
          provider: africasTalkingApiKey ? "africas_talking" : "twilio",
          error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
          sent_at: new Date().toISOString(),
        });

      if (logError) {
        console.error("Error logging notification:", logError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${result.success} SMS notifications, ${result.failed} failed`,
        details: result,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Edge function error:", errorMsg);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
