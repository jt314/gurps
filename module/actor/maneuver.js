import GurpsToken from '../token.js'

export const MANEUVER = 'maneuver'
export const DEFENSE_ANY = 'any'
export const DEFENSE_NONE = 'none'
export const DEFENSE_DODGEBLOCK = 'dodge-block'

export const MOVE_STEP = 'step'
export const MOVE_NONE = 'none'
export const MOVE_FULL = 'full'
export const MOVE_HALF = 'half'

export const PROPERTY_MOVEOVERRIDE = 'data.moveoverride'

CONFIG.Token.objectClass = GurpsToken
const oldTemporaryEffects = Object.getOwnPropertyDescriptor(Actor.prototype, 'temporaryEffects')

// Override Actor.temporaryEffects getter to sort maneuvers to the front of the array
Object.defineProperty(Actor.prototype, 'temporaryEffects', {
  get: function () {
    let results = oldTemporaryEffects?.get?.call(this)

    if (!!results && results.length > 1) {
      // get the active temporary effects that are also maneuvers
      const maneuvers = results.filter((/** @type {ActiveEffect} */ e) => e.getFlag('core', 'statusId') === MANEUVER)
      const notManeuvers = results.filter((/** @type {ActiveEffect} */ e) => e.getFlag('core', 'statusId') !== MANEUVER)
      results = [...maneuvers, ...notManeuvers]
    }
    return results
  },
})

/**
 * @typedef {{id: string, flags: { gurps: { name: string, move?: string, defense?: string, fullturn?: Boolean, icon: string, alt?: string|null} } }} ManeuverEffect
 * @typedef {import('@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData').ActiveEffectDataConstructorData & ManeuverEffect} ManeuverData
 */

/** @typedef {{name: string, label: string, move?: string, defense?: string, fullturn?: boolean, icon: string, alt?: string|null}} _data */

/**
 * The purpose of this class is to help generate data that can be used in an ActiveEffect.
 */
class Maneuver {
  static filepath = 'systems/gurps/icons/maneuvers/'
  /**
   * @param {_data} data
   */
  constructor(data) {
    data.move = data.move || MOVE_STEP
    data.defense = data.defense || DEFENSE_ANY
    data.fullturn = !!data.fullturn
    data.icon = Maneuver.filepath + data.icon
    data.alt = !!data.alt ? Maneuver.filepath + data.alt : null
    this._data = data
  }

  get icon() {
    return this._data.icon
  }

  get move() {
    return this._data.move
  }

  /** @returns {ManeuverData} */
  get data() {
    return {
      id: MANEUVER,
      label: this._data.label,
      icon: this._data.icon,
      flags: {
        gurps: {
          name: this._data.name,
          move: this._data.move,
          defense: this._data.defense,
          fullturn: this._data.fullturn,
          icon: this._data.icon,
          alt: this._data.alt,
        },
      },
      changes: this.changes,
    }
  }

  /** @returns {import('@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData').EffectChangeDataConstructorData[]} */
  get changes() {
    let changes = []

    changes.push({
      key: 'data.conditions.maneuver',
      value: this._data.name,
      mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
      priority: 10,
    })

    changes.push({ key: PROPERTY_MOVEOVERRIDE, value: this.move, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM })

    return changes
  }
}

