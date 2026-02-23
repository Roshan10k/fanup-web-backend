import mongoose, { Document, Schema } from "mongoose";
import { MatchType } from "../types/match.type";

const teamInfoSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: null },
  },
  { _id: false }
);

const matchMongoSchema: Schema = new Schema(
  {
    externalMatchId: { type: String, index: true, sparse: true },
    source: {
      type: String,
      enum: ["internal_seed", "external_provider"],
      default: "internal_seed",
    },
    sport: { type: String, enum: ["cricket"], default: "cricket", index: true },
    league: { type: String, required: true, trim: true, index: true },
    season: { type: String, default: null },
    teamA: { type: teamInfoSchema, required: true },
    teamB: { type: teamInfoSchema, required: true },
    venue: { type: String, default: null },
    startTime: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["upcoming", "locked", "completed", "abandoned"],
      default: "upcoming",
      index: true,
    },
    isEditable: {
      type: Boolean,
      default: true,
      index: true,
    },
    result: {
      type: String,
      enum: ["team_a", "team_b", "draw", "no_result"],
      default: null,
    },
    winnerTeamShortName: { type: String, default: null },
    summary: { type: String, default: null },
    scorecardId: {
      type: Schema.Types.ObjectId,
      ref: "Scorecard",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export interface IMatch extends MatchType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const MatchModel = mongoose.model<IMatch>("Match", matchMongoSchema);
