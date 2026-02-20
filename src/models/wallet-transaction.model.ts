import mongoose, { Document, Schema } from "mongoose";
import {
  WalletTransactionSource,
  WalletTransactionType,
} from "../types/wallet-transaction.type";

const walletTransactionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    source: {
      type: String,
      enum: [
        "welcome_bonus",
        "daily_login",
        "contest_join",
        "contest_win",
        "contest_refund",
        "system_adjustment",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    referenceId: {
      type: String,
      default: null,
    },
    eventKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export interface IWalletTransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: WalletTransactionType;
  source: WalletTransactionSource;
  amount: number;
  title: string;
  referenceId?: string | null;
  eventKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export const WalletTransactionModel = mongoose.model<IWalletTransaction>(
  "WalletTransaction",
  walletTransactionSchema
);
