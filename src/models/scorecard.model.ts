import mongoose, { Document, Schema } from "mongoose";
import { ScorecardType } from "../types/scorecard.type";

const teamInningsSchema = new Schema(
  {
    teamShortName: { type: String, required: true, trim: true },
    runs: { type: Number, required: true, min: 0 },
    wickets: { type: Number, required: true, min: 0, max: 10 },
    overs: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const topPerformerSchema = new Schema(
  {
    playerName: { type: String, required: true, trim: true },
    teamShortName: { type: String, required: true, trim: true },
    performance: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const scorecardMongoSchema: Schema = new Schema(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
      unique: true,
    },
    innings: { type: [teamInningsSchema], required: true, default: [] },
    topBatters: { type: [topPerformerSchema], default: [] },
    topBowlers: { type: [topPerformerSchema], default: [] },
    resultText: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export interface IScorecard extends ScorecardType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ScorecardModel = mongoose.model<IScorecard>(
  "Scorecard",
  scorecardMongoSchema
);
