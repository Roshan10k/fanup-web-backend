/**
 * Static IPL 2024 Player Seed
 * All players who appeared in at least 1 IPL 2024 match.
 * Source: ESPNCricinfo / Wikipedia IPL 2024 squads + match data
 *
 * No API calls - 100% offline static data
 */

import { PlayerModel } from "../../models/player.model";

// ─── Types ────────────────────────────────────────────────────────────────────

// Must match player.model.ts enum: "wicket_keeper" | "batsman" | "all_rounder" | "bowler"
type Role = "batsman" | "bowler" | "all_rounder" | "wicket_keeper";

interface StaticPlayer {
  fullName: string;
  shortName: string;
  teamShortName: string;
  role: Role;
  credit: number;
}

// ─── Credit Guidelines ────────────────────────────────────────────────────────
// 9.5  — Elite (Bumrah, Kohli, Suryakumar, etc.)
// 9.0  — Premium all-rounders / top bowlers
// 8.5  — Strong regulars
// 8.0  — Decent contributors
// 7.5  — Fringe / lower-order
// 7.0  — Rarely batted or bowled

// ─── Player Data — IPL 2024 ────────────────────────────────────────────────────

const IPL_2024_PLAYERS: StaticPlayer[] = [
  // ── Mumbai Indians (MI) ─────────────────────────────────────────────────────
  { fullName: "Rohit Sharma",       shortName: "Rohit",      teamShortName: "MI",   role: "batsman",       credit: 9.5 },
  { fullName: "Ishan Kishan",       shortName: "Ishan",      teamShortName: "MI",   role: "wicket_keeper", credit: 8.5 },
  { fullName: "Suryakumar Yadav",   shortName: "SKY",        teamShortName: "MI",   role: "batsman",       credit: 9.5 },
  { fullName: "Hardik Pandya",      shortName: "Hardik",     teamShortName: "MI",   role: "all_rounder",   credit: 9.0 },
  { fullName: "Tim David",          shortName: "Tim",        teamShortName: "MI",   role: "batsman",       credit: 8.5 },
  { fullName: "Tilak Varma",        shortName: "Tilak",      teamShortName: "MI",   role: "batsman",       credit: 8.5 },
  { fullName: "Dewald Brevis",      shortName: "Brevis",     teamShortName: "MI",   role: "batsman",       credit: 8.0 },
  { fullName: "Naman Dhir",         shortName: "Naman",      teamShortName: "MI",   role: "all_rounder",   credit: 7.5 },
  { fullName: "Jasprit Bumrah",     shortName: "Bumrah",     teamShortName: "MI",   role: "bowler",        credit: 9.5 },
  { fullName: "Gerald Coetzee",     shortName: "Coetzee",    teamShortName: "MI",   role: "bowler",        credit: 8.0 },
  { fullName: "Nuwan Thushara",     shortName: "Thushara",   teamShortName: "MI",   role: "bowler",        credit: 7.5 },
  { fullName: "Piyush Chawla",      shortName: "Chawla",     teamShortName: "MI",   role: "bowler",        credit: 7.5 },
  { fullName: "Kumar Kartikeya",    shortName: "Kartikeya",  teamShortName: "MI",   role: "bowler",        credit: 7.5 },
  { fullName: "Shreyas Gopal",      shortName: "Gopal",      teamShortName: "MI",   role: "bowler",        credit: 7.5 },
  { fullName: "Romario Shepherd",   shortName: "Shepherd",   teamShortName: "MI",   role: "all_rounder",   credit: 8.0 },
  { fullName: "Nehal Wadhera",      shortName: "Nehal",      teamShortName: "MI",   role: "batsman",       credit: 7.5 },
  { fullName: "Mohammad Nabi",      shortName: "Nabi",       teamShortName: "MI",   role: "all_rounder",   credit: 8.0 },

  // ── Chennai Super Kings (CSK) ────────────────────────────────────────────────
  { fullName: "Ruturaj Gaikwad",    shortName: "Ruturaj",    teamShortName: "CSK",  role: "batsman",       credit: 9.0 },
  { fullName: "Devon Conway",       shortName: "Conway",     teamShortName: "CSK",  role: "wicket_keeper", credit: 8.5 },
  { fullName: "Rachin Ravindra",    shortName: "Rachin",     teamShortName: "CSK",  role: "all_rounder",   credit: 8.5 },
  { fullName: "Ajinkya Rahane",     shortName: "Rahane",     teamShortName: "CSK",  role: "batsman",       credit: 8.0 },
  { fullName: "Shivam Dube",        shortName: "Dube",       teamShortName: "CSK",  role: "all_rounder",   credit: 8.5 },
  { fullName: "MS Dhoni",           shortName: "Dhoni",      teamShortName: "CSK",  role: "wicket_keeper", credit: 9.0 },
  { fullName: "Ravindra Jadeja",    shortName: "Jadeja",     teamShortName: "CSK",  role: "all_rounder",   credit: 9.5 },
  { fullName: "Moeen Ali",          shortName: "Moeen",      teamShortName: "CSK",  role: "all_rounder",   credit: 8.5 },
  { fullName: "Deepak Chahar",      shortName: "Deepak",     teamShortName: "CSK",  role: "bowler",        credit: 8.5 },
  { fullName: "Matheesha Pathirana",shortName: "Pathirana",  teamShortName: "CSK",  role: "bowler",        credit: 8.5 },
  { fullName: "Tushar Deshpande",   shortName: "Tushar",     teamShortName: "CSK",  role: "bowler",        credit: 8.0 },
  { fullName: "Maheesh Theekshana", shortName: "Theekshana", teamShortName: "CSK",  role: "bowler",        credit: 8.0 },
  { fullName: "Shardul Thakur",     shortName: "Shardul",    teamShortName: "CSK",  role: "all_rounder",   credit: 8.0 },
  { fullName: "Sameer Rizvi",       shortName: "Sameer",     teamShortName: "CSK",  role: "batsman",       credit: 7.5 },
  { fullName: "Daryl Mitchell",     shortName: "Mitchell",   teamShortName: "CSK",  role: "all_rounder",   credit: 8.0 },

  // ── Royal Challengers Bengaluru (RCB) ────────────────────────────────────────
  { fullName: "Virat Kohli",        shortName: "Kohli",      teamShortName: "RCB",  role: "batsman",       credit: 9.5 },
  { fullName: "Faf du Plessis",     shortName: "Faf",        teamShortName: "RCB",  role: "batsman",       credit: 8.5 },
  { fullName: "Rajat Patidar",      shortName: "Patidar",    teamShortName: "RCB",  role: "batsman",       credit: 8.5 },
  { fullName: "Glenn Maxwell",      shortName: "Maxwell",    teamShortName: "RCB",  role: "all_rounder",   credit: 9.0 },
  { fullName: "Cameron Green",      shortName: "Green",      teamShortName: "RCB",  role: "all_rounder",   credit: 8.5 },
  { fullName: "Dinesh Karthik",     shortName: "DK",         teamShortName: "RCB",  role: "wicket_keeper", credit: 8.0 },
  { fullName: "Anuj Rawat",         shortName: "Rawat",      teamShortName: "RCB",  role: "wicket_keeper", credit: 7.5 },
  { fullName: "Mohammed Siraj",     shortName: "Siraj",      teamShortName: "RCB",  role: "bowler",        credit: 9.0 },
  { fullName: "Josh Hazlewood",     shortName: "Hazlewood",  teamShortName: "RCB",  role: "bowler",        credit: 8.5 },
  { fullName: "Yash Dayal",         shortName: "Dayal",      teamShortName: "RCB",  role: "bowler",        credit: 7.5 },
  { fullName: "Karn Sharma",        shortName: "Karn",       teamShortName: "RCB",  role: "bowler",        credit: 7.5 },
  { fullName: "Mayank Dagar",       shortName: "Dagar",      teamShortName: "RCB",  role: "bowler",        credit: 7.5 },
  { fullName: "Reece Topley",       shortName: "Topley",     teamShortName: "RCB",  role: "bowler",        credit: 7.5 },
  { fullName: "Vijaykumar Vyshak",  shortName: "Vyshak",     teamShortName: "RCB",  role: "bowler",        credit: 7.5 },
  { fullName: "Will Jacks",         shortName: "Jacks",      teamShortName: "RCB",  role: "all_rounder",   credit: 8.0 },

  // ── Kolkata Knight Riders (KKR) ──────────────────────────────────────────────
  { fullName: "Shreyas Iyer",       shortName: "Shreyas",    teamShortName: "KKR",  role: "batsman",       credit: 9.0 },
  { fullName: "Venkatesh Iyer",     shortName: "Venkatesh",  teamShortName: "KKR",  role: "all_rounder",   credit: 8.5 },
  { fullName: "Angkrish Raghuvanshi",shortName: "Raghuvanshi",teamShortName: "KKR", role: "batsman",       credit: 7.5 },
  { fullName: "Rinku Singh",        shortName: "Rinku",      teamShortName: "KKR",  role: "batsman",       credit: 8.5 },
  { fullName: "Andre Russell",      shortName: "Russell",    teamShortName: "KKR",  role: "all_rounder",   credit: 9.5 },
  { fullName: "Sunil Narine",       shortName: "Narine",     teamShortName: "KKR",  role: "all_rounder",   credit: 9.0 },
  { fullName: "Ramandeep Singh",    shortName: "Ramandeep",  teamShortName: "KKR",  role: "all_rounder",   credit: 8.0 },
  { fullName: "Phil Salt",          shortName: "Salt",       teamShortName: "KKR",  role: "wicket_keeper", credit: 8.5 },
  { fullName: "Mitchell Starc",     shortName: "Starc",      teamShortName: "KKR",  role: "bowler",        credit: 9.0 },
  { fullName: "Varun Chakravarthy", shortName: "Varun",      teamShortName: "KKR",  role: "bowler",        credit: 8.5 },
  { fullName: "Harshit Rana",       shortName: "Harshit",    teamShortName: "KKR",  role: "bowler",        credit: 8.0 },
  { fullName: "Suyash Sharma",      shortName: "Suyash",     teamShortName: "KKR",  role: "bowler",        credit: 7.5 },
  { fullName: "Anrich Nortje",      shortName: "Nortje",     teamShortName: "KKR",  role: "bowler",        credit: 8.5 },

  // ── Delhi Capitals (DC) ──────────────────────────────────────────────────────
  { fullName: "David Warner",       shortName: "Warner",     teamShortName: "DC",   role: "batsman",       credit: 9.0 },
  { fullName: "Prithvi Shaw",       shortName: "Shaw",       teamShortName: "DC",   role: "batsman",       credit: 8.0 },
  { fullName: "Jake Fraser-McGurk", shortName: "Fraser-McGurk",teamShortName:"DC",  role: "batsman",       credit: 8.5 },
  { fullName: "Abishek Porel",      shortName: "Porel",      teamShortName: "DC",   role: "wicket_keeper", credit: 7.5 },
  { fullName: "Rishabh Pant",       shortName: "Pant",       teamShortName: "DC",   role: "wicket_keeper", credit: 9.5 },
  { fullName: "Tristan Stubbs",     shortName: "Stubbs",     teamShortName: "DC",   role: "batsman",       credit: 8.0 },
  { fullName: "Axar Patel",         shortName: "Axar",       teamShortName: "DC",   role: "all_rounder",   credit: 9.0 },
  { fullName: "Sumit Kumar",        shortName: "Sumit",      teamShortName: "DC",   role: "all_rounder",   credit: 7.5 },
  { fullName: "Mitchell Marsh",     shortName: "Marsh",      teamShortName: "DC",   role: "all_rounder",   credit: 8.5 },
  { fullName: "Kuldeep Yadav",      shortName: "Kuldeep",    teamShortName: "DC",   role: "bowler",        credit: 9.0 },
  { fullName: "Mukesh Kumar",       shortName: "Mukesh",     teamShortName: "DC",   role: "bowler",        credit: 7.5 },
  { fullName: "Khaleel Ahmed",      shortName: "Khaleel",    teamShortName: "DC",   role: "bowler",        credit: 8.0 },
  { fullName: "Ishant Sharma",      shortName: "Ishant",     teamShortName: "DC",   role: "bowler",        credit: 7.5 },
  { fullName: "Rasikh Salam",       shortName: "Rasikh",     teamShortName: "DC",   role: "bowler",        credit: 7.5 },

  // ── Rajasthan Royals (RR) ────────────────────────────────────────────────────
  { fullName: "Yashasvi Jaiswal",   shortName: "Jaiswal",    teamShortName: "RR",   role: "batsman",       credit: 9.5 },
  { fullName: "Jos Buttler",        shortName: "Buttler",    teamShortName: "RR",   role: "wicket_keeper", credit: 9.5 },
  { fullName: "Sanju Samson",       shortName: "Sanju",      teamShortName: "RR",   role: "wicket_keeper", credit: 9.0 },
  { fullName: "Shimron Hetmyer",    shortName: "Hetmyer",    teamShortName: "RR",   role: "batsman",       credit: 8.5 },
  { fullName: "Dhruv Jurel",        shortName: "Jurel",      teamShortName: "RR",   role: "wicket_keeper", credit: 8.0 },
  { fullName: "Riyan Parag",        shortName: "Parag",      teamShortName: "RR",   role: "all_rounder",   credit: 8.5 },
  { fullName: "Rovman Powell",      shortName: "Powell",     teamShortName: "RR",   role: "batsman",       credit: 8.0 },
  { fullName: "Trent Boult",        shortName: "Boult",      teamShortName: "RR",   role: "bowler",        credit: 9.0 },
  { fullName: "Yuzvendra Chahal",   shortName: "Chahal",     teamShortName: "RR",   role: "bowler",        credit: 9.0 },
  { fullName: "Ravichandran Ashwin",shortName: "Ashwin",     teamShortName: "RR",   role: "all_rounder",   credit: 9.0 },
  { fullName: "Sandeep Sharma",     shortName: "Sandeep",    teamShortName: "RR",   role: "bowler",        credit: 8.0 },
  { fullName: "Avesh Khan",         shortName: "Avesh",      teamShortName: "RR",   role: "bowler",        credit: 8.0 },
  { fullName: "Nandre Burger",      shortName: "Burger",     teamShortName: "RR",   role: "bowler",        credit: 7.5 },
  { fullName: "Kuldeep Sen",        shortName: "Kuldeep S",  teamShortName: "RR",   role: "bowler",        credit: 7.5 },
  { fullName: "Tom Kohler-Cadmore", shortName: "Kohler-Cadmore",teamShortName:"RR", role: "batsman",       credit: 7.5 },

  // ── Punjab Kings (PBKS) ──────────────────────────────────────────────────────
  { fullName: "Shikhar Dhawan",     shortName: "Dhawan",     teamShortName: "PBKS", role: "batsman",       credit: 8.5 },
  { fullName: "Jonny Bairstow",     shortName: "Bairstow",   teamShortName: "PBKS", role: "wicket_keeper", credit: 8.5 },
  { fullName: "Prabhsimran Singh",  shortName: "Prabhsimran",teamShortName: "PBKS", role: "wicket_keeper", credit: 8.0 },
  { fullName: "Jitesh Sharma",      shortName: "Jitesh",     teamShortName: "PBKS", role: "wicket_keeper", credit: 8.0 },
  { fullName: "Liam Livingstone",   shortName: "Livingstone",teamShortName: "PBKS", role: "all_rounder",   credit: 9.0 },
  { fullName: "Sam Curran",         shortName: "Curran",     teamShortName: "PBKS", role: "all_rounder",   credit: 9.0 },
  { fullName: "Atharva Taide",      shortName: "Taide",      teamShortName: "PBKS", role: "batsman",       credit: 7.5 },
  { fullName: "Shashank Singh",     shortName: "Shashank",   teamShortName: "PBKS", role: "batsman",       credit: 8.0 },
  { fullName: "Kagiso Rabada",      shortName: "Rabada",     teamShortName: "PBKS", role: "bowler",        credit: 9.0 },
  { fullName: "Arshdeep Singh",     shortName: "Arshdeep",   teamShortName: "PBKS", role: "bowler",        credit: 9.0 },
  { fullName: "Harpreet Brar",      shortName: "Brar",       teamShortName: "PBKS", role: "all_rounder",   credit: 7.5 },
  { fullName: "Rahul Chahar",       shortName: "R Chahar",   teamShortName: "PBKS", role: "bowler",        credit: 8.0 },
  { fullName: "Harshal Patel",      shortName: "Harshal",    teamShortName: "PBKS", role: "bowler",        credit: 8.5 },
  { fullName: "Chris Woakes",       shortName: "Woakes",     teamShortName: "PBKS", role: "all_rounder",   credit: 8.0 },
  { fullName: "Ashutosh Sharma",    shortName: "Ashutosh",   teamShortName: "PBKS", role: "all_rounder",   credit: 7.5 },

  // ── Gujarat Titans (GT) ──────────────────────────────────────────────────────
  { fullName: "Shubman Gill",       shortName: "Gill",       teamShortName: "GT",   role: "batsman",       credit: 9.5 },
  { fullName: "Wriddhiman Saha",    shortName: "Saha",       teamShortName: "GT",   role: "wicket_keeper", credit: 7.5 },
  { fullName: "David Miller",       shortName: "Miller",     teamShortName: "GT",   role: "batsman",       credit: 8.5 },
  { fullName: "Sai Sudharsan",      shortName: "Sudharsan",  teamShortName: "GT",   role: "batsman",       credit: 8.5 },
  { fullName: "Vijay Shankar",      shortName: "Shankar",    teamShortName: "GT",   role: "all_rounder",   credit: 8.0 },
  { fullName: "Rahul Tewatia",      shortName: "Tewatia",    teamShortName: "GT",   role: "all_rounder",   credit: 8.5 },
  { fullName: "Shahrukh Khan",      shortName: "Shahrukh",   teamShortName: "GT",   role: "batsman",       credit: 7.5 },
  { fullName: "Rashid Khan",        shortName: "Rashid",     teamShortName: "GT",   role: "all_rounder",   credit: 9.5 },
  { fullName: "Noor Ahmad",         shortName: "Noor",       teamShortName: "GT",   role: "bowler",        credit: 8.0 },
  { fullName: "Mohammed Shami",     shortName: "Shami",      teamShortName: "GT",   role: "bowler",        credit: 9.0 },
  { fullName: "Umesh Yadav",        shortName: "Umesh",      teamShortName: "GT",   role: "bowler",        credit: 8.0 },
  { fullName: "Spencer Johnson",    shortName: "S Johnson",  teamShortName: "GT",   role: "bowler",        credit: 8.0 },
  { fullName: "Azmatullah Omarzai", shortName: "Omarzai",    teamShortName: "GT",   role: "all_rounder",   credit: 8.0 },
  { fullName: "Sandeep Warrier",    shortName: "Warrier",    teamShortName: "GT",   role: "bowler",        credit: 7.5 },

  // ── Lucknow Super Giants (LSG) ───────────────────────────────────────────────
  { fullName: "KL Rahul",           shortName: "KL",         teamShortName: "LSG",  role: "wicket_keeper", credit: 9.5 },
  { fullName: "Quinton de Kock",    shortName: "de Kock",    teamShortName: "LSG",  role: "wicket_keeper", credit: 9.0 },
  { fullName: "Ayush Badoni",       shortName: "Badoni",     teamShortName: "LSG",  role: "batsman",       credit: 8.0 },
  { fullName: "Deepak Hooda",       shortName: "D Hooda",    teamShortName: "LSG",  role: "all_rounder",   credit: 8.0 },
  { fullName: "Marcus Stoinis",     shortName: "Stoinis",    teamShortName: "LSG",  role: "all_rounder",   credit: 8.5 },
  { fullName: "Nicholas Pooran",    shortName: "Pooran",     teamShortName: "LSG",  role: "wicket_keeper", credit: 9.0 },
  { fullName: "Krunal Pandya",      shortName: "Krunal",     teamShortName: "LSG",  role: "all_rounder",   credit: 8.5 },
  { fullName: "Ravi Bishnoi",       shortName: "Bishnoi",    teamShortName: "LSG",  role: "bowler",        credit: 8.5 },
  { fullName: "Yash Thakur",        shortName: "Y Thakur",   teamShortName: "LSG",  role: "bowler",        credit: 7.5 },
  { fullName: "Mohsin Khan",        shortName: "Mohsin",     teamShortName: "LSG",  role: "bowler",        credit: 8.0 },
  { fullName: "Mark Wood",          shortName: "Wood",       teamShortName: "LSG",  role: "bowler",        credit: 8.5 },
  { fullName: "Naveen-ul-Haq",      shortName: "Naveen",     teamShortName: "LSG",  role: "bowler",        credit: 8.0 },
  { fullName: "Matt Henry",         shortName: "Henry",      teamShortName: "LSG",  role: "bowler",        credit: 8.0 },
  { fullName: "Kyle Mayers",        shortName: "Mayers",     teamShortName: "LSG",  role: "all_rounder",   credit: 8.0 },
  { fullName: "Prerak Mankad",      shortName: "Mankad",     teamShortName: "LSG",  role: "all_rounder",   credit: 7.5 },

  // ── Sunrisers Hyderabad (SRH) ────────────────────────────────────────────────
  { fullName: "Travis Head",        shortName: "Head",       teamShortName: "SRH",  role: "batsman",       credit: 9.5 },
  { fullName: "Abhishek Sharma",    shortName: "Abhishek",   teamShortName: "SRH",  role: "all_rounder",   credit: 8.5 },
  { fullName: "Aiden Markram",      shortName: "Markram",    teamShortName: "SRH",  role: "all_rounder",   credit: 8.5 },
  { fullName: "Heinrich Klaasen",   shortName: "Klaasen",    teamShortName: "SRH",  role: "wicket_keeper", credit: 9.0 },
  { fullName: "Abdul Samad",        shortName: "Samad",      teamShortName: "SRH",  role: "batsman",       credit: 8.0 },
  { fullName: "Rahul Tripathi",     shortName: "Tripathi",   teamShortName: "SRH",  role: "batsman",       credit: 8.0 },
  { fullName: "Nitish Kumar Reddy", shortName: "Nitish",     teamShortName: "SRH",  role: "all_rounder",   credit: 8.0 },
  { fullName: "Washington Sundar",  shortName: "Sundar",     teamShortName: "SRH",  role: "all_rounder",   credit: 8.5 },
  { fullName: "Pat Cummins",        shortName: "Cummins",    teamShortName: "SRH",  role: "all_rounder",   credit: 9.5 },
  { fullName: "Bhuvneshwar Kumar",  shortName: "Bhuvneshwar",teamShortName: "SRH",  role: "bowler",        credit: 8.5 },
  { fullName: "T Natarajan",        shortName: "Natarajan",  teamShortName: "SRH",  role: "bowler",        credit: 8.0 },
  { fullName: "Jaydev Unadkat",     shortName: "Unadkat",    teamShortName: "SRH",  role: "bowler",        credit: 7.5 },
  { fullName: "Shahbaz Ahmed",      shortName: "Shahbaz",    teamShortName: "SRH",  role: "all_rounder",   credit: 7.5 },
  { fullName: "Akeal Hosein",       shortName: "Hosein",     teamShortName: "SRH",  role: "bowler",        credit: 7.5 },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

interface SeedResult {
  upserted: number;
  errors: number;
}

export async function seedIPL2024Players(): Promise<SeedResult> {
  console.log("\n🏏 Seeding IPL 2024 Players (static, no API calls)\n" + "=".repeat(60));

  const result: SeedResult = { upserted: 0, errors: 0 };

  // Group by team for nicer logging
  const byTeam = IPL_2024_PLAYERS.reduce<Record<string, StaticPlayer[]>>((acc, p) => {
    (acc[p.teamShortName] ??= []).push(p);
    return acc;
  }, {});

  for (const [team, players] of Object.entries(byTeam)) {
    console.log(`\n📍 ${team} — ${players.length} players`);

    for (const player of players) {
      try {
        await PlayerModel.findOneAndUpdate(
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
        );

        console.log(`   ✅ ${player.fullName} (${player.role}, ${player.credit} cr)`);
        result.upserted++;
      } catch (err) {
        console.error(`   ❌ ${player.fullName}: ${err instanceof Error ? err.message : err}`);
        result.errors++;
      }
    }
  }

  return result;
}

// ─── Export data for use elsewhere ───────────────────────────────────────────

export { IPL_2024_PLAYERS };
export type { StaticPlayer };
