import { runBroadcast } from "@/lib/messaging/broadcast";
export const runBlast = (id: string) => runBroadcast("BLAST", id);
