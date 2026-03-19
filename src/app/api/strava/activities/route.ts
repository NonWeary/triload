import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { getActivities } from "@/lib/strava"
import { calculateTrainingLoad } from "@/lib/calculations"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return new Response(null, { status: 401 })
  }

  try {
    const activities = await getActivities(session.accessToken)
    const trainingLoad = calculateTrainingLoad(activities)
    return Response.json({ activities, trainingLoad })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[/api/strava/activities]", message)
    return Response.json({ error: message }, { status: 500 })
  }
}
