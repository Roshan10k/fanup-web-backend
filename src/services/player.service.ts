import { PlayerModel } from "../models/player.model";

export class PlayerService {
  async getPlayers(teamShortNames?: string[]) {
    const filter: Record<string, unknown> = {};

    if (teamShortNames && teamShortNames.length > 0) {
      filter.teamShortName = { $in: teamShortNames };
    }

    const players = await PlayerModel.find(filter).sort({ teamShortName: 1, fullName: 1 }).lean();
    return players;
  }
}
