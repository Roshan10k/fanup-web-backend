import { z } from "zod";

export const WalletTransactionTypeSchema = z.enum(["credit", "debit"]);

export const WalletTransactionSourceSchema = z.enum([
  "welcome_bonus",
  "daily_login",
  "contest_join",
  "contest_win",
  "contest_refund",
  "system_adjustment",
]);

export const WalletTransactionSchema = z.object({
  userId: z.string().min(1),
  type: WalletTransactionTypeSchema,
  source: WalletTransactionSourceSchema,
  amount: z.number().positive(),
  title: z.string().min(1),
  referenceId: z.string().min(1).optional(),
  eventKey: z.string().min(1),
});

export type WalletTransactionType = z.infer<typeof WalletTransactionTypeSchema>;
export type WalletTransactionSource = z.infer<typeof WalletTransactionSourceSchema>;
export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;