const maneuvers = {
  do_nothing: new Maneuver({
    name: 'do_nothing',
    label: 'GURPS.maneuverDoNothing',
    icon: 'man-nothing.png',
    move: MOVE_NONE,
  }),
  move: new Maneuver({
    name: 'move',
    label: 'GURPS.maneuverMove',
    icon: 'man-move.png',
    move: MOVE_FULL,
  }),
  aim: new Maneuver({
    name: 'aim',
    fullturn: true,
    icon: 'man-aim.png',
    label: 'GURPS.maneuverAim',
  }),
  change_posture: new Maneuver({
    name: 'change_posture',
    move: MOVE_NONE,
    icon: 'man-change-posture.png',
    label: 'GURPS.maneuverChangePosture',
  }),
  evaluate: new Maneuver({
    name: 'evaluate',
    icon: 'man-evaluate.png',
    label: 'GURPS.maneuverEvaluate',
  }),
  attack: new Maneuver({
    name: 'attack',
    icon: 'man-attack.png',
    label: 'GURPS.maneuverAttack',
  }),
  feint: new Maneuver({
    name: 'feint',
    icon: 'man-feint.png',
    label: 'GURPS.maneuverFeint',
    alt: 'man-attack.png',
  }),
  allout_attack: new Maneuver({
    name: 'allout_attack',
    move: MOVE_HALF,
    defense: DEFENSE_NONE,
    icon: 'man-allout-attack.png',
    label: 'GURPS.maneuverAllOutAttack',
  }),
  aoa_determined: new Maneuver({
    name: 'aoa_determined',
    move: MOVE_HALF,
    defense: DEFENSE_NONE,
    icon: 'man-aoa-determined.png',
    label: 'GURPS.maneuverAllOutAttackDetermined',
    alt: 'man-allout-attack.png',
  }),
  aoa_double: new Maneuver({
    name: 'aoa_double',
    move: MOVE_HALF,
    defense: DEFENSE_NONE,
    icon: 'man-aoa-double.png',
    label: 'GURPS.maneuverAllOutAttackDouble',
    alt: 'man-allout-attack.png',
  }),
  aoa_feint: new Maneuver({
    name: 'aoa_feint',
    move: MOVE_HALF,
    defense: DEFENSE_NONE,
    icon: 'man-aoa-feint.png',
    label: 'GURPS.maneuverAllOutAttackFeint',
    alt: 'man-allout-attack.png',
  }),
  aoa_strong: new Maneuver({
    name: 'aoa_strong',
    move: MOVE_HALF,
    defense: DEFENSE_NONE,
    alt: 'man-allout-attack.png',
    icon: 'man-aoa-strong.png',
    label: 'GURPS.maneuverAllOutAttackStrong',
  }),
  aoa_suppress: new Maneuver({
    name: 'aoa_suppress',
    move: MOVE_HALF,
    defense: DEFENSE_NONE,
    alt: 'man-allout-attack.png',
    icon: 'man-aoa-suppress.png',
    label: 'GURPS.maneuverAllOutAttackSuppressFire',
  }),
  move_and_attack: new Maneuver({
    name: 'move_and_attack',
    move: MOVE_FULL,
    defense: DEFENSE_DODGEBLOCK,
    icon: 'man-move-attack.png',
    label: 'GURPS.maneuverMoveAttack',
  }),
  allout_defense: new Maneuver({
    name: 'allout_defense',
    move: MOVE_HALF,
    icon: 'man-defense.png',
    label: 'GURPS.maneuverAllOutDefense',
  }),
  aod_dodge: new Maneuver({
    name: 'aod_dodge',
    move: MOVE_HALF,
    alt: 'man-defense.png',
    icon: 'man-def-dodge.png',
    label: 'GURPS.maneuverAllOutDefenseDodge',
  }),
  aod_parry: new Maneuver({
    name: 'aod_parry',
    alt: 'man-defense.png',
    icon: 'man-def-parry.png',
    label: 'GURPS.maneuverAllOutDefenseParry',
  }),
  aod_block: new Maneuver({
    name: 'aod_block',
    alt: 'man-defense.png',
    icon: 'man-def-block.png',
    label: 'GURPS.maneuverAllOutDefenseBlock',
  }),
  aod_double: new Maneuver({
    name: 'aod_double',
    alt: 'man-defense.png',
    icon: 'man-def-double.png',
    label: 'GURPS.maneuverAllOutDefenseDouble',
  }),
  ready: new Maneuver({
    name: 'ready',
    icon: 'man-ready.png',
    label: 'GURPS.maneuverReady',
  }),
  concentrate: new Maneuver({
    name: 'concentrate',
    fullturn: true,
    icon: 'man-concentrate.png',
    label: 'GURPS.maneuverConcentrate',
  }),
  wait: new Maneuver({
    name: 'wait',
    move: MOVE_NONE,
    icon: 'man-wait.png',
    label: 'GURPS.maneuverWait',
  }),
}

