import mongoose, { Document, Schema } from "mongoose";
import { PlayerType } from "../types/player.type";

const playerMongoSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    shortName: { type: String, default: null },
    teamShortName: { type: String, required: true, trim: true, index: true },
    role: {
      type: String,
      enum: ["wicket_keeper", "batsman", "all_rounder", "bowler"],
      required: true,
      index: true,
    },
    credit: { type: Number, required: true, min: 0, max: 15 },
    imageUrl: { type: String, default: null },
    isPlaying: { type: Boolean, default: true },
    cricApiId: { type: String, default: null, index: true, sparse: true },
    stats: {
      battingAverage: { type: Number, default: null },
      strikeRate: { type: Number, default: null },
      bowlingEconomy: { type: Number, default: null },
      wickets: { type: Number, default: null },
      runs: { type: Number, default: null },
      hundreds: { type: Number, default: null },
      fifties: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
  }
);

export interface IPlayer extends PlayerType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const PlayerModel = mongoose.model<IPlayer>("Player", playerMongoSchema);
