const { MOVE, SWITCH } = require('@la/decisions');
const Damage = require('@la/game/damage');


class damageBot {
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
    if (state.forceSwitch) {
      const possibleMons = state.self.reserve.filter((mon) => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      return new SWITCH(myMon);
    }

    if (state.teamPreview) {
      return new SWITCH(0);
    }

    return this.doTheMostDamage(state)
	}
	doTheMostDamage(state) {
		let maxDamage = -1;
		let bestMove = 0;

		state.self.active.moves.forEach((move, idx) => {
			if (move.disabled) return;
			let est = [];
			try {
				est = Damage.getDamageResult(
					state.self.active,
					state.opponent.active,
					move
				);
			} catch (e) {
				console.log(e);
				console.log(state.self.active, state.opponent.active, move);
			}
		if (est[0] > maxDamage) {
			maxDamage = est[0];
			bestMove = idx;
		}
		});

    return new MOVE(bestMove);
	}

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}


module.exports = damageBot;