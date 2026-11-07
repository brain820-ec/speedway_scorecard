/**
 * Speedway Scorecard - Main Application Controller
 * Coordinates views, state calculations, persistence, UI navigation, and PWA features.
 */

import { createNewMatch, calculateMatchTotals, getGateAssignment, getTeamPreset, getRosterForTeam } from './models/speedway-rules.js';
import { storageService } from './services/storage.js';
import { ExporterService } from './services/exporter.js';
import { HeatView } from './views/heat-view.js';
import { ScorecardView } from './views/scorecard-view.js';
import { RidersView } from './views/riders-view.js';
import { StatsView } from './views/stats-view.js';
import { MatchSetupView } from './views/match-setup-view.js';

export class App {
  constructor() {
    this.currentMatch = null;
    this.activeTab = 'heats'; // 'heats' | 'scorecard' | 'riders' | 'stats' | 'setup'
    this.settings = storageService.getSettings();

    // View instances
    this.heatView = new HeatView(this);
    this.scorecardView = new ScorecardView(this);
    this.ridersView = new RidersView(this);
    this.statsView = new StatsView(this);
    this.matchSetupView = new MatchSetupView(this);

    this.init();
  }

  init() {
    // Apply theme
    this.setTheme(this.settings.theme || 'dark');

    // Load or create match
    const saved = storageService.getCurrentMatch();
    if (saved) {
      this.currentMatch = calculateMatchTotals(saved);
    } else {
      const initial = createNewMatch({
        homeTeamName: 'Belle Vue Aces',
        awayTeamName: 'Sheffield Tigers',
        track: 'National Speedway Stadium',
        league: 'SGB Premiership',
      });
      this.currentMatch = calculateMatchTotals(initial);
      storageService.saveCurrentMatch(this.currentMatch, false);
    }

    this.bindGlobalEvents();
    this.updateHeaderScoreboard();
    this.setActiveTab('heats');
    this.registerServiceWorker();
  }

  setMatch(match) {
    this.currentMatch = calculateMatchTotals(match);
    storageService.saveCurrentMatch(this.currentMatch, true);
    this.updateHeaderScoreboard();
    this.renderCurrentView();
  }

  updateHeat(heat) {
    const idx = this.currentMatch.heats.findIndex((h) => h.heatNumber === heat.heatNumber);
    if (idx >= 0) {
      this.currentMatch.heats[idx] = heat;
      this.currentMatch = calculateMatchTotals(this.currentMatch);
      storageService.saveCurrentMatch(this.currentMatch, true);
      this.updateHeaderScoreboard();
    }
  }

  clearHeatScoring(heatNumber) {
    const heat = this.currentMatch.heats.find((h) => h.heatNumber === heatNumber);
    if (heat) {
      heat.riders.forEach((r) => {
        r.position = null;
        r.exclusionCode = null;
        r.points = null;
        r.bonus = 0;
      });
      heat.timeSeconds = null;
      heat.status = 'pending';
      this.updateHeat(heat);
      this.heatView.render();
      this.showToast(`Heat ${heatNumber} cleared`);
    }
  }

  updateHeatTime(heatNumber, timeSeconds) {
    const heat = this.currentMatch.heats.find((h) => h.heatNumber === heatNumber);
    if (heat) {
      heat.timeSeconds = timeSeconds;
      this.updateHeat(heat);
    }
  }

  /**
   * Updates a team name and automatically loads its official 7-rider roster
   * and updates all heats across the match.
   */
  setTeam(teamKey, teamName, autoLoadRoster = true) {
    if (!this.currentMatch || !teamName) return;

    const isHome = teamKey === 'home';
    const preset = getTeamPreset(teamName);

    if (isHome) {
      this.currentMatch.homeTeamName = teamName;
      if (preset) {
        if (preset.track) this.currentMatch.track = preset.track;
        if (preset.league) this.currentMatch.league = preset.league;
      }
      if (autoLoadRoster) {
        const newRoster = getRosterForTeam(teamName, true);
        this.currentMatch.homeRoster = newRoster;
        // Update rider names in all heats for Home riders
        this.currentMatch.heats.forEach((h) => {
          h.riders.forEach((r) => {
            if (r.team === 'home') {
              const riderObj = newRoster.find((m) => m.number === r.riderNumber);
              if (riderObj) {
                r.riderName = riderObj.name;
              }
            }
          });
        });
      }
    } else {
      this.currentMatch.awayTeamName = teamName;
      if (autoLoadRoster) {
        const newRoster = getRosterForTeam(teamName, false);
        this.currentMatch.awayRoster = newRoster;
        // Update rider names in all heats for Away riders
        this.currentMatch.heats.forEach((h) => {
          h.riders.forEach((r) => {
            if (r.team === 'away') {
              const riderObj = newRoster.find((m) => m.number === r.riderNumber);
              if (riderObj) {
                r.riderName = riderObj.name;
              }
            }
          });
        });
      }
    }

    this.currentMatch = calculateMatchTotals(this.currentMatch);
    storageService.saveCurrentMatch(this.currentMatch, true);
    this.updateHeaderScoreboard();
    this.renderCurrentView();
    this.showToast(`Updated ${isHome ? 'Home' : 'Away'} team to ${teamName} 🏁`);
  }

