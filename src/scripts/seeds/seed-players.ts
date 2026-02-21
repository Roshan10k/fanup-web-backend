import { PlayerModel } from "../../models/player.model";

const PLAYERS = [
  // ===== INDIA =====
  { fullName: "Rohit Sharma", shortName: "Rohit", teamShortName: "IND", role: "batsman", credit: 9.5 },
  { fullName: "Virat Kohli", shortName: "Kohli", teamShortName: "IND", role: "batsman", credit: 10 },
  { fullName: "Shubman Gill", shortName: "Gill", teamShortName: "IND", role: "batsman", credit: 8.5 },
  { fullName: "Suryakumar Yadav", shortName: "SKY", teamShortName: "IND", role: "batsman", credit: 9 },
  { fullName: "Tilak Varma", shortName: "Tilak", teamShortName: "IND", role: "batsman", credit: 7.5 },
  { fullName: "Rishabh Pant", shortName: "Pant", teamShortName: "IND", role: "wicket_keeper", credit: 8.5 },
  { fullName: "Sanju Samson", shortName: "Samson", teamShortName: "IND", role: "wicket_keeper", credit: 8 },
  { fullName: "Hardik Pandya", shortName: "Hardik", teamShortName: "IND", role: "all_rounder", credit: 9 },
  { fullName: "Axar Patel", shortName: "Axar", teamShortName: "IND", role: "all_rounder", credit: 8 },
  { fullName: "Shivam Dube", shortName: "Dube", teamShortName: "IND", role: "all_rounder", credit: 7.5 },
  { fullName: "Jasprit Bumrah", shortName: "Bumrah", teamShortName: "IND", role: "bowler", credit: 9 },
  { fullName: "Mohammed Shami", shortName: "Shami", teamShortName: "IND", role: "bowler", credit: 8.5 },
  { fullName: "Arshdeep Singh", shortName: "Arshdeep", teamShortName: "IND", role: "bowler", credit: 8 },
  { fullName: "Yuzvendra Chahal", shortName: "Chahal", teamShortName: "IND", role: "bowler", credit: 8 },
  { fullName: "Kuldeep Yadav", shortName: "Kuldeep", teamShortName: "IND", role: "bowler", credit: 8 },

  // ===== PAKISTAN =====
  { fullName: "Babar Azam", shortName: "Babar", teamShortName: "PAK", role: "batsman", credit: 9.5 },
  { fullName: "Fakhar Zaman", shortName: "Fakhar", teamShortName: "PAK", role: "batsman", credit: 8.5 },
  { fullName: "Abdullah Shafique", shortName: "Abdullah", teamShortName: "PAK", role: "batsman", credit: 7.5 },
  { fullName: "Iftikhar Ahmed", shortName: "Iftikhar", teamShortName: "PAK", role: "batsman", credit: 7.5 },
  { fullName: "Saim Ayub", shortName: "Saim", teamShortName: "PAK", role: "batsman", credit: 7.5 },
  { fullName: "Mohammad Rizwan", shortName: "Rizwan", teamShortName: "PAK", role: "wicket_keeper", credit: 9 },
  { fullName: "Sarfaraz Ahmed", shortName: "Sarfaraz", teamShortName: "PAK", role: "wicket_keeper", credit: 7.5 },
  { fullName: "Shadab Khan", shortName: "Shadab", teamShortName: "PAK", role: "all_rounder", credit: 8.5 },
  { fullName: "Imad Wasim", shortName: "Imad", teamShortName: "PAK", role: "all_rounder", credit: 8 },
  { fullName: "Mohammad Nawaz", shortName: "Nawaz", teamShortName: "PAK", role: "all_rounder", credit: 7.5 },
  { fullName: "Shaheen Afridi", shortName: "Shaheen", teamShortName: "PAK", role: "bowler", credit: 9 },
  { fullName: "Haris Rauf", shortName: "Rauf", teamShortName: "PAK", role: "bowler", credit: 8.5 },
  { fullName: "Naseem Shah", shortName: "Naseem", teamShortName: "PAK", role: "bowler", credit: 8 },
  { fullName: "Mohammad Wasim Jr", shortName: "Wasim", teamShortName: "PAK", role: "bowler", credit: 7.5 },
  { fullName: "Abrar Ahmed", shortName: "Abrar", teamShortName: "PAK", role: "bowler", credit: 7.5 },

  // ===== AUSTRALIA =====
  { fullName: "Travis Head", shortName: "Head", teamShortName: "AUS", role: "batsman", credit: 9 },
  { fullName: "David Warner", shortName: "Warner", teamShortName: "AUS", role: "batsman", credit: 9 },
  { fullName: "Mitchell Marsh", shortName: "M Marsh", teamShortName: "AUS", role: "batsman", credit: 8.5 },
  { fullName: "Steve Smith", shortName: "Smith", teamShortName: "AUS", role: "batsman", credit: 8.5 },
  { fullName: "Tim David", shortName: "T David", teamShortName: "AUS", role: "batsman", credit: 8 },
  { fullName: "Josh Inglis", shortName: "Inglis", teamShortName: "AUS", role: "wicket_keeper", credit: 8 },
  { fullName: "Matthew Wade", shortName: "Wade", teamShortName: "AUS", role: "wicket_keeper", credit: 7.5 },
  { fullName: "Glenn Maxwell", shortName: "Maxwell", teamShortName: "AUS", role: "all_rounder", credit: 9.5 },
  { fullName: "Cameron Green", shortName: "Green", teamShortName: "AUS", role: "all_rounder", credit: 8 },
  { fullName: "Marcus Stoinis", shortName: "Stoinis", teamShortName: "AUS", role: "all_rounder", credit: 8 },
  { fullName: "Pat Cummins", shortName: "Cummins", teamShortName: "AUS", role: "bowler", credit: 9 },
  { fullName: "Mitchell Starc", shortName: "Starc", teamShortName: "AUS", role: "bowler", credit: 9 },
  { fullName: "Josh Hazlewood", shortName: "Hazlewood", teamShortName: "AUS", role: "bowler", credit: 8.5 },
  { fullName: "Adam Zampa", shortName: "Zampa", teamShortName: "AUS", role: "bowler", credit: 8.5 },
  { fullName: "Nathan Ellis", shortName: "Ellis", teamShortName: "AUS", role: "bowler", credit: 7.5 },

  // ===== ENGLAND =====
  { fullName: "Phil Salt", shortName: "Salt", teamShortName: "ENG", role: "batsman", credit: 8.5 },
  { fullName: "Dawid Malan", shortName: "Malan", teamShortName: "ENG", role: "batsman", credit: 8 },
  { fullName: "Harry Brook", shortName: "Brook", teamShortName: "ENG", role: "batsman", credit: 8.5 },
  { fullName: "Jonny Bairstow", shortName: "Bairstow", teamShortName: "ENG", role: "batsman", credit: 8 },
  { fullName: "Liam Livingstone", shortName: "Livingstone", teamShortName: "ENG", role: "batsman", credit: 8 },
  { fullName: "Jos Buttler", shortName: "Buttler", teamShortName: "ENG", role: "wicket_keeper", credit: 9.5 },
  { fullName: "Sam Billings", shortName: "Billings", teamShortName: "ENG", role: "wicket_keeper", credit: 7.5 },
  { fullName: "Ben Stokes", shortName: "Stokes", teamShortName: "ENG", role: "all_rounder", credit: 9 },
  { fullName: "Moeen Ali", shortName: "Moeen", teamShortName: "ENG", role: "all_rounder", credit: 8 },
  { fullName: "Sam Curran", shortName: "Curran", teamShortName: "ENG", role: "all_rounder", credit: 8 },
  { fullName: "Jofra Archer", shortName: "Archer", teamShortName: "ENG", role: "bowler", credit: 8.5 },
  { fullName: "Mark Wood", shortName: "Wood", teamShortName: "ENG", role: "bowler", credit: 8.5 },
  { fullName: "Chris Jordan", shortName: "Jordan", teamShortName: "ENG", role: "bowler", credit: 7.5 },
  { fullName: "Adil Rashid", shortName: "Rashid", teamShortName: "ENG", role: "bowler", credit: 8 },
  { fullName: "Reece Topley", shortName: "Topley", teamShortName: "ENG", role: "bowler", credit: 7.5 },

  // ===== NEW ZEALAND =====
  { fullName: "Kane Williamson", shortName: "Williamson", teamShortName: "NZ", role: "batsman", credit: 9 },
  { fullName: "Finn Allen", shortName: "Allen", teamShortName: "NZ", role: "batsman", credit: 8 },
  { fullName: "Daryl Mitchell", shortName: "D Mitchell", teamShortName: "NZ", role: "batsman", credit: 8 },
  { fullName: "Glenn Phillips", shortName: "Phillips", teamShortName: "NZ", role: "batsman", credit: 8 },
  { fullName: "Mark Chapman", shortName: "Chapman", teamShortName: "NZ", role: "batsman", credit: 7.5 },
  { fullName: "Devon Conway", shortName: "Conway", teamShortName: "NZ", role: "wicket_keeper", credit: 8.5 },
  { fullName: "Tom Latham", shortName: "Latham", teamShortName: "NZ", role: "wicket_keeper", credit: 7.5 },
  { fullName: "Mitchell Santner", shortName: "Santner", teamShortName: "NZ", role: "all_rounder", credit: 8.5 },
  { fullName: "James Neesham", shortName: "Neesham", teamShortName: "NZ", role: "all_rounder", credit: 8 },
  { fullName: "Michael Bracewell", shortName: "Bracewell", teamShortName: "NZ", role: "all_rounder", credit: 7.5 },
  { fullName: "Trent Boult", shortName: "Boult", teamShortName: "NZ", role: "bowler", credit: 8.5 },
  { fullName: "Tim Southee", shortName: "Southee", teamShortName: "NZ", role: "bowler", credit: 8.5 },
  { fullName: "Lockie Ferguson", shortName: "Ferguson", teamShortName: "NZ", role: "bowler", credit: 8 },
  { fullName: "Matt Henry", shortName: "Henry", teamShortName: "NZ", role: "bowler", credit: 7.5 },
  { fullName: "Ish Sodhi", shortName: "Sodhi", teamShortName: "NZ", role: "bowler", credit: 7.5 },

  // ===== SOUTH AFRICA =====
  { fullName: "Quinton de Kock", shortName: "de Kock", teamShortName: "SA", role: "wicket_keeper", credit: 9 },
  { fullName: "Ryan Rickelton", shortName: "Rickelton", teamShortName: "SA", role: "wicket_keeper", credit: 7.5 },
  { fullName: "Reeza Hendricks", shortName: "Hendricks", teamShortName: "SA", role: "batsman", credit: 8 },
  { fullName: "Temba Bavuma", shortName: "Bavuma", teamShortName: "SA", role: "batsman", credit: 8.5 },
  { fullName: "Heinrich Klaasen", shortName: "Klaasen", teamShortName: "SA", role: "batsman", credit: 9 },
  { fullName: "David Miller", shortName: "Miller", teamShortName: "SA", role: "batsman", credit: 8.5 },
  { fullName: "Tristan Stubbs", shortName: "Stubbs", teamShortName: "SA", role: "batsman", credit: 7.5 },
  { fullName: "Aiden Markram", shortName: "Markram", teamShortName: "SA", role: "all_rounder", credit: 8.5 },
  { fullName: "Marco Jansen", shortName: "Jansen", teamShortName: "SA", role: "all_rounder", credit: 8 },
  { fullName: "Wayne Parnell", shortName: "Parnell", teamShortName: "SA", role: "all_rounder", credit: 7.5 },
  { fullName: "Kagiso Rabada", shortName: "Rabada", teamShortName: "SA", role: "bowler", credit: 8.5 },
  { fullName: "Anrich Nortje", shortName: "Nortje", teamShortName: "SA", role: "bowler", credit: 8 },
  { fullName: "Gerald Coetzee", shortName: "Coetzee", teamShortName: "SA", role: "bowler", credit: 7.5 },
  { fullName: "Tabraiz Shamsi", shortName: "Shamsi", teamShortName: "SA", role: "bowler", credit: 8 },
  { fullName: "Keshav Maharaj", shortName: "Maharaj", teamShortName: "SA", role: "bowler", credit: 7.5 },
] as const;

export async function seedPlayers() {
  console.log(`Seeding ${PLAYERS.length} players...`);
  await Promise.all(
    PLAYERS.map((player) =>
      PlayerModel.findOneAndUpdate(
        { fullName: player.fullName, teamShortName: player.teamShortName },
        {
          $set: {
            fullName: player.fullName,
            shortName: player.shortName,
            teamShortName: player.teamShortName,
            role: player.role,
            credit: player.credit,
            isPlaying: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).catch((err: unknown) => {
        console.warn(
          `Failed to seed player "${player.fullName}":`,
          err instanceof Error ? err.message : "Unknown seed error"
        );
      })
    )
  );
  console.log("Players seeded.");
}
