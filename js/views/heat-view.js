/**
 * Speedway Scorecard - Interactive Heat Scoring View
 * Handles rapid 1-tap position entry (1, 2, 3, 4, EX), helmet display,
 * substitutions, race time, and smooth heat-to-heat navigation.
 */

import { HELMET_COLORS, EXCLUSION_CODES } from '../models/speedway-rules.js';

export class HeatView {
  constructor(app) {
    this.app = app;
    this.currentHeatNumber = 1;
    this.container = document.getElementById('view-heats');
    this.substitutionModalRider = null;
    this.exclusionModalRider = null;
  }

  setCurrentHeat(heatNum) {
    if (heatNum >= 1 && heatNum <= 15) {
      this.currentHeatNumber = heatNum;
      this.render();
      this.app.updateHeaderScoreboard();
      this.scrollPillIntoView(heatNum);
    }
  }

  scrollPillIntoView(heatNum) {
    const strip = this.container?.querySelector('.heat-strip');
    const pill = strip?.querySelector(`[data-heat="${heatNum}"]`);
    if (pill && strip) {
      pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  render() {
    if (!this.container) return;
    const match = this.app.currentMatch;
    if (!match) {
      this.container.innerHTML = `<div class="p-4 text-center text-muted">No active match found.</div>`;
      return;
    }

    const currentHeat = match.heats.find((h) => h.heatNumber === this.currentHeatNumber) || match.heats[0];
    const isFirstHeat = this.currentHeatNumber === 1;
    const isLastHeat = this.currentHeatNumber === 15;

    // Check if tactical substitute is available for trailing team, based on the
    // score going into this heat (not the overall match total)
    const prevHeat = match.heats.find((h) => h.heatNumber === this.currentHeatNumber - 1);
    const homeBefore = prevHeat?.runningHomeScore ?? 0;
    const awayBefore = prevHeat?.runningAwayScore ?? 0;
    const scoreDiff = Math.abs(homeBefore - awayBefore);
    const trailingTeam = homeBefore < awayBefore ? 'home' : (awayBefore < homeBefore ? 'away' : null);
    const isTacticalAllowed = scoreDiff >= 6 && this.currentHeatNumber >= 5 && this.currentHeatNumber <= 14;

    this.container.innerHTML = `
      <!-- Horizontal Heat Strip -->
      <div class="heat-strip">
        ${match.heats.map((h) => {
          const isActive = h.heatNumber === this.currentHeatNumber;
          const isCompleted = h.status === 'completed';
          const scoreText = isCompleted ? `${h.homeScore}-${h.awayScore}` : (h.isNominated ? 'NOM' : `Ht ${h.heatNumber}`);
          return `
            <div class="heat-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                 data-heat="${h.heatNumber}">
              <div>Ht ${h.heatNumber}</div>
              <div class="pill-score">${scoreText}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Main Interactive Heat Card -->
      <div class="heat-main-card">
        <div class="heat-header">
          <div class="heat-title-box">
            <span class="heat-title">Heat ${currentHeat.heatNumber}</span>
            ${currentHeat.isNominated ? `<span class="heat-badge">Nominated</span>` : ''}
          </div>
          <div class="heat-result-summary">
            <span class="text-blue-400">${currentHeat.homeScore}</span>
            <span class="text-muted mx-1">-</span>
            <span class="text-yellow-400">${currentHeat.awayScore}</span>
          </div>
        </div>

        <div class="text-xs text-muted mb-3 flex items-center justify-between">
          <span>${currentHeat.note || 'Standard Heat'}</span>
          <span>Running: <strong>${currentHeat.runningHomeScore ?? match.homeScore} - ${currentHeat.runningAwayScore ?? match.awayScore}</strong></span>
        </div>

        ${isTacticalAllowed && trailingTeam ? `
          <div class="bg-amber-950/40 border border-amber-500/50 rounded-lg p-2 mb-3 text-xs flex items-center justify-between text-amber-300">
            <span>⚠️ Tactical Sub available for <strong>${trailingTeam === 'home' ? match.homeTeamName : match.awayTeamName}</strong> (6+ pts down)</span>
          </div>
        ` : ''}

        <!-- 4 Gate Rider Rows -->
        <div class="gate-rows-list">
          ${currentHeat.riders.map((rider, idx) => this.renderRiderRow(rider, idx, match, currentHeat)).join('')}
        </div>

        <!-- Time & Tools Row -->
        <div class="heat-meta-tools">
          <div class="time-input-box">
            <span class="text-xs text-muted">⏱️ Time:</span>
            <input type="number" step="0.01" min="40" max="120" placeholder="60.00"
                   value="${currentHeat.timeSeconds || ''}" 
                   id="heat-time-input" 
                   data-heat="${currentHeat.heatNumber}">
            <span class="text-xs text-muted">s</span>
          </div>

          <div class="flex gap-2">
            <button class="tool-btn" id="btn-clear-heat" title="Reset Heat Results">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
              Clear
            </button>
            <button class="tool-btn" id="btn-undo-heat" ${!this.app.canUndo() ? 'disabled style="opacity:0.4"' : ''} title="Undo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h10a5 5 0 0 1 5 5v2M3 10l6-6M3 10l6 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Prev / Next Heat Controls -->
      <div class="heat-nav-footer">
        <button class="nav-heat-btn" id="btn-prev-heat" ${isFirstHeat ? 'disabled style="opacity:0.3"' : ''}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          Previous Heat
        </button>
        <button class="nav-heat-btn primary" id="btn-next-heat">
          ${isLastHeat ? 'View Scorecard' : 'Next Heat'}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <!-- Rider Substitution Modal -->
      <div class="modal-overlay" id="modal-substitute">
        <div class="bottom-sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            <h3 class="sheet-title">Rider Substitution</h3>
            <button class="close-btn" id="btn-close-sub-modal">&times;</button>
          </div>
          <div id="sub-modal-content"></div>
        </div>
      </div>

      <!-- Exclusion Code Modal -->
      <div class="modal-overlay" id="modal-exclusion">
        <div class="bottom-sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            <h3 class="sheet-title">Select Disqualification / Code</h3>
            <button class="close-btn" id="btn-close-ex-modal">&times;</button>
          </div>
          <div class="grid grid-cols-2 gap-2" id="ex-modal-content">
            ${EXCLUSION_CODES.map((ex) => `
              <button class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left p-3 rounded-lg text-sm flex flex-col justify-between"
                      data-ex-code="${ex.code}">
                <div class="font-bold text-red-400 text-base">${ex.code} - ${ex.label}</div>
                <div class="text-xs text-slate-400 mt-1">${ex.description}</div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents(currentHeat, match);
  }

  renderRiderRow(rider, idx, match, heat) {
    const isHome = rider.team === 'home';
    const helmetClass = rider.helmet; // 'red' | 'blue' | 'white' | 'yellow'
    const helmetName = rider.helmet.toUpperCase();

    // Determine current position active state
    const pos = rider.position;
    const isEx = !!rider.exclusionCode;
    const bonusStr = rider.bonus ? '<span class="text-amber-400 font-bold text-xs ml-1">+1B*</span>' : '';
    const pointsStr = rider.points !== null ? `<span class="font-black text-sm text-slate-200">(${rider.points} pts${bonusStr})</span>` : '';

    return `
      <div class="gate-rider-row" data-rider-index="${idx}" data-helmet="${rider.helmet}">
        <!-- Helmet Color & Gate Number -->
        <div class="helmet-badge ${helmetClass}" title="Gate ${rider.gate}">
          <span>G${rider.gate}</span>
          <span class="helmet-gate-label">${helmetName.slice(0, 1)}</span>
        </div>

        <!-- Rider Name & Meta -->
        <div class="rider-info">
          <div class="rider-name-row">
            <span class="rider-num-pill">${rider.riderNumber ? `#${rider.riderNumber}` : 'NOM'}</span>
            <span class="rider-name-text">${rider.riderName || 'Select Rider'}</span>
            ${rider.isSubstitute ? `<span class="rider-sub-tag">${rider.substituteType || 'SUB'}</span>` : ''}
          </div>
          <div class="rider-meta-row">
            <span>${isHome ? match.homeTeamName : match.awayTeamName}</span>
            ${pointsStr}
            <button class="text-xs text-blue-400 underline ml-auto btn-open-sub" data-rider-index="${idx}">
              ${heat.isNominated ? 'Change' : 'Sub'}
            </button>
          </div>
        </div>

        <!-- 1st, 2nd, 3rd, 4th & EX buttons -->
        <div class="position-tapper">
          <button class="pos-btn ${pos === 1 ? 'active-1' : ''}" data-pos="1" title="1st Place (3 Pts)">1</button>
          <button class="pos-btn ${pos === 2 ? 'active-2' : ''}" data-pos="2" title="2nd Place (2 Pts)">2</button>
          <button class="pos-btn ${pos === 3 ? 'active-3' : ''}" data-pos="3" title="3rd Place (1 Pt)">3</button>
          <button class="pos-btn ${pos === 4 ? 'active-4' : ''}" data-pos="4" title="4th Place (0 Pts)">4</button>
          <button class="pos-btn ${isEx ? 'active-ex' : ''}" data-pos="EX" title="Exclusion / Non-finish">
            ${isEx ? rider.exclusionCode : 'EX'}
          </button>
        </div>
      </div>
    `;
  }

  bindEvents(heat, match) {
    // Heat Strip Pill clicks
    this.container.querySelectorAll('.heat-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const heatNum = parseInt(pill.getAttribute('data-heat'), 10);
        this.app.playHapticFeedback();
        this.setCurrentHeat(heatNum);
      });
    });

    // Position Button Clicks
    this.container.querySelectorAll('.pos-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('.gate-rider-row');
        const riderIndex = parseInt(row.getAttribute('data-rider-index'), 10);
        const posVal = btn.getAttribute('data-pos');

        this.app.playHapticFeedback();

        if (posVal === 'EX') {
          // Open Exclusion Modal
          this.openExclusionModal(heat, riderIndex);
        } else {
          const position = parseInt(posVal, 10);
          this.setRiderPosition(heat.heatNumber, riderIndex, position);
        }
      });
    });

    // Open Substitution modal
    this.container.querySelectorAll('.btn-open-sub').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const riderIndex = parseInt(btn.getAttribute('data-rider-index'), 10);
        this.openSubstitutionModal(heat, riderIndex, match);
      });
    });

    // Heat Winning Time Input
    const timeInput = this.container.querySelector('#heat-time-input');
    if (timeInput) {
      timeInput.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value) || null;
        this.app.updateHeatTime(heat.heatNumber, val);
      });
    }

    // Clear Heat
    const clearBtn = this.container.querySelector('#btn-clear-heat');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.app.clearHeatScoring(heat.heatNumber);
      });
    }

    // Undo Heat
    const undoBtn = this.container.querySelector('#btn-undo-heat');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        this.app.undo();
      });
    }

    // Prev / Next Heat navigation
    const prevBtn = this.container.querySelector('#btn-prev-heat');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentHeatNumber > 1) {
          this.setCurrentHeat(this.currentHeatNumber - 1);
        }
      });
    }

    const nextBtn = this.container.querySelector('#btn-next-heat');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentHeatNumber < 15) {
          this.setCurrentHeat(this.currentHeatNumber + 1);
        } else {
          // Switch to Scorecard Tab
          this.app.setActiveTab('scorecard');
        }
      });
    }

    // Modal Close buttons
    const closeSubBtn = this.container.querySelector('#btn-close-sub-modal');
    if (closeSubBtn) {
      closeSubBtn.addEventListener('click', () => this.closeSubstitutionModal());
    }

    const closeExBtn = this.container.querySelector('#btn-close-ex-modal');
    if (closeExBtn) {
      closeExBtn.addEventListener('click', () => this.closeExclusionModal());
    }
  }

  setRiderPosition(heatNumber, riderIndex, position) {
    const match = this.app.currentMatch;
    const heat = match.heats.find((h) => h.heatNumber === heatNumber);
    if (!heat) return;

    const targetRider = heat.riders[riderIndex];
    if (!targetRider) return;

    // If already has this position, toggle it off
    if (targetRider.position === position && !targetRider.exclusionCode) {
      targetRider.position = null;
    } else {
      // Clear position from any other rider who had this position in this heat
      heat.riders.forEach((r, idx) => {
        if (idx !== riderIndex && r.position === position) {
          r.position = null;
        }
      });
      targetRider.position = position;
      targetRider.exclusionCode = null;
    }

    this.app.updateHeat(heat);
    this.render();

    // Auto-advance to next heat if all 4 finishing positions or exclusions are set
    if (this.app.settings.autoAdvanceHeat) {
      const allFilled = heat.riders.every((r) => r.position !== null || r.exclusionCode);
      if (allFilled && this.currentHeatNumber < 15) {
        setTimeout(() => {
          this.setCurrentHeat(this.currentHeatNumber + 1);
        }, 400);
      }
    }
  }

  openExclusionModal(heat, riderIndex) {
    const modal = this.container.querySelector('#modal-exclusion');
    if (!modal) return;

    const rider = heat.riders[riderIndex];
    modal.classList.add('active');

    // Bind exclusion buttons
    modal.querySelectorAll('[data-ex-code]').forEach((btn) => {
      btn.onclick = () => {
        const code = btn.getAttribute('data-ex-code');
        this.app.playHapticFeedback();
        rider.exclusionCode = code;
        rider.position = null;
        this.app.updateHeat(heat);
        this.closeExclusionModal();
        this.render();
      };
    });
  }

  closeExclusionModal() {
    const modal = this.container.querySelector('#modal-exclusion');
    if (modal) modal.classList.remove('active');
  }

  openSubstitutionModal(heat, riderIndex, match) {
    const modal = this.container.querySelector('#modal-substitute');
    const content = this.container.querySelector('#sub-modal-content');
    if (!modal || !content) return;

    const currentRiderEntry = heat.riders[riderIndex];
    const isHome = currentRiderEntry.team === 'home';
    const roster = isHome ? match.homeRoster : match.awayRoster;

    content.innerHTML = `
      <div class="mb-4">
        <div class="text-xs text-muted mb-2 uppercase font-bold">Current Gate Entry</div>
        <div class="bg-slate-800 p-3 rounded-lg flex items-center justify-between">
          <div class="font-bold">${currentRiderEntry.riderName || 'Nominated'} (Gate ${currentRiderEntry.gate})</div>
          <div class="text-xs text-slate-400">${isHome ? match.homeTeamName : match.awayTeamName}</div>
        </div>
      </div>

      <div class="text-xs text-muted mb-2 uppercase font-bold">Select Replacement / Nominated Rider</div>
      <div class="space-y-2 mb-4">
        ${roster.map((r) => `
          <button class="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-lg flex items-center justify-between text-left btn-select-roster-sub"
                  data-num="${r.number}">
            <div class="flex items-center gap-3">
              <span class="font-black text-amber-400 w-6">#${r.number}</span>
              <div>
                <div class="font-bold text-slate-100 flex items-center gap-1.5">
                  ${r.name}
                  ${r.isRisingStar ? `<span class="text-[0.6rem] bg-amber-950 text-amber-300 px-1 rounded font-bold">RS</span>` : ''}
                </div>
                <div class="text-xs text-slate-400">${r.isReserve ? 'Reserve' : 'Main Body'} | CMA: ${r.cma}</div>
              </div>
            </div>
            <span class="text-xs text-blue-400 font-bold">Select &rarr;</span>
          </button>
        `).join('')}
      </div>

      <div class="text-xs text-muted mb-2 uppercase font-bold">Substitution Type</div>
      <div class="grid grid-cols-3 gap-2 mb-4">
        <button class="bg-slate-800 border border-slate-700 p-2 rounded text-xs font-bold text-center btn-sub-type active" data-type="tactical">Tactical Sub (TS)</button>
        <button class="bg-slate-800 border border-slate-700 p-2 rounded text-xs font-bold text-center btn-sub-type" data-type="reserve">Reserve (TR)</button>
        <button class="bg-slate-800 border border-slate-700 p-2 rounded text-xs font-bold text-center btn-sub-type" data-type="rr">Rider Repl. (R/R)</button>
      </div>

      ${currentRiderEntry.isSubstitute ? `
        <button class="w-full bg-red-950 border border-red-700 text-red-300 p-3 rounded-lg font-bold text-sm" id="btn-revert-sub">
          Revert to Original Rider (#${currentRiderEntry.originalRiderNumber})
        </button>
      ` : ''}
    `;

    modal.classList.add('active');

    let selectedSubType = 'tactical';
    content.querySelectorAll('.btn-sub-type').forEach((btn) => {
      btn.onclick = () => {
        content.querySelectorAll('.btn-sub-type').forEach((b) => b.classList.remove('bg-amber-600', 'text-black'));
        btn.classList.add('bg-amber-600', 'text-black');
        selectedSubType = btn.getAttribute('data-type');
      };
    });

    content.querySelectorAll('.btn-select-roster-sub').forEach((btn) => {
      btn.onclick = () => {
        const num = parseInt(btn.getAttribute('data-num'), 10);
        const selected = roster.find((r) => r.number === num);
        if (selected) {
          this.app.playHapticFeedback();
          currentRiderEntry.riderNumber = selected.number;
          currentRiderEntry.riderName = selected.name;
          currentRiderEntry.isSubstitute = !heat.isNominated;
          currentRiderEntry.substituteType = heat.isNominated ? null : selectedSubType.toUpperCase();
          this.app.updateHeat(heat);
          this.closeSubstitutionModal();
          this.render();
        }
      };
    });

    const revertBtn = content.querySelector('#btn-revert-sub');
    if (revertBtn) {
      revertBtn.onclick = () => {
        const orig = roster.find((r) => r.number === currentRiderEntry.originalRiderNumber);
        if (orig) {
          currentRiderEntry.riderNumber = orig.number;
          currentRiderEntry.riderName = orig.name;
          currentRiderEntry.isSubstitute = false;
          currentRiderEntry.substituteType = null;
          this.app.updateHeat(heat);
          this.closeSubstitutionModal();
          this.render();
        }
      };
    }
  }

  closeSubstitutionModal() {
    const modal = this.container.querySelector('#modal-substitute');
    if (modal) modal.classList.remove('active');
  }
}