  updateMatchMetadata(meta, autoLoadRosterIfTeamChanged = true) {
    const previousHome = this.currentMatch.homeTeamName;
    const previousAway = this.currentMatch.awayTeamName;
    const previousHeat1Gates = this.currentMatch.heat1gates;
    const previousHeat15Gates = this.currentMatch.heat15gates;

    this.currentMatch = {
      ...this.currentMatch,
      ...meta,
    };

    // Auto-update rosters if team names changed
    if (autoLoadRosterIfTeamChanged) {
      if (meta.homeTeamName && meta.homeTeamName !== previousHome) {
        const newHomeRoster = getRosterForTeam(meta.homeTeamName, true);
        this.currentMatch.homeRoster = newHomeRoster;
        this.currentMatch.heats.forEach((h) => {
          h.riders.forEach((r) => {
            if (r.team === 'home') {
              const found = newHomeRoster.find((m) => m.number === r.riderNumber);
              if (found) r.riderName = found.name;
            }
          });
        });
      }

      if (meta.awayTeamName && meta.awayTeamName !== previousAway) {
        const newAwayRoster = getRosterForTeam(meta.awayTeamName, false);
        this.currentMatch.awayRoster = newAwayRoster;
        this.currentMatch.heats.forEach((h) => {
          h.riders.forEach((r) => {
            if (r.team === 'away') {
              const found = newAwayRoster.find((m) => m.number === r.riderNumber);
              if (found) r.riderName = found.name;
            }
          });
        });
      }
    }

    // If either gate toss changed, recalculate gate allocations (heats 1-14 use
    // heat1gates, the nominated heat 15 uses heat15gates)
    const heat1Changed = meta.heat1gates && meta.heat1gates !== previousHeat1Gates;
    const heat15Changed = meta.heat15gates && meta.heat15gates !== previousHeat15Gates;
    if (heat1Changed || heat15Changed) {
      this.currentMatch.heats.forEach((h) => {
        if (h.isNominated ? !heat15Changed : !heat1Changed) return;
        const gates = getGateAssignment(h.heatNumber, this.currentMatch.heat1gates, this.currentMatch.heat15gates);
        h.riders.forEach((r) => {
          if (r.team === 'home') {
            r.gate = r.helmet === 'red' ? gates.home[0] : gates.home[1];
          } else {
            r.gate = r.helmet === 'white' ? gates.away[0] : gates.away[1];
          }
        });
      });
    }

    this.currentMatch = calculateMatchTotals(this.currentMatch);
    storageService.saveCurrentMatch(this.currentMatch, true);
    this.updateHeaderScoreboard();
    this.renderCurrentView();
  }

  updateRosters(homeRoster, awayRoster) {
    this.currentMatch.homeRoster = homeRoster;
    this.currentMatch.awayRoster = awayRoster;

    // Update rider names in all heats
    this.currentMatch.heats.forEach((h) => {
      h.riders.forEach((r) => {
        const roster = r.team === 'home' ? homeRoster : awayRoster;
        const found = roster.find((m) => m.number === r.riderNumber);
        if (found) {
          r.riderName = found.name;
        }
      });
    });

    this.currentMatch = calculateMatchTotals(this.currentMatch);
    storageService.saveCurrentMatch(this.currentMatch, true);
    this.renderCurrentView();
  }

  resetCurrentMatch() {
    const fresh = createNewMatch({
      homeTeamName: this.currentMatch?.homeTeamName || 'Belle Vue Aces',
      awayTeamName: this.currentMatch?.awayTeamName || 'Sheffield Tigers',
      track: this.currentMatch?.track || 'National Speedway Stadium',
      league: this.currentMatch?.league || 'SGB Premiership',
      heat1gates: this.currentMatch?.heat1gates || 'home',
      heat15gates: this.currentMatch?.heat15gates || 'home',
      homeRoster: this.currentMatch?.homeRoster || null,
      awayRoster: this.currentMatch?.awayRoster || null,
    });

    this.currentMatch = calculateMatchTotals(fresh);
    storageService.saveCurrentMatch(this.currentMatch, false);
    this.updateHeaderScoreboard();
    this.renderCurrentView();
    this.showToast('Fresh heat schedule loaded 🏁');
  }

  loadMatch(id) {
    const loaded = storageService.loadMatchById(id);
    if (loaded) {
      this.currentMatch = calculateMatchTotals(loaded);
      this.updateHeaderScoreboard();
      this.renderCurrentView();
    }
  }

  undo() {
    const previous = storageService.undo(this.currentMatch);
    if (previous) {
      this.currentMatch = calculateMatchTotals(previous);
      this.updateHeaderScoreboard();
      this.renderCurrentView();
      this.showToast('Undone ↩️');
    }
  }

  redo() {
    const next = storageService.redo(this.currentMatch);
    if (next) {
      this.currentMatch = calculateMatchTotals(next);
      this.updateHeaderScoreboard();
      this.renderCurrentView();
      this.showToast('Redone ↪️');
    }
  }

