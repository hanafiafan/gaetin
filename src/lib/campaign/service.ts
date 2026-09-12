import { runBroadcast } from "@/lib/messaging/broadcast";
export const runCampaign = (id: string) => runBroadcast("CAMPAIGN", id);
