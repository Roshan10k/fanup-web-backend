import { Request, Response } from "express";
import { PlayerService } from "../services/player.service";

const playerService = new PlayerService();

export class PlayerController {
  async getPlayers(req: Request, res: Response) {
    try {
      const teamsParam = String(req.query.teamShortNames || "").trim();
      const teamShortNames = teamsParam
        ? teamsParam
            .split(",")
            .map((item) => item.trim().toUpperCase())
            .filter(Boolean)
        : [];

      const players = await playerService.getPlayers(teamShortNames);

      return res.status(200).json({
        success: true,
        message: "Players retrieved successfully",
        data: players,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve players",
      });
    }
  }
}
