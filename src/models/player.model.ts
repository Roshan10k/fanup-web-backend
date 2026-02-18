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
