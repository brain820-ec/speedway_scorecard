/**
 * Speedway Rules Engine - British Speedway Standard 15-Heat Format
 * Implements SGB Premiership / SGB Championship official pairing matrices,
 * gate allocations, bonus point logic, tactical substitutes, and rider stats.
 */

export const HELMET_COLORS = {
  HOME_1: { id: 'red', name: 'Red', hex: '#ef4444', textHex: '#ffffff', borderHex: '#b91c1c' },
  HOME_2: { id: 'blue', name: 'Blue', hex: '#3b82f6', textHex: '#ffffff', borderHex: '#1d4ed8' },
  AWAY_1: { id: 'white', name: 'White', hex: '#f8fafc', textHex: '#0f172a', borderHex: '#cbd5e1' },
  AWAY_2: { id: 'yellow', name: 'Yellow', hex: '#eab308', textHex: '#000000', borderHex: '#ca8a04' },
  TACTICAL: { id: 'green', name: 'Green / White', hex: '#22c55e', textHex: '#ffffff', borderHex: '#15803d' },
};

export const EXCLUSION_CODES = [
  { code: 'X', label: 'Excluded (Referee)', description: 'Disqualified by referee for foul or safety violation', points: 0 },
  { code: 'M', label: 'Excluded (2 Mins)', description: 'Excluded under 2-minute time allowance', points: 0 },
  { code: 'F', label: 'Fell', description: 'Fell during race and did not remount', points: 0 },
  { code: 'FX', label: 'Fell & Excluded', description: 'Fell and was disqualified as primary cause of stoppage', points: 0 },
  { code: 'FN', label: 'Fell & Injured', description: 'Fell and unable to take part in re-run', points: 0 },
  { code: 'R', label: 'Retired (Engine Failure)', description: 'Retired from heat due to mechanical fault or stoppage', points: 0 },
  { code: 'T', label: 'Tapes Violation', description: 'Touched tapes at start gate', points: 0 },
  { code: 'NS', label: 'Non-Starter', description: 'Did not arrive at gate for the heat', points: 0 },
  { code: 'TS', label: 'Tactical Substitute', description: 'Replaced by tactical substitute rider', points: 0, isSubstitute: true },
  { code: 'R/R', label: 'Rider Replacement', description: 'Replaced under Rider Replacement facility', points: 0, isSubstitute: true },
];

/**
 * Official British Speedway Team Presets with complete 7-rider rosters & CMA averages
 */