export default class Maneuvers {
  /**
   * @param {string} id
   * @returns {ManeuverData}
   */
  static get(id) {
    // @ts-ignore
    return maneuvers[id].data
  }

  /**
   * @param {string} text
   * @returns {boolean} true if the text represents a maneuver icon path.
   * @memberof Maneuvers
   */
  static isManeuverIcon(text) {
    return Object.values(maneuvers)
      .map(m => m.icon)
      .includes(text)
  }

  /**
   * Return the sublist that are Maneuver icon paths.
   * @param {string[]} list of icon pathnames
   * @returns {string[]} the pathnames that represent Maneuvers
   * @memberof Maneuvers
   */
  static getManeuverIcons(list) {
    return list.filter(it => Maneuvers.isManeuverIcon(it))
  }

  /**
   * @param {string} maneuverText
   * @returns {ManeuverData}
   */
  static getManeuver(maneuverText) {
    // @ts-ignore
    return maneuvers[maneuverText].data
  }

  /**
   * @param {string} maneuverText
   * @returns {string|null}
   */
  static getIcon(maneuverText) {
    return Maneuvers.getManeuver(maneuverText).icon ?? null
  }

  static getAll() {
    return maneuvers
  }

  static getAllData() {
    let data = {}
    for (const key in maneuvers) {
      // @ts-ignore
      data[key] = maneuvers[key].data
    }

    return data
  }

  /**
   * @param {string} icon
   * @returns {ManeuverData[]|undefined}
   */
  static getByIcon(icon) {
    return Object.values(maneuvers)
      .filter(it => it.icon === icon)
      .map(it => it.data)
  }

  /**
   * The ActiveEffect is a Maneuver if its statusId is 'maneuver'.
   * @param {ActiveEffect} activeEffect
   * @returns {boolean}
   */
  static isActiveEffectManeuver(activeEffect) {
    return activeEffect.getFlag ? activeEffect.getFlag('core', 'statusId') === MANEUVER : false
  }

  /**
   * @param {ActiveEffect[]|undefined} effects
   * @return {ActiveEffect[]} just the ActiveEffects that are also Maneuvers
   */
  static getActiveEffectManeuvers(effects) {
    return effects ? effects.filter(it => Maneuvers.isActiveEffectManeuver(it)) : []
  }
}

// on create combatant, set the maneuver
Hooks.on('createCombatant', (/** @type {Combatant} */ combat, /** @type {any} */ _options, /** @type {any} */ id) => {
  if (game.user?.isGM) {
    console.log(id)
    let token = /** @type {GurpsToken} */ (combat.token?.object)
    if (!!token && token.id) token.setManeuver('do_nothing')
  }
})

// on delete combatant, remove the maneuver
Hooks.on('deleteCombatant', (/** @type {Combatant} */ combat, /** @type {any} */ _options, /** @type {any} */ id) => {
  if (game.user?.isGM) {
    console.log(id)
    let token = /** @type {GurpsToken} */ (combat.token?.object)
    if (!!token && token.id) {
      console.log(`Delete Combatant: remove maneuver token[${token.id}]`)
      token.removeManeuver()
    }
  }
})

// On delete combat, remove the maneuver from every combatant
Hooks.on('deleteCombat', (/** @type {Combat} */ combat, /** @type {any} */ _options, /** @type {any} */ _id) => {
  if (game.user?.isGM) {
    let combatants = combat.data.combatants.contents
    for (const combatant of combatants) {
      if (combatant?.token) {
        let token = /** @type {GurpsToken} */ (combatant.token.object)
        console.log(`Delete Combat: remove maneuver token[${token.id}]`)
        token.removeManeuver()
      }
    }
  }
})

// TODO consider subtracting 1 FP from every combatant that leaves combat
