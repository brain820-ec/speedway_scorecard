import assert from 'node:assert/strict';
import * as R from '../js/models/speedway-rules.js';

let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log('✓', name); };

const setPositions = (heat, positions) => heat.riders.forEach((r, i) => {
  const p = positions[i];
  if (typeof p === 'string') { r.exclusionCode = p; r.position = null; } else { r.position = p; r.exclusionCode = null; }
});

t('fresh match: 15 heats, 0-0, no gate rides counted', () => {
  const m = R.calculateMatchTotals(R.createNewMatch());
  assert.equal(m.heats.length, 15);
  assert.equal(m.homeScore, 0); assert.equal(m.awayScore, 0);
  for (const g of [1, 2, 3, 4]) assert.equal(m.gateStats[g].rides, 0);
});

t('5-1 heat: winner 3, partner 2* bonus', () => {
  const m = R.createNewMatch();
  setPositions(m.heats[0], [1, 2, 3, 4]); // red, blue, white, yellow
  const c = R.calculateMatchTotals(m);
  const h = c.heats[0];
  assert.equal(h.homeScore, 5); assert.equal(h.awayScore, 1);
  assert.equal(h.riders[1].bonus, 1);
  assert.equal(h.riders[0].bonus, 0);
  const blue = c.homeRiderStats.find((r) => r.number === 2);
  assert.equal(blue.rides[0].display, '2*');
  assert.equal(blue.totalPoints, 2); assert.equal(blue.totalBonus, 1);
});

t('2nd & 3rd same team: 3rd gets bonus', () => {
  const m = R.createNewMatch();
  setPositions(m.heats[0], [4, 1, 2, 3]); // away 2nd & 3rd
  const h = R.calculateMatchTotals(m).heats[0];
  assert.equal(h.riders[3].bonus, 1);
  assert.equal(h.homeScore, 3); assert.equal(h.awayScore, 3);
});

t('exclusion counted as a ride with 0 pts', () => {
  const m = R.createNewMatch();
  setPositions(m.heats[0], [1, 'X', 2, 3]);
  const c = R.calculateMatchTotals(m);
  const blue = c.homeRiderStats.find((r) => r.number === 2);
  assert.equal(blue.rideCount, 1); assert.equal(blue.exclusions, 1); assert.equal(blue.rides[0].display, 'X');
  assert.equal(c.homeScore, 3); assert.equal(c.awayScore, 3);
});

t('gate stats only count raced rides', () => {
  const m = R.createNewMatch();
  setPositions(m.heats[0], [1, 2, 3, 4]);
  const c = R.calculateMatchTotals(m);
  const totalRides = [1, 2, 3, 4].reduce((a, g) => a + c.gateStats[g].rides, 0);
  assert.equal(totalRides, 4);
  const totalPts = [1, 2, 3, 4].reduce((a, g) => a + c.gateStats[g].points, 0);
  assert.equal(totalPts, 6);
});

t('rider totals agree with team totals (incl. doubled tactical ride)', () => {
  const m = R.createNewMatch();
  m.heats.forEach((h, i) => setPositions(h, i % 2 ? [1, 2, 3, 4] : [3, 4, 1, 2]));
  m.heats[5].riders[0].tacticalJoker = true;
  const c = R.calculateMatchTotals(m);
  const sum = (s) => s.reduce((a, r) => a + r.totalPoints, 0);
  assert.equal(c.homeScore + c.awayScore, 90 + 3); // 15 heats x 6, plus doubled 3pt win
  // Heat 15 riders are 'Nominated' (no rider number) so exclude that heat from the comparison
  const h15 = c.heats[14];
  assert.equal(sum(c.homeRiderStats), c.homeScore - h15.homeScore);
  assert.equal(sum(c.awayRiderStats), c.awayScore - h15.awayScore);
  assert.ok(c.isCompleted);
});

t('dead heat 1st scores 2.5', () => {
  const m = R.createNewMatch();
  setPositions(m.heats[0], [1.5, 1.5, 3, 4]);
  const c = R.calculateMatchTotals(m);
  assert.equal(c.heats[0].homeScore, 5);
  assert.equal(c.homeRiderStats.find((r) => r.number === 1).rides[0].display, '2.5');
});

t('heat 15 gates follow heat15gates toss', () => {
  assert.deepEqual(R.getGateAssignment(15, 'home', 'home'), { home: [1, 3], away: [2, 4] });
  assert.deepEqual(R.getGateAssignment(15, 'home', 'away'), { home: [2, 4], away: [1, 3] });
});

t('every heat uses 4 distinct gates', () => {
  for (const t1 of ['home', 'away']) for (let h = 1; h <= 15; h++) {
    const g = R.getGateAssignment(h, t1, t1);
    assert.deepEqual([...g.home, ...g.away].sort(), [1, 2, 3, 4], `heat ${h} (${t1})`);
  }
});

t('each rider has 4 programmed rides in heats 1-14', () => {
  for (const side of ['home', 'away']) for (let n = 1; n <= 7; n++) {
    const count = R.BRITISH_15_HEAT_MATRIX.filter((h) => h[side].includes(n)).length;
    assert.equal(count, 4, `${side} #${n}`);
  }
});

t('quick result presets add up to their labels', () => {
  const pts = { 1: 3, 2: 2, 3: 1, 4: 0 };
  for (const p of R.QUICK_RESULT_PRESETS) {
    const [h, a] = p.label.split(' - ').map(Number);
    assert.equal(pts[p.home[0]] + pts[p.home[1]], h, p.id);
    assert.equal(pts[p.away[0]] + pts[p.away[1]], a, p.id);
    assert.deepEqual([...p.home, ...p.away].sort(), [1, 2, 3, 4], p.id);
  }
});

console.log(`\nAll ${passed} checks passed`);
