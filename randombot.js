/**
 * RockettbotOpponent
 *
 */
const { MOVE, SWITCH } = require('leftovers-again/src/decisions');

class RockettbotOpponent {

  team() {
    return `
Celesteela @ Leftovers
Ability: Beast Boost
EVs: 252 HP / 4 Def / 252 SpD
Careful Nature
-Heavy Slam
-Leech Seed
-Protect
-Flash Cannon

Toxapex @ Leftovers
Ability: Regenerator
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
-Toxic Spikes
-Recover
-Protect
-Scald

Landorus-Therian @ Rocky Helmet
Ability: Intimidate
EVs: 252 HP / 240 Def / 8 SpD / 8 Spe
Impish Nature
-Earthquake
-U-turn
-Hidden Power Fire
-Stealth Rock

Heatran @ Leftovers
Ability: Flash Fire
EVs: 252 HP / 4 SpA / 252 SpD
Calm Nature
-Lava Plume
-Toxic
-Stealth Rock
-Protect

Diancie @ Diancite
Ability: Clear Body
EVs: 4 Atk / 252 SpA / 252 Spe
Hasty Nature
-Moonblast
-Diamond Storm
-Earth Power
-Protect

Amoonguss @ Black Sludge
Ability: Regenerator
EVs: 252 HP / 160 Def / 96 SpD
Bold Nature
-Spore
-Giga Drain
-Sludge Bomb
-Hidden Power Fire`;
  }

  decide(state) { 

    if ( state.teamPreview || state.forceSwitch) {
      const myMon = this.pickOne(

        state.self.reserve.filter( mon => !mon.active && !mon.dead )
      );

      return new SWITCH(myMon);
    }

    const myMove = this.pickOne(
      state.self.active.moves.filter( move => !move.disabled )
    );
    return new MOVE(myMove);
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

module.exports = RockettbotOpponent;
