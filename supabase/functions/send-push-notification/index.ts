import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@insforge/sdk@1.4.0"

const INSFORGE_URL = Deno.env.get("INSFORGE_URL") || ""
const INSFORGE_SERVICE_KEY = Deno.env.get("INSFORGE_SERVICE_KEY") || ""

interface NotificationPayload {
  title: string
  body: string
  url?: string
  target_user_id?: string
  ficha?: number
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      )
    }

    const { title, body, url, target_user_id, ficha } = await req.json() as NotificationPayload

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "title and body are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const insforge = createClient({
      url: INSFORGE_URL,
      serviceKey: INSFORGE_SERVICE_KEY,
    })

    const channelName = ficha ? `notifications:ficha:${ficha}` : `notifications:user:${target_user_id}`

    await insforge.realtime.connect()

    const publishResult = await insforge.realtime.publish(channelName, "push_notification", {
      title,
      body,
      url: url || "/",
      timestamp: new Date().toISOString(),
    })

    if (!publishResult.ok) {
      console.error("Failed to publish notification:", publishResult.error)
    }

    return new Response(
      JSON.stringify({
        success: true,
        channel: channelName,
        message: "Notification published to realtime channel",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