  canUndo() {
    return storageService.canUndo();
  }

  canRedo() {
    return storageService.canRedo();
  }

  setActiveTab(tabName) {
    this.activeTab = tabName;

    // Update tab bar buttons
    document.querySelectorAll('.tab-item').forEach((tab) => {
      const tabTarget = tab.getAttribute('data-tab');
      if (tabTarget === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Hide all views and show active
    document.querySelectorAll('.view-page').forEach((view) => {
      view.classList.remove('active');
    });

    const activeView = document.getElementById(`view-${tabName}`);
    if (activeView) {
      activeView.classList.add('active');
    }

    this.renderCurrentView();
  }

  renderCurrentView() {
    switch (this.activeTab) {
      case 'heats':
        this.heatView.render();
        break;
      case 'scorecard':
        this.scorecardView.render();
        break;
      case 'riders':
        this.ridersView.render();
        break;
      case 'stats':
        this.statsView.render();
        break;
      case 'setup':
        this.matchSetupView.render();
        break;
    }
  }

  updateHeaderScoreboard() {
    const match = this.currentMatch;
    if (!match) return;

    const homeNameEl = document.getElementById('header-home-name');
    const awayNameEl = document.getElementById('header-away-name');
    const homeScoreEl = document.getElementById('header-home-score');
    const awayScoreEl = document.getElementById('header-away-score');
    const matchLeagueEl = document.getElementById('header-match-league');
    const heatBadgeEl = document.getElementById('header-heat-badge');

    if (homeNameEl) homeNameEl.textContent = match.homeTeamName;
    if (awayNameEl) awayNameEl.textContent = match.awayTeamName;
    if (homeScoreEl) homeScoreEl.textContent = match.homeScore;
    if (awayScoreEl) awayScoreEl.textContent = match.awayScore;
    if (matchLeagueEl) matchLeagueEl.textContent = `${match.league || 'British Speedway'} · ${match.track || ''}`;
    if (heatBadgeEl) heatBadgeEl.textContent = `Heat ${this.heatView.currentHeatNumber} / 15`;
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.settings.theme = theme;
    storageService.saveSettings(this.settings);
  }

  updateSetting(key, value) {
    this.settings[key] = value;
    storageService.saveSettings(this.settings);
  }

  playHapticFeedback() {
    if (this.settings.hapticsEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (e) {
        // Ignored if not supported
      }
    }
  }

  showToast(message, durationMs = 2500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, durationMs);
  }

  async shareMatch() {
    return await ExporterService.shareScorecard(this.currentMatch);
  }

  exportCSV() {
    const csv = ExporterService.generateCSV(this.currentMatch);
    const fileName = `${this.currentMatch.homeTeamName}_vs_${this.currentMatch.awayTeamName}_Scorecard.csv`.replace(/\s+/g, '_');
    ExporterService.downloadFile(csv, fileName, 'text/csv');
    this.showToast('CSV downloaded! 📊');
  }

  exportJSON() {
    const json = storageService.exportMatchJSON(this.currentMatch);
    const fileName = `Speedway_${this.currentMatch.homeTeamName}_vs_${this.currentMatch.awayTeamName}.json`.replace(/\s+/g, '_');
    ExporterService.downloadFile(json, fileName, 'application/json');
    this.showToast('JSON backup saved! 💾');
  }

  bindGlobalEvents() {
    // Tab bar clicks
    document.querySelectorAll('.tab-item').forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        this.playHapticFeedback();
        this.setActiveTab(tabName);
      });
    });

    // Touch swipe handling for heat navigation on iPhone
    let touchStartX = 0;
    let touchStartY = 0;

    const viewContainer = document.getElementById('main-scroller');
    if (viewContainer) {
      viewContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      viewContainer.addEventListener('touchend', (e) => {
        if (this.activeTab !== 'heats') return;

        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Ensure horizontal swipe is dominant and above threshold (60px)
        if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
          if (diffX < 0 && this.heatView.currentHeatNumber < 15) {
            // Swipe Left -> Next Heat
            this.playHapticFeedback();
            this.heatView.setCurrentHeat(this.heatView.currentHeatNumber + 1);
          } else if (diffX > 0 && this.heatView.currentHeatNumber > 1) {
            // Swipe Right -> Prev Heat
            this.playHapticFeedback();
            this.heatView.setCurrentHeat(this.heatView.currentHeatNumber - 1);
          }
        }
      }, { passive: true });
    }

    // Keyboard navigation (desktop / bluetooth iPad keyboard support)
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowRight' && this.activeTab === 'heats' && this.heatView.currentHeatNumber < 15) {
        this.heatView.setCurrentHeat(this.heatView.currentHeatNumber + 1);
      } else if (e.key === 'ArrowLeft' && this.activeTab === 'heats' && this.heatView.currentHeatNumber > 1) {
        this.heatView.setCurrentHeat(this.heatView.currentHeatNumber - 1);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      }
    });
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('Speedway PWA ServiceWorker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('ServiceWorker registration error:', err);
          });
      });
    }
  }
}

// Instantiate app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.speedwayApp = new App();
});

