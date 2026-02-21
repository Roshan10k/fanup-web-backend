import mongoose, { Document, Schema } from "mongoose";

const contestEntrySchema = new Schema(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teamId: {
      type: String,
      required: true,
      trim: true,
    },
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    captainId: {
      type: String,
      default: null,
    },
    viceCaptainId: {
      type: String,
      default: null,
    },
    playerIds: {
      type: [String],
      default: [],
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

contestEntrySchema.index({ matchId: 1, userId: 1 }, { unique: true });

export interface IContestEntry extends Document {
  _id: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  teamId: string;
  teamName: string;
  captainId?: string | null;
  viceCaptainId?: string | null;
  playerIds: string[];
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export const ContestEntryModel = mongoose.model<IContestEntry>(
  "ContestEntry",
  contestEntrySchema
);
