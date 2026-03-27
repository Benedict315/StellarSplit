import { Router } from "express";
import { generateSuggestions, snoozeSettlement, unsnoozeSettlement, verifySettlement } from "./settlement.service";

const router = Router();

router.get("/suggestions", async (req, res) => {
  const suggestions = await generateSuggestions();
  res.json(suggestions);
});

router.post("/snooze", async (req, res) => {
  const { userId, until } = req.body;
  await snoozeSettlement(userId, new Date(until));
  res.json({ success: true });
});

router.post("/unsnooze", async (req, res) => {
  const { userId } = req.body;
  await unsnoozeSettlement(userId);
  res.json({ success: true });
});

router.post("/verify", async (req, res) => {
  const { user, asset, amount } = req.body;
  const verified = await verifySettlement(user, asset, amount);
  res.json({ verified });
});

export default router;
