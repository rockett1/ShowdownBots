const AI = require('@la/ai');
const Typechart = require('@la/game/typechart');
const { MOVE, SWITCH } = require('@la/decisions');


const weights = {
  effectiveness: {
    weight: 10,
    //multipliers for move effectiveness
    value: (val) => {
      return {0: 0, 0.5: 1, 1: 2, 2: 10, 4: 20}[val];
    }
  },

  finisher: {
    weight: 15,
  },
  highestDamage: {
    weight: 10,
  },
  bonusTest: {
    weight: 1
  },
  unboost: {
    weight: 10,
  },
  status: {
    weight: 10,
  },
};


const randomnessExponent = 2;

class RockettbotV4 extends AI {
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
  constructor(meta) {
    super(meta);

    this.lastMove = null;
    this.weights = weights;
    this.randomnessExponent = randomnessExponent;
  }

  decide(state) {
    if (state.forceSwitch) {
      //pokemon feinted
      const possibleMons = state.self.reserve.filter((mon) => {
		//check if pokemon feinted
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      return new SWITCH(myMon);
    }
	//select pokemon at top of party list
    if (state.teamPreview) {
      return new SWITCH(0);
    }

    const weight = {};
    const totalWeight = {};
	
	//for each move calculate weight
    state.self.active.moves.forEach((move) => {
      if (move.disabled) return;
	  //if disabled, assign no value
      weight[move.id] = {};

      //Check for effective moves
      weight[move.id].effectiveness = Typechart.compare(move.type,
        state.opponent.active.types);
	  //if move effective apply higher weight
      weight[move.id].largeDamage = !!state.self.active.types.indexOf(move.type);

      //If last move wasnt debuff move, assign higher weight to debuffing opponent
      if (move.category === 'Status' && move.id !== this.lastMove &&
      move.boosts) {
        ['atk', 'spa', 'spd', 'spe', 'def'].forEach((type) => {
          if (!move.boosts[type]) return;

          if (state.opponent.active.boosts && state.opponent.active.boosts[type] &&
          state.opponent.active.boosts[type] < 0) return;

          //Assign higher weight
          weight[move.id].unboost = true;
        });
      }

      //If last move wasnt buff move, assign higher weight to buffing active pokemon
      if (move.secondary && move.id !== this.lastMove) {
        if (!state.opponent.active.conditions ||
          !state.opponent.active.conditions.indexOf(move.secondary.status) >= 0) {
          weight[move.id].status = move.secondary.chance;
        }
      }

      //Prioritise doing damage move to low HP target
      if (move.priority > 0 && state.opponent.active.hp < 25) {
        weight[move.id].finisher = true;
      }
      totalWeight[move.id] = this.addWeight(weight[move.id]);
    });

    //calculate total weights, use heighest weighted move
    const myMove = this.highestWeight(totalWeight);
    return new MOVE(myMove);
  }

  addWeight(obj) {
    let sum = 0;
    for (const key in obj) {
      if (weights[key]) {
        //convert value to integer, 
        const value = weights[key].value
          ? weights[key].value(obj[key])
          : +obj[key];

        sum = sum + weights[key].weight * value;
      }
    }
    return sum;
  }

  highestWeight(moveArr) {
    let total = 0;
    const weighted = {};
    for (const move in moveArr) {
		//for each move multiply by randomnessExponent
      if ({}.hasOwnProperty.call(moveArr, move)) {weighted[move] = moveArr[move] >= 0? Math.pow(moveArr[move], randomnessExponent): 0;
        total += weighted[move];
      }
    }
    const myVal = Math.random() * total;
    let base = 0;
    for (const move in weighted) {
	  //select highested weight move
      if ({}.hasOwnProperty.call(weighted, move)) {base += weighted[move];
        if (base > myVal) return move;
      }
    }
    return false;
  }

  //random generator
  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
module.exports = RockettbotV4;