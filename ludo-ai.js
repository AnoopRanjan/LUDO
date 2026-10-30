/**
 * Ludo Master - Artificial Intelligence Engine
 * 4 Distinct Difficulty Levels:
 * 1. Beginner: Random & playful, learning-oriented, suitable for kids.
 * 2. Intermediate: Prioritizes captures, basic safety and yard exits.
 * 3. Pro: Tactical evaluation, danger avoidance, safe square control.
 * 4. Expert: Advanced threat prediction, ambush positioning, endgame optimization.
 */

class LudoAI {
  /**
   * Main entry point to choose a move for the current player
   * @param {Object} player - current AI player object
   * @param {Array} legalMoves - array of move objects
   * @param {Array} allPlayers - all active players in the match
   * @param {Object} boardRules - helper methods and safe indices
   * @returns {Object} selected move
   */
  static chooseMove(player, legalMoves, allPlayers, boardRules) {
    if (!legalMoves || legalMoves.length === 0) return null;
    if (legalMoves.length === 1) return legalMoves[0];

    const difficulty = (player.difficulty || "intermediate").toLowerCase();

    switch (difficulty) {
      case "beginner":
        return this.chooseBeginnerMove(player, legalMoves);
      case "intermediate":
        return this.chooseIntermediateMove(player, legalMoves, allPlayers, boardRules);
      case "pro":
        return this.chooseProMove(player, legalMoves, allPlayers, boardRules);
      case "expert":
        return this.chooseExpertMove(player, legalMoves, allPlayers, boardRules);
      default:
        return this.chooseIntermediateMove(player, legalMoves, allPlayers, boardRules);
    }
  }

  // LEVEL 1: BEGINNER
  // Plays casually with a bias towards exiting the yard on a 6, but otherwise random
  static chooseBeginnerMove(player, legalMoves) {
    const exitMove = legalMoves.find(m => m.isExitingYard);
    if (exitMove && Math.random() < 0.75) {
      return exitMove;
    }

    const homeMove = legalMoves.find(m => m.isReachingHome);
    if (homeMove && Math.random() < 0.6) {
      return homeMove;
    }

    // Otherwise random move
    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    return legalMoves[randomIndex];
  }

