var DISCORD = "https://discord.com/invite/nanogram";
var ITCH = "https://nanogram.itch.io";
var IOS = "https://apps.apple.com/app/nanogram/id6755158260";
var AND = "https://play.google.com/store/apps/details?id=app.nanogram.alpha";


var DEMO_G = [

  ["Islandy", "Sim", 330, "pixelpanda", "Grow a tiny island one tile at a time."],

  ["Empty a Lake", "Puzzle", 190, "swipeking", "Drain it before the timer runs out."],

  ["Seat Yourself", "Casual", 45, "missclick", "Find a seat. Any seat."],

  ["Flappy Third", "Arcade", 20, "tapgod", "Flap three times. Then do it again."],

  ["Japan Run", "Arcade", 155, "nano_nia", "Sprint through Tokyo streets."],

  ["Find Button in the Snow!", "Puzzle", 205, "ghostpepper", "One button. A lot of snow."],

  ["Skydew Valley", "Sim", 285, "nano_nia", "A cozy farm floating in the clouds."],

  ["Olympus Obby", "Obby", 40, "obbylord", "Climb the mountain of the gods."],

  ["Deep Haul", "Arcade", 210, "framedrop", "Reel in whatever is down there."],

  ["Room Maker", "Sim", 300, "pixelpanda", "Design a room, then show it off."],

  ["Get Him", "Action", 5, "tapgod", "Catch him before he gets away."],

  ["Lucky Beggar", "Casual", 120, "missclick", "Beg, hustle, get lucky."],

  ["Crosser", "Arcade", 100, "swipeking", "Cross the road. Don't think."],

  ["Video Store Simulator", "Sim", 260, "ghostpepper", "Run the last video store in town."],

  ["Spell RNG", "Casual", 270, "obbylord", "Cast spells. Let chance decide."],

  ["Nano Hole", "Casual", 235, "framedrop", "Swallow the whole level."]

];


var DEMO_J = [

  {
    id: "sw",
    n: "Small Worlds Jam",
    h: 330,
    l: "S",
    d: "Build a game that fits on one tiny island, room or lake.",
    a: "2026-10-03",
    z: "2026-10-24",
    ppl: "1,240",
    g: [0, 1, 6, 9],
    tags: ["Creative", "Small", "Worldbuilding"],
    featured: true,
    rules: [
      "Build a game on Nanogram from a single sentence.",
      "Keep it on theme.",
      "Remix and tweak as much as you like.",
      "Submit before the deadline.",
      "Share your game with the community."
    ]
  },

  {
    id: "cz",
    n: "Cozy Corner Jam",
    h: 20,
    l: "C",
    d: "Make something soft, slow and relaxing to play.",
    a: "2026-10-05",
    z: "2026-10-12",
    ppl: "610",
    g: [2, 11, 13],
    tags: ["Cozy", "Relaxing", "Casual"],
    featured: false,
    rules: [
      "Create something comforting.",
      "Keep the experience accessible.",
      "Submit before the deadline.",
      "Share your creation with the community."
    ]
  },

  {
    id: "ob",
    n: "One Button Jam",
    h: 200,
    l: "1",
    d: "One tap is all the player gets. Make it deep.",
    a: "2026-11-07",
    z: "2026-11-14",
    ppl: "0",
    g: [],
    tags: ["Arcade", "Minimal", "Challenge"],
    featured: true,
    rules: [
      "The player gets one primary input.",
      "Make that single input meaningful.",
      "Submit before the deadline."
    ]
  },

  {
    id: "hw",
    n: "Holiday Jam",
    h: 150,
    l: "H",
    d: "Snow, lights and festive chaos.",
    a: "2026-12-05",
    z: "2026-12-12",
    ppl: "0",
    g: [],
    tags: ["Holiday", "Festive", "Fun"],
    featured: false,
    rules: [
      "Make something inspired by the holidays.",
      "Festive chaos encouraged.",
      "Submit before the deadline."
    ]
  },

  {
    id: "ny",
    n: "New Year Jam",
    h: 45,
    l: "N",
    d: "Start 2027 by shipping a game.",
    a: "2027-01-02",
    z: "2027-01-09",
    ppl: "0",
    g: [],
    tags: ["New Year", "Fresh Start"],
    featured: false,
    rules: [
      "Start the year with a game.",
      "Keep the scope achievable.",
      "Ship something."
    ]
  },

  {
    id: "sp",
    n: "Spooky Season Jam",
    h: 285,
    l: "G",
    d: "Ghosts, pumpkins and bad ideas.",
    a: "2026-09-28",
    z: "2026-10-05",
    ppl: "980",
    g: [5, 7, 10, 14],
    tags: ["Spooky", "Halloween", "Mystery"],
    featured: false,
    rules: [
      "Make something spooky.",
      "Keep it fun.",
      "Submit before the deadline."
    ]
  },

  {
    id: "sr",
    n: "Speedrun Jam",
    h: 160,
    l: "R",
    d: "Games built to be beaten in under 60 seconds.",
    a: "2026-09-07",
    z: "2026-09-14",
    ppl: "760",
    g: [8, 3, 12],
    tags: ["Speedrun", "Arcade", "Fast"],
    featured: false,
    rules: [
      "The intended run should take under 60 seconds.",
      "Make speed meaningful.",
      "Submit before the deadline."
    ]
  },

  {
    id: "ar",
    n: "Arcade Jam",
    h: 240,
    l: "A",
    d: "High scores, simple rules, one more try.",
    a: "2026-08-15",
    z: "2026-08-22",
    ppl: "540",
    g: [4, 15],
    tags: ["Arcade", "High Score", "Classic"],
    featured: false,
    rules: [
      "Build an arcade-style game.",
      "Make players want one more attempt.",
      "Submit before the deadline."
    ]
  }

];

// Live data comes from the database (see js/backend.js). Without Supabase keys the demo data above is shown.
var G = [];
var J = [];