export const BRITISH_TEAMS_PRESET = [
  // 2026 Premiership League - Issue 18 Declarations
  {
    id: 'bellevue',
    name: 'Belle Vue Aces',
    track: 'National Speedway Stadium',
    league: 'SGB Premiership',
    defaultColor: '#ef4444',
    teamTotalCma: 39.77,
    roster: [
      { number: 1, name: 'Brady Kurtz', cma: 9.20, cma5Pct: 9.66, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Jason Doyle', cma: 8.14, cma5Pct: 8.55, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Zach Cook', cma: 7.07, cma5Pct: 7.42, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Peter Kildemand', cma: 5.73, cma5Pct: 6.02, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Norick Blodorn', cma: 5.35, cma5Pct: 5.62, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Tate Zischke', cma: 4.28, cma5Pct: 4.28, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'William Cairns', cma: 4.00, cma5Pct: 4.00, isReserve: true, isRisingStar: true, isRiderReplacement: false },
    ],
    outgoing: [{ name: 'Dan Bewley', cma: 8.78 }],
  },
  {
    id: 'sheffield',
    name: 'Sheffield Tigers',
    track: 'Owlerton Stadium',
    league: 'SGB Premiership',
    defaultColor: '#3b82f6',
    teamTotalCma: 39.21,
    roster: [
      { number: 1, name: 'Jack Holder', cma: 8.75, cma5Pct: 9.19, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Josh Pickering', cma: 7.88, cma5Pct: 8.27, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Chris Holder', cma: 7.29, cma5Pct: 7.65, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Leon Flint', cma: 6.34, cma5Pct: 6.66, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Anders Rowe', cma: 5.65, cma5Pct: 5.93, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Jye Etheridge', cma: 3.30, cma5Pct: 3.30, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Luke Killeen', cma: 3.00, cma5Pct: 3.00, isReserve: true, isRisingStar: true, isRiderReplacement: false },
    ],
    outgoing: [],
  },
  {
    id: 'ipswich',
    name: 'Ipswich Witches',
    track: 'Foxhall Stadium',
    league: 'SGB Premiership',
    defaultColor: '#eab308',
    teamTotalCma: 37.65,
    roster: [
      { number: 1, name: 'Richard Lawson', cma: 7.64, cma5Pct: 8.02, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Danny King', cma: 7.24, cma5Pct: 7.60, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Tobiasz Musielak', cma: 6.79, cma5Pct: 7.13, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Tom Brennan', cma: 6.53, cma5Pct: 6.86, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Scott Nicholls', cma: 5.92, cma5Pct: 6.22, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Kevin Juhl Pedersen', cma: 3.53, cma5Pct: 3.53, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Jason Edwards', cma: 3.78, cma5Pct: 3.78, isReserve: true, isRisingStar: true, isRiderReplacement: false },
    ],
    outgoing: [{ name: 'Philip Hellstrom-Bangs', cma: 4.50 }],
  },
  {
    id: 'kingslynn',
    name: "King's Lynn Stars",
    track: 'Adrian Flux Arena',
    league: 'SGB Premiership',
    defaultColor: '#8b5cf6',
    teamTotalCma: 38.11,
    roster: [
      { number: 1, name: 'Max Fricke', cma: 8.85, cma5Pct: 9.29, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Jan Kvech', cma: 6.74, cma5Pct: 7.08, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Ben Cook', cma: 6.70, cma5Pct: 7.04, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Chris Harris', cma: 6.49, cma5Pct: 6.81, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Cooper Rushen', cma: 4.97, cma5Pct: 5.22, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Jordan Jenkins', cma: 4.36, cma5Pct: 4.36, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Jody Scott', cma: 3.00, cma5Pct: 3.00, isReserve: true, isRisingStar: true, isRiderReplacement: false },
    ],
    outgoing: [{ name: 'Paco Castagna', cma: 3.64 }],
  },
  {
    id: 'leicester',
    name: 'Leicester Lions',
    track: 'Pidcock Motorcycles Arena',
    league: 'SGB Premiership',
    defaultColor: '#10b981',
    teamTotalCma: 37.00,
    roster: [
      { number: 1, name: 'Ryan Douglas', cma: 8.76, cma5Pct: 9.20, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Sam Masters', cma: 6.92, cma5Pct: 7.27, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Dan Thompson', cma: 6.11, cma5Pct: 6.42, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Drew Kemp', cma: 5.40, cma5Pct: 5.67, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Nick Morris', cma: 5.06, cma5Pct: 5.31, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Kyle Howarth', cma: 4.75, cma5Pct: 4.75, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Joe Thompson', cma: 3.65, cma5Pct: 3.65, isReserve: true, isRisingStar: true, isRiderReplacement: false },
    ],
    outgoing: [{ name: 'Dan Gilkes', cma: 3.31 }],
  },
  {
    id: 'northampton',
    name: 'Northampton',
    track: 'Northampton Speedway',
    league: 'SGB Premiership',
    defaultColor: '#0284c7',
    teamTotalCma: 35.26,
    roster: [
      { number: 1, name: 'Niels-Kristian Iversen', cma: 7.21, cma5Pct: 7.57, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Jaimon Lidsey', cma: 6.58, cma5Pct: 6.91, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Kye Thomson', cma: 6.07, cma5Pct: 6.37, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Adam Ellis', cma: 6.07, cma5Pct: 6.37, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Nicolai Klindt', cma: 5.89, cma5Pct: 6.18, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Mitch McDiarmid', cma: 3.44, cma5Pct: 3.44, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Luke Harrison', cma: 3.00, cma5Pct: 3.00, isReserve: true, isRisingStar: true, isRiderReplacement: false },
    ],
    outgoing: [
      { name: 'Matej Zagar', cma: 5.89 },
      { name: 'Jonas Jeppesen', cma: 4.72 },
      { name: 'Troy Batchelor', cma: 4.85 },
    ],
  },
  // SGB Championship
  {
    id: 'poole',
    name: 'Poole Pirates',
    track: 'Wimborne Road',
    league: 'SGB Championship',
    defaultColor: '#2563eb',
    roster: [
      { number: 1, name: 'Richard Lawson', cma: 8.80, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Sam Hagon', cma: 4.90, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Ben Cook', cma: 8.20, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Zach Cook', cma: 7.70, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Tom Brennan', cma: 8.50, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Tobias Thomsen', cma: 4.50, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Vinnie Foord', cma: 3.50, isReserve: true, isRiderReplacement: false },
    ],
  },
  {
    id: 'glasgow',
    name: 'Glasgow Tigers',
    track: 'Ashfield Stadium',
    league: 'SGB Championship',
    defaultColor: '#ca8a04',
    roster: [
      { number: 1, name: 'Chris Harris', cma: 8.60, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'James Pearson', cma: 5.20, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Leon Flint', cma: 7.40, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Paul Starke', cma: 5.90, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Steve Worrall', cma: 8.00, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Jack Smith', cma: 4.60, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Ace Pijper', cma: 4.10, isReserve: true, isRiderReplacement: false },
    ],
  },
  {
    id: 'scunthorpe',
    name: 'Scunthorpe Scorpions',
    track: 'Eddie Wright Raceway',
    league: 'SGB Championship',
    defaultColor: '#ea580c',
    roster: [
      { number: 1, name: 'Michael Palm Toft', cma: 8.10, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Connor Mountain', cma: 6.00, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Simon Lambert', cma: 6.80, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Kye Thomson', cma: 6.50, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Kyle Howarth', cma: 8.30, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Nathan Ablitt', cma: 4.20, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Luke Harrison', cma: 3.80, isReserve: true, isRiderReplacement: false },
    ],
  },
  {
    id: 'redcar',
    name: 'Redcar Bears',
    track: 'ECCO Arena',
    league: 'SGB Championship',
    defaultColor: '#dc2626',
    roster: [
      { number: 1, name: 'Charles Wright', cma: 8.40, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Connor Bailey', cma: 5.30, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Dan Gilkes', cma: 6.10, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Jason Edwards', cma: 6.70, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Danny King', cma: 8.00, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Ben Trigger', cma: 4.00, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Jake Mulford', cma: 4.40, isReserve: true, isRiderReplacement: false },
    ],
  },
  {
    id: 'edinburgh',
    name: 'Edinburgh Monarchs',
    track: 'Armadale Stadium',
    league: 'SGB Championship',
    defaultColor: '#16a34a',
    roster: [
      { number: 1, name: 'Josh Pickering', cma: 8.70, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Lasse Fredriksen', cma: 4.80, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Kye Thomson', cma: 7.30, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Paco Castagna', cma: 6.40, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Justin Sedgmen', cma: 7.90, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Max James', cma: 3.60, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Connor Coles', cma: 4.10, isReserve: true, isRiderReplacement: false },
    ],
  },
  {
    id: 'berwick',
    name: 'Berwick Bandits',
    track: 'Shielfield Park',
    league: 'SGB Championship',
    defaultColor: '#475569',
    roster: [
      { number: 1, name: 'Rory Schlein', cma: 7.90, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Bastian Borke', cma: 5.10, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Jye Etheridge', cma: 6.60, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Drew Kemp', cma: 6.80, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Lewis Kerr', cma: 7.80, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Danyon Hume', cma: 5.40, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Freddy Hodder', cma: 3.50, isReserve: true, isRiderReplacement: false },
    ],
  },
  {
    id: 'plymouth',
    name: 'Plymouth Gladiators',
    track: 'Coliseum Stadium',
    league: 'SGB Championship',
    defaultColor: '#7c3aed',
    roster: [
      { number: 1, name: 'Nico Covatti', cma: 7.60, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Alfie Bowtell', cma: 5.40, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Dan Thompson', cma: 6.90, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Kyle Newman', cma: 6.20, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Ben Barker', cma: 7.50, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Joe Thompson', cma: 5.00, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Jacob Hook', cma: 3.80, isReserve: true, isRiderReplacement: false },
    ],
  },
  {
    id: 'workington',
    name: 'Workington Comets',
    track: 'Northside Speedway',
    league: 'SGB Championship',
    defaultColor: '#059669',
    roster: [
      { number: 1, name: 'Craig Cook', cma: 8.50, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Tate Zischke', cma: 5.80, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Antti Vuolas', cma: 6.40, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Claus Vissing', cma: 6.70, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Troy Batchelor', cma: 8.20, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Celina Liebmann', cma: 3.90, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Sam McGurk', cma: 3.60, isReserve: true, isRiderReplacement: false },
    ],
  },
  {
    id: 'oxford_cheetahs',
    name: 'Oxford Cheetahs',
    track: 'Oxford Stadium',
    league: 'SGB Championship',
    defaultColor: '#0369a1',
    roster: [
      { number: 1, name: 'Sam Masters', cma: 8.60, isReserve: false, isRiderReplacement: false },
      { number: 2, name: 'Henry Atkins', cma: 4.70, isReserve: false, isRiderReplacement: false },
      { number: 3, name: 'Cameron Heeps', cma: 6.50, isReserve: false, isRiderReplacement: false },
      { number: 4, name: 'Jordan Jenkins', cma: 6.80, isReserve: false, isRiderReplacement: false },
      { number: 5, name: 'Scott Nicholls', cma: 8.40, isReserve: false, isRiderReplacement: false },
      { number: 6, name: 'Ashton Boughen', cma: 5.20, isReserve: true, isRiderReplacement: false },
      { number: 7, name: 'Luke Killeen', cma: 4.30, isReserve: true, isRiderReplacement: false },
    ],
  },
];

/**
 * Standard British 15-Heat Match Matrix
 * Each rider 1-7 is scheduled for 4 programmed rides in Heats 1-14.
 * Heat 15 is the Nominated Heat.
 */
export const BRITISH_15_HEAT_MATRIX = [
  { heat: 1, home: [1, 2], away: [1, 2], note: 'Opening clash' },
  { heat: 2, home: [6, 7], away: [6, 7], note: 'Reserves heat' },
  { heat: 3, home: [3, 4], away: [3, 4], note: 'Middle order' },
  { heat: 4, home: [5, 7], away: [5, 7], note: 'Heat Leader & Reserve' },
  { heat: 5, home: [3, 4], away: [1, 2], note: 'Home middle vs Away top' },
  { heat: 6, home: [1, 2], away: [5, 6], note: 'Home top vs Away pairing' },
  { heat: 7, home: [5, 6], away: [3, 4], note: 'Home pairing vs Away middle' },
  { heat: 8, home: [2, 7], away: [2, 7], note: 'Second string & Reserve' },
  { heat: 9, home: [3, 4], away: [5, 6], note: 'Middle order vs Away pairing' },
  { heat: 10, home: [1, 2], away: [3, 4], note: 'Home top vs Away middle' },
  { heat: 11, home: [5, 6], away: [1, 2], note: 'Clash of strings' },
  { heat: 12, home: [3, 7], away: [3, 6], note: 'Second string & Reserve' },
  { heat: 13, home: [1, 5], away: [1, 5], note: 'Heat Leaders clash (No. 1 & No. 5)' },
  { heat: 14, home: [4, 6], away: [4, 7], note: 'Penultimate heat' },
  { heat: 15, home: [null, null], away: [null, null], note: 'Nominated Heat (Top Scorers)', isNominated: true },
];

/**
 * Finds a team preset by id or name
 */
export function getTeamPreset(nameOrId) {
  if (!nameOrId) return null;
  const lower = nameOrId.toLowerCase().trim();
  return BRITISH_TEAMS_PRESET.find((t) => t.id.toLowerCase() === lower || t.name.toLowerCase() === lower) || null;
}

/**
 * Returns a cloned 7-rider roster for a team name, matching preset if available
 */
export function getRosterForTeam(teamName, isHome = true) {
  const preset = getTeamPreset(teamName);
  if (preset && preset.roster) {
    return preset.roster.map((r) => ({ ...r }));
  }
  return createDefaultRoster(teamName, isHome);
}

/**
 * Creates a blank standard 7-rider British team roster
 */
export function createDefaultRoster(teamName = 'Team', isHome = true) {
  return [
    { number: 1, name: `${teamName} No. 1`, cma: 8.50, isReserve: false, isRiderReplacement: false },
    { number: 2, name: `${teamName} No. 2`, cma: 5.50, isReserve: false, isRiderReplacement: false },
    { number: 3, name: `${teamName} No. 3`, cma: 7.20, isReserve: false, isRiderReplacement: false },
    { number: 4, name: `${teamName} No. 4`, cma: 6.00, isReserve: false, isRiderReplacement: false },
    { number: 5, name: `${teamName} No. 5`, cma: 8.00, isReserve: false, isRiderReplacement: false },
    { number: 6, name: `${teamName} No. 6`, cma: 4.50, isReserve: true, isRiderReplacement: false },
    { number: 7, name: `${teamName} No. 7`, cma: 3.50, isReserve: true, isRiderReplacement: false },
  ];
}

/**
 * Generates the full initial match state structure
 */
export function createNewMatch({
  id = `match-${Date.now()}`,
  title = '',
  homeTeamName = 'Belle Vue Aces',
  awayTeamName = 'Sheffield Tigers',
  track = '',
  league = '',
  referee = '',
  date = new Date().toISOString().split('T')[0],
  time = '19:30',
  heat1gates = 'home', // 'home' | 'away'
  heat15gates = 'home', // 'home' | 'away'
  homeRoster = null,
  awayRoster = null,
} = {}) {
  const homePreset = getTeamPreset(homeTeamName);
  const awayPreset = getTeamPreset(awayTeamName);

  const finalTrack = track || homePreset?.track || 'National Speedway Stadium';
  const finalLeague = league || homePreset?.league || 'SGB Premiership';

  const home = homeRoster || getRosterForTeam(homeTeamName, true);
  const away = awayRoster || getRosterForTeam(awayTeamName, false);

  // Build the 15 heats
  const heats = BRITISH_15_HEAT_MATRIX.map((template) => {
    const heatNum = template.heat;
    const gateAssignment = getGateAssignment(heatNum, heat1gates, heat15gates);

    const homeRider1Num = template.home[0];
    const homeRider2Num = template.home[1];
    const awayRider1Num = template.away[0];
    const awayRider2Num = template.away[1];

    return {
      heatNumber: heatNum,
      note: template.note,
      isNominated: !!template.isNominated,
      status: 'pending',
      timeSeconds: null,
      homeScore: 0,
      awayScore: 0,
      riders: [
        {
          team: 'home',
          helmet: 'red',
          gate: gateAssignment.home[0],
          riderNumber: homeRider1Num,
          riderName: getRiderName(home, homeRider1Num),
          isSubstitute: false,
          substituteType: null, // 'tactical' | 'reserve' | 'rr'
          originalRiderNumber: homeRider1Num,
          position: null,
          points: null,
          bonus: 0,
          exclusionCode: null,
          tacticalJoker: false,
        },
        {
          team: 'home',
          helmet: 'blue',
          gate: gateAssignment.home[1],
          riderNumber: homeRider2Num,
          riderName: getRiderName(home, homeRider2Num),
          isSubstitute: false,
          substituteType: null,
          originalRiderNumber: homeRider2Num,
          position: null,
          points: null,
          bonus: 0,
          exclusionCode: null,
          tacticalJoker: false,
        },
        {
          team: 'away',
          helmet: 'white',
          gate: gateAssignment.away[0],
          riderNumber: awayRider1Num,
          riderName: getRiderName(away, awayRider1Num),
          isSubstitute: false,
          substituteType: null,
          originalRiderNumber: awayRider1Num,
          position: null,
          points: null,
          bonus: 0,
          exclusionCode: null,
          tacticalJoker: false,
        },
        {
          team: 'away',
          helmet: 'yellow',
          gate: gateAssignment.away[1],
          riderNumber: awayRider2Num,
          riderName: getRiderName(away, awayRider2Num),
          isSubstitute: false,
          substituteType: null,
          originalRiderNumber: awayRider2Num,
          position: null,
          points: null,
          bonus: 0,
          exclusionCode: null,
          tacticalJoker: false,
        },
      ],
    };
  });

  return {
    id,
    title: title || `${homeTeamName} vs ${awayTeamName}`,
    homeTeamName,
    awayTeamName,
    track: finalTrack,
    league: finalLeague,
    referee,
    date,
    time,
    heat1gates,
    heat15gates,
    heat15GateChoice: null,
    homeRoster: home,
    awayRoster: away,
    heats,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isCompleted: false,
  };
}

export function getRiderName(roster, number) {
  if (!number) return 'Nominated';
  const rider = roster.find((r) => r.number === number);
  return rider ? rider.name : `Rider #${number}`;
}

/**
 * Optional per-heat gate overrides.
 * Edit these values to set custom gate positions for specific heats.
 * Format: { heatNumber: { home: [gateA, gateB], away: [gateC, gateD] } }
 * Gate numbers are ordered from inside to outside, so gate 1 is inside and 4 is outside.
 */
export const HEAT_GATE_A = {
  1: { home: [3, 1], away: [4, 2] },
  2: { home: [2, 4], away: [1, 3] },
  3: { home: [3, 1], away: [2, 4] },
  4: { home: [3, 1], away: [4, 2] },
  5: { home: [2, 4], away: [3, 1] },
  6: { home: [1, 3], away: [2, 4] },
  7: { home: [2, 4], away: [1, 3] },
  8: { home: [4, 2], away: [3, 1] },
  9: { home: [4, 2], away: [1, 3] },
  10: { home: [4, 2], away: [3, 1] },
  11: { home: [1, 3], away: [2, 4] },
  12: { home: [1, 3], away: [4, 2] },
  13: { home: [2, 4], away: [1, 3] },
  14: { home: [3, 1], away: [2, 4] },
};

export const HEAT_GATE_B = {
  1: { home: [4, 2], away: [3, 1] },
  2: { home: [1, 3], away: [2, 4] },
  3: { home: [4, 2], away: [1, 3] },
  4: { home: [4, 2], away: [3, 1] },
  5: { home: [1, 3], away: [4, 2] },
  6: { home: [2, 4], away: [1, 3] },
  7: { home: [1, 3], away: [2, 4] },
  8: { home: [3, 1], away: [4, 2] },
  9: { home: [3, 1], away: [2, 4] },
  10: { home: [3, 1], away: [4, 2] },
  11: { home: [2, 4], away: [1, 3] },
  12: { home: [2, 4], away: [3, 1] },
  13: { home: [1, 3], away: [2, 4] },
  14: { home: [4, 2], away: [1, 3] },
};

/**
 * Calculates gate positions (1 to 4 from inside to outside) for a heat.
 * Uses a per-heat override when provided, otherwise falls back to toss-based logic.
 */
export function getGateAssignment(heatNumber, heat1gates = 'home', heat15gates = 'home') {
  
  if (heatNumber === 15) {
    if (heat15gates === 'home') {
      return { home: [1, 3], away: [2, 4] };
    } else {
      return { home: [2, 4], away: [1, 3] };
    }
  } else {
    if (heat1gates === 'home') {
      return HEAT_GATE_A[heatNumber];
    } else {
      return HEAT_GATE_B[heatNumber];
    }
  }

}

/**
 * Calculates points and British Speedway bonus points for all 4 riders in a heat.
 */
export function calculateHeatScoring(heat) {
  const riders = heat.riders.map((r) => ({ ...r }));

  let homeTotal = 0;
  let awayTotal = 0;

  // Reset calculated points and bonus
  riders.forEach((r) => {
    r.points = 0;
    r.bonus = 0;
  });

  const finishers = riders.filter((r) => r.position !== null && !r.exclusionCode);
  const isCompleted = finishers.length > 0 || riders.some((r) => r.exclusionCode);

  // Calculate base finishing points
  finishers.forEach((rider) => {
    let pts = 0;
    if (rider.position === 1) pts = 3;
    else if (rider.position === 2) pts = 2;
    else if (rider.position === 3) pts = 1;
    else if (rider.position === 4) pts = 0;
    else if (rider.position === 1.5) pts = 2.5; // Dead heat 1st
    else if (rider.position === 2.5) pts = 1.5; // Dead heat 2nd
    else if (rider.position === 3.5) pts = 0.5; // Dead heat 3rd

    if (rider.tacticalJoker) {
      pts *= 2;
    }

    rider.points = pts;
    if (rider.team === 'home') {
      homeTotal += pts;
    } else {
      awayTotal += pts;
    }
  });

  // Calculate British League Bonus Points
  const sorted = [...finishers].sort((a, b) => (a.position || 99) - (b.position || 99));

  if (sorted.length >= 2) {
    // 1st & 2nd from same team -> 2nd gets bonus
    if (sorted[0] && sorted[1] && sorted[0].position === 1 && sorted[1].position === 2) {
      if (sorted[0].team === sorted[1].team) {
        sorted[1].bonus = 1;
      }
    }

    // 2nd & 3rd from same team -> 3rd gets bonus if beating an opponent
    if (sorted[1] && sorted[2] && sorted[1].position === 2 && sorted[2].position === 3) {
      if (sorted[1].team === sorted[2].team) {
        const opponentTeam = sorted[1].team === 'home' ? 'away' : 'home';
        const opponentPresent = riders.some((r) => r.team === opponentTeam);
        if (opponentPresent) {
          sorted[2].bonus = 1;
        }
      }
    }
  }

  const updatedRiders = riders.map((orig) => {
    const scored = sorted.find((s) => s.helmet === orig.helmet) || orig;
    return {
      ...orig,
      points: scored.points ?? (orig.exclusionCode ? 0 : null),
      bonus: scored.bonus || 0,
    };
  });

  return {
    ...heat,
    riders: updatedRiders,
    homeScore: homeTotal,
    awayScore: awayTotal,
    status: isCompleted ? 'completed' : 'pending',
  };
}

/**
 * Recalculates match aggregates, running scores, and individual rider statistics
 */
export function calculateMatchTotals(match) {
  let runningHomeScore = 0;
  let runningAwayScore = 0;

  const calculatedHeats = match.heats.map((heat) => {
    const scoredHeat = calculateHeatScoring(heat);
    runningHomeScore += scoredHeat.homeScore;
    runningAwayScore += scoredHeat.awayScore;
    return {
      ...scoredHeat,
      runningHomeScore,
      runningAwayScore,
    };
  });

  const homeStats = calculateRiderStats(match.homeRoster, calculatedHeats, 'home');
  const awayStats = calculateRiderStats(match.awayRoster, calculatedHeats, 'away');

  const allStats = [...homeStats, ...awayStats];
  const sortedMVP = [...allStats].sort((a, b) => b.totalPoints - a.totalPoints || b.paidPoints - a.paidPoints || b.firsts - a.firsts);
  const mvpRider = sortedMVP[0] || null;

  const gateStats = {
    1: { wins: 0, points: 0, rides: 0 },
    2: { wins: 0, points: 0, rides: 0 },
    3: { wins: 0, points: 0, rides: 0 },
    4: { wins: 0, points: 0, rides: 0 },
  };

  calculatedHeats.forEach((h) => {
    h.riders.forEach((r) => {
      // Only count rides that have actually been raced (a finishing position or an exclusion code)
      const hasRidden = r.position !== null || !!r.exclusionCode;
      if (hasRidden && r.gate && gateStats[r.gate]) {
        gateStats[r.gate].rides += 1;
        gateStats[r.gate].points += r.points || 0;
        if (r.position === 1) {
          gateStats[r.gate].wins += 1;
        }
      }
    });
  });

  return {
    ...match,
    heats: calculatedHeats,
    homeScore: runningHomeScore,
    awayScore: runningAwayScore,
    scoreDifference: runningHomeScore - runningAwayScore,
    homeRiderStats: homeStats,
    awayRiderStats: awayStats,
    mvpRider,
    gateStats,
    isCompleted: calculatedHeats.every((h) => h.status === 'completed'),
  };
}

/**
 * Computes individual rider statistics and heat trail (e.g. "3, 2*, 3, 1, 2 = 11+1")
 */
export function calculateRiderStats(roster, heats, teamKey) {
  return roster.map((rider) => {
    const rides = [];
    let totalPoints = 0;
    let totalBonus = 0;
    let firsts = 0;
    let seconds = 0;
    let thirds = 0;
    let unplaced = 0;
    let exclusions = 0;

    heats.forEach((heat) => {
      const entry = heat.riders.find((r) => r.team === teamKey && r.riderNumber === rider.number);
      if (entry && (entry.position !== null || entry.exclusionCode)) {
        let displayStr = '';
        if (entry.exclusionCode) {
          displayStr = entry.exclusionCode;
          exclusions += 1;
        } else {
          // Use the points already calculated for the heat so rider totals always
          // agree with team totals (e.g. doubled tactical rides, dead heats).
          const pts = entry.points || 0;
          const bonus = entry.bonus > 0 ? 1 : 0;
          totalPoints += pts;
          totalBonus += bonus;
          displayStr = `${pts}${bonus ? '*' : ''}`;

          if (entry.position === 1) firsts += 1;
          else if (entry.position === 2) seconds += 1;
          else if (entry.position === 3) thirds += 1;
          else if (entry.position === 4) unplaced += 1;
        }

        rides.push({
          heatNumber: heat.heatNumber,
          points: entry.points || 0,
          bonus: entry.bonus || 0,
          position: entry.position,
          exclusionCode: entry.exclusionCode,
          display: displayStr,
          isSubstitute: entry.isSubstitute,
        });
      }
    });

    const rideCount = rides.length;
    const paidPoints = totalPoints + totalBonus;
    const average = rideCount > 0 ? (totalPoints / rideCount).toFixed(2) : '0.00';
    const cma = rideCount > 0 ? ((paidPoints / rideCount) * 4).toFixed(2) : '0.00';

    return {
      ...rider,
      rides,
      rideCount,
      totalPoints,
      totalBonus,
      paidPoints,
      average,
      cma,
      firsts,
      seconds,
      thirds,
      unplaced,
      exclusions,
      summaryText: `${totalPoints}${totalBonus > 0 ? `+${totalBonus}` : ''} (${rideCount} rides)`,
    };
  });
}

/**
 * Quick Result Presets (One-tap finishing combos)
 */
export const QUICK_RESULT_PRESETS = [
  { id: '5-1_home', label: '5 - 1', subtitle: 'Home Win', home: [1, 2], away: [3, 4], badgeClass: 'bg-emerald-600' },
  { id: '4-2_home_1', label: '4 - 2', subtitle: 'Home 1 & 3', home: [1, 3], away: [2, 4], badgeClass: 'bg-emerald-500' },
  { id: '4-2_home_2', label: '4 - 2', subtitle: 'Home 2 & 3 (Blue 1st)', home: [3, 1], away: [2, 4], badgeClass: 'bg-emerald-500' },
  { id: '3-3_home_win', label: '3 - 3', subtitle: 'Home 1st & 4th', home: [1, 4], away: [2, 3], badgeClass: 'bg-blue-600' },
  { id: '3-3_away_win', label: '3 - 3', subtitle: 'Away 1st & 4th', home: [2, 3], away: [1, 4], badgeClass: 'bg-blue-600' },
  { id: '2-4_away_1', label: '2 - 4', subtitle: 'Away 1 & 3', home: [2, 4], away: [1, 3], badgeClass: 'bg-amber-600' },
  { id: '2-4_away_2', label: '2 - 4', subtitle: 'Away 1 & 3 (Yellow 1st)', home: [2, 4], away: [3, 1], badgeClass: 'bg-amber-600' },
  { id: '1-5_away', label: '1 - 5', subtitle: 'Away Win', home: [3, 4], away: [1, 2], badgeClass: 'bg-rose-600' },
];
