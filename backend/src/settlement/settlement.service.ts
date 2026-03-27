import { findActiveParticipants, updateSnooze, clearSnooze } from "./settlement.repository";
import { verifyBalance } from "../utils/stellarVerification";
import { User } from "../entities/user.entity";

export interface SettlementSuggestion {
  participants: string[];
  status: "partial" | "completed" | "invalid";
  details: string;
}

export async function generateSuggestions(): Promise<SettlementSuggestion[]> {
  const participants = await findActiveParticipants();
  const suggestions: SettlementSuggestion[] = [];

  // Example deterministic logic
  const total = participants.reduce((sum, u) => sum + Object.values(u.balances).reduce((a, b) => a + b, 0), 0);

  if (total === 0) {
    suggestions.push({ participants: participants.map(p => p.id), status: "completed", details: "All balances settled" });
  } else if (total > 0) {
    suggestions.push({ participants: participants.map(p => p.id), status: "partial", details: "Some balances remain unsettled" });
  } else {
    suggestions.push({ participants: participants.map(p => p.id), status: "invalid", details: "Balances mismatch" });
  }

  return suggestions;
}

export async function snoozeSettlement(userId: string, until: Date) {
  await updateSnooze(userId, until);
}

export async function unsnoozeSettlement(userId: string) {
  await clearSnooze(userId);
}

export async function verifySettlement(user: User, asset: string, amount: number): Promise<boolean> {
  return verifyBalance(user.id, asset, amount);
}
