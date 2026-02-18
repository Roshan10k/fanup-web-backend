import { z } from "zod";
import { PlayerRoleEnum } from "./fantasy.enums";

export const PlayerSchema = z.object({
  fullName: z.string().min(1),
  shortName: z.string().optional(),
  teamShortName: z.string().min(1),
  role: PlayerRoleEnum,
  credit: z.number().min(0).max(15),
  imageUrl: z.string().url().optional(),
  isPlaying: z.boolean().default(true),
});

export type PlayerType = z.infer<typeof PlayerSchema>;

export type PlayerDocument = PlayerType & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