  // LEVEL 2: INTERMEDIATE
  // Prioritizes capturing opponents, getting out of yard, and basic danger avoidance
  static chooseIntermediateMove(player, legalMoves, allPlayers, boardRules) {
    const scoredMoves = legalMoves.map(move => {
      let score = 0;

      // 1. Capture opponent piece: strong priority
      if (move.captures && move.captures.length > 0) {
        score += 80 * move.captures.length;
      }

      // 2. Reach home: high priority
      if (move.isReachingHome) {
        score += 70;
      }

      // 3. Exit base on rolling a 6
      if (move.isExitingYard) {
        score += 60;
      }

      // 4. Enter home stretch
      if (move.isEnteringHomeStretch) {
        score += 35;
      }

      // 5. Land on a safe square
      if (move.isSafeTarget) {
        score += 25;
      }

      // 6. Escape from danger (if currently on an unsafe square with opponent 1-6 steps behind)
      if (move.dangerBefore && !move.dangerAfter) {
        score += 30;
      }

      // 7. Avoid stepping directly into danger
      if (move.dangerAfter && !move.isSafeTarget) {
        score -= 40;
      }

      // 8. General progress forward
      score += (move.targetStep || 0) * 0.5;

      // Slight natural variance (+/- 5%)
      score += (Math.random() - 0.5) * 8;

      return { move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move;
  }

  // LEVEL 3: PRO
  // Advanced strategy: evaluates safe positions, protects leading tokens, calculates opponent ranges
  static chooseProMove(player, legalMoves, allPlayers, boardRules) {
    const scoredMoves = legalMoves.map(move => {
      let score = 0;

      // 1. Capturing an opponent: top tactical value
      if (move.captures && move.captures.length > 0) {
        score += 140 * move.captures.length;
        // Bonus for capturing advanced opponent tokens
        move.captures.forEach(cap => {
          score += (cap.step || 0) * 1.5;
        });
      }

      // 2. Reaching Home: guaranteed win progress
      if (move.isReachingHome) {
        score += 120;
      }

      // 3. Advancing inside home stretch (completely safe zone)
      if (move.isInHomeStretch) {
        score += 50;
      }

      // 4. Entering home stretch
      if (move.isEnteringHomeStretch) {
        score += 65;
      }

      // 5. Bringing tokens out of yard
      if (move.isExitingYard) {
        // Higher value if AI has few tokens active
        const activeTokens = player.tokens.filter(t => t.state === "track" || t.state === "home_stretch").length;
        score += (activeTokens < 2) ? 90 : 65;
      }

      // 6. Evading imminent capture
      if (move.dangerBefore && !move.dangerAfter) {
        // The more advanced the token is, the more critical to save it
        score += 70 + (move.currentStep || 0) * 1.2;
      }

      // 7. Landing on Safe Star or Start Square
      if (move.isSafeTarget) {
        score += 55;
        // Extra valuable if opponents are following closely behind
        if (move.opponentsBehind && move.opponentsBehind.length > 0) {
          score += 40;
        }
      }

      // 8. Heavy penalty for walking into danger
      if (move.dangerAfter && !move.isSafeTarget) {
        score -= 85;
      }

      // 9. Token distribution: avoid leaving a lone token far behind
      if (move.currentStep === 0 && !move.dangerAfter) {
        score += 20; // Move starting token forward
      }

      // Small jitter for variability
      score += (Math.random() - 0.5) * 4;

      return { move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move;
  }

  // LEVEL 4: EXPERT
  // Master-level tactical AI: multi-threat calculation, ambush positioning, endgame optimization
  static chooseExpertMove(player, legalMoves, allPlayers, boardRules) {
    const scoredMoves = legalMoves.map(move => {
      let score = 0;

      // 1. Capturing an opponent: highest offensive score
      if (move.captures && move.captures.length > 0) {
        score += 200 * move.captures.length;
        move.captures.forEach(cap => {
          // Capturing an opponent near their home entrance is devastating to them!
          const stepsRemaining = 56 - (cap.step || 0);
          score += Math.max(0, 100 - stepsRemaining * 2);
        });
      }

      // 2. Reaching Home: immediate victory progress
      if (move.isReachingHome) {
        score += 160;
        // If this token wins the game, maximum priority!
        const finishedCount = player.tokens.filter(t => t.state === "home").length;
        if (finishedCount === 3) {
          score += 1000; // Game-winning move!
        }
      }

      // 3. Entering home stretch: safe from all opponent captures forever
      if (move.isEnteringHomeStretch) {
        score += 85;
      }

      // 4. Moving inside home stretch
      if (move.isInHomeStretch && !move.isReachingHome) {
        score += 40 + (move.targetStep - 50) * 5;
      }

      // 5. Exiting yard on 6
      if (move.isExitingYard) {
        const activeTokens = player.tokens.filter(t => t.state === "track" || t.state === "home_stretch").length;
        if (activeTokens === 0) {
          score += 180; // Must get token on board
        } else if (activeTokens === 1) {
          score += 95;
        } else {
          score += 65;
        }
      }

      // 6. Safe square mastery
      if (move.isSafeTarget) {
        score += 60;
        if (move.opponentsBehind && move.opponentsBehind.length > 0) {
          score += 50 * move.opponentsBehind.length; // Safe fortress!
        }
      }

      // 7. Tactical Ambush Positioning:
      // If target lands 1 to 5 steps BEHIND an opponent on an unsafe square,
      // the AI can capture that opponent on a subsequent turn!
      if (move.ambushOpportunities && move.ambushOpportunities > 0) {
        score += 45 * move.ambushOpportunities;
      }

      // 8. Precise Danger Calculation
      if (move.dangerAfter && !move.isSafeTarget) {
        // High penalty scaled by the token's current investment
        const tokenValue = (move.currentStep || 0) * 2;
        score -= (100 + tokenValue);
      }

      // 9. Saving an advanced token in extreme danger
      if (move.dangerBefore && !move.dangerAfter) {
        const tokenValue = (move.currentStep || 0) * 2.5;
        score += (95 + tokenValue);
      }

      // 10. Star camping: position on star near opponent start to block or capture exits
      if (move.isStarSquare) {
        score += 30;
      }

      // Deterministic: zero random jitter for master precision
      return { move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move;
  }

  /**
   * Helper to analyze move context (captures, danger, safe squares)
   * used by both the AI and the Move Suggestion feature for human players!
   */
  static analyzeMove(move, player, allPlayers, boardData) {
    const { startIndex, safeIndices, getOuterTileIndex } = boardData;
    const { token, currentStep, targetStep } = move;

    // Is exiting yard
    move.isExitingYard = (currentStep === -1 && targetStep === 0);

    // Is reaching home
    move.isReachingHome = (targetStep === 56);

    // Is entering home stretch
    move.isEnteringHomeStretch = (currentStep <= 50 && targetStep > 50 && targetStep < 56);

    // Is currently in home stretch
    move.isInHomeStretch = (targetStep > 50 && targetStep < 56);

    // Outer track indices
    let currentOuterIdx = null;
    let targetOuterIdx = null;

    if (currentStep >= 0 && currentStep <= 50) {
      currentOuterIdx = (player.startIndex + currentStep) % 52;
    }
    if (targetStep >= 0 && targetStep <= 50) {
      targetOuterIdx = (player.startIndex + targetStep) % 52;
    }

    move.currentOuterIndex = currentOuterIdx;
    move.targetOuterIndex = targetOuterIdx;

    // Safe squares check
    move.isSafeTarget = (targetStep > 50) || (targetOuterIdx !== null && safeIndices.includes(targetOuterIdx));
    move.isSafeCurrent = (currentStep > 50) || (currentOuterIdx !== null && safeIndices.includes(currentOuterIdx));
    move.isStarSquare = (targetOuterIdx !== null && [8, 21, 34, 47].includes(targetOuterIdx));

    // Captures detection
    move.captures = [];
    if (targetOuterIdx !== null && !move.isSafeTarget) {
      allPlayers.forEach(otherPlayer => {
        if (otherPlayer.id !== player.id) {
          otherPlayer.tokens.forEach(otherToken => {
            if (otherToken.state === "track") {
              const otherOuterIdx = (otherPlayer.startIndex + otherToken.step) % 52;
              if (otherOuterIdx === targetOuterIdx) {
                move.captures.push({
                  playerId: otherPlayer.id,
                  tokenId: otherToken.id,
                  step: otherToken.step
                });
              }
            }
          });
        }
      });
    }

    // Danger calculation: opponent within 1-6 steps behind
    move.dangerBefore = false;
    move.dangerAfter = false;
    move.opponentsBehind = [];
    move.ambushOpportunities = 0;

    // Threat to current position
    if (currentOuterIdx !== null && !move.isSafeCurrent) {
      allPlayers.forEach(otherPlayer => {
        if (otherPlayer.id !== player.id) {
          otherPlayer.tokens.forEach(otherToken => {
            if (otherToken.state === "track") {
              const otherOuter = (otherPlayer.startIndex + otherToken.step) % 52;
              const distance = (currentOuterIdx - otherOuter + 52) % 52;
              if (distance >= 1 && distance <= 6) {
                move.dangerBefore = true;
              }
            }
          });
        }
      });
    }

    // Threat to target position
    if (targetOuterIdx !== null && !move.isSafeTarget) {
      allPlayers.forEach(otherPlayer => {
        if (otherPlayer.id !== player.id) {
          otherPlayer.tokens.forEach(otherToken => {
            if (otherToken.state === "track") {
              const otherOuter = (otherPlayer.startIndex + otherToken.step) % 52;
              const distance = (targetOuterIdx - otherOuter + 52) % 52;
              if (distance >= 1 && distance <= 6) {
                move.dangerAfter = true;
                move.opponentsBehind.push({
                  playerId: otherPlayer.id,
                  distance: distance
                });
              }
              // Ambush detection: if our target is 1-5 steps BEHIND an opponent
              const aheadDist = (otherOuter - targetOuterIdx + 52) % 52;
              if (aheadDist >= 1 && aheadDist <= 5) {
                move.ambushOpportunities++;
              }
            }
          });
        }
      });
    }

    return move;
  }

  /**
   * Move suggestion generator for Beginner Mode & Move Hints
   */
  static getMoveHint(legalMoves, player) {
    if (!legalMoves || legalMoves.length === 0) return null;

    // Check for capture
    const captureMove = legalMoves.find(m => m.captures && m.captures.length > 0);
    if (captureMove) {
      return {
        move: captureMove,
        text: `⚔️ Capture opponent token! Free bonus turn!`
      };
    }

    // Check for reaching home
    const homeMove = legalMoves.find(m => m.isReachingHome);
    if (homeMove) {
      return {
        move: homeMove,
        text: `🏆 Move token into Home! Bonus roll awarded!`
      };
    }

    // Check for base exit
    const exitMove = legalMoves.find(m => m.isExitingYard);
    if (exitMove) {
      return {
        move: exitMove,
        text: `🚪 Deploy a fresh token out of your yard!`
      };
    }

    // Check for safe star
    const safeMove = legalMoves.find(m => m.isSafeTarget && !m.isSafeCurrent);
    if (safeMove) {
      return {
        move: safeMove,
        text: `⭐ Land on a Safe Star square for protection!`
      };
    }

    // Escape danger
    const escapeMove = legalMoves.find(m => m.dangerBefore && !m.dangerAfter);
    if (escapeMove) {
      return {
        move: escapeMove,
        text: `🛡️ Escape danger! Opponent is close behind!`
      };
    }

    // Advance furthest
    const advanceMove = [...legalMoves].sort((a, b) => b.targetStep - a.targetStep)[0];
    return {
      move: advanceMove,
      text: `🚀 Advance your lead token towards the Home Stretch!`
    };
  }
}

window.LudoAI = LudoAI;
