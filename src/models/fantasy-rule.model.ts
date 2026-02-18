import mongoose, { Document, Schema } from "mongoose";
import { FantasyRuleType } from "../types/fantasy-rule.type";

const roleLimitSchema = new Schema(
  {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const fantasyRuleMongoSchema: Schema = new Schema(
  {
    sport: { type: String, enum: ["cricket"], default: "cricket", index: true },
    league: { type: String, required: true, trim: true, index: true },
    teamSize: { type: Number, required: true, min: 1 },
    creditCap: { type: Number, required: true, min: 1 },
    roleLimits: {
      wicket_keeper: { type: roleLimitSchema, required: true },
      batsman: { type: roleLimitSchema, required: true },
      all_rounder: { type: roleLimitSchema, required: true },
      bowler: { type: roleLimitSchema, required: true },
    },
    captainMultiplier: { type: Number, required: true, default: 2, min: 1 },
    viceCaptainMultiplier: { type: Number, required: true, default: 1.5, min: 1 },
    pointsTable: {
      type: Map,
      of: Number,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

fantasyRuleMongoSchema.index({ sport: 1, league: 1 }, { unique: true });

export interface IFantasyRule extends FantasyRuleType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const FantasyRuleModel = mongoose.model<IFantasyRule>(
  "FantasyRule",
  fantasyRuleMongoSchema
);
