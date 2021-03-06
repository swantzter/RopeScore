import { roundTo } from '@/common'
import { Ruleset, JudgeType, ResultTableHeader, ResultTableHeaders, ResultTableHeaderGroup, InputField, ScoreInfo, ResultInfo, Event } from '.'

import {
  SpeedJudge as FISACSpeedJudge,
  SpeedHeadJudgeMasters as FISACSpeedHeadJudgeMasters,
  SpeedHeadJudgeRelays as FISACSpeedHeadJudgeRelays
} from './FISAC1718'

export type IJRU1_1_0Events =
  // Ind
  'srss' | 'srse' | 'srtu' | 'srif' |
  // Team SR
  'srsr' | 'srdr' | 'srpf' | 'srtf' |
  // Team DD
  'ddsr' | 'ddss' | 'ddsf' | 'ddpf' | 'ddtf' |
  // Wheel
  'whpf' |
  // Show Comp
  'sctf'

export type IJRU1_1_0Overalls = 'isro' | 'tsro' | 'tddo' | 'taac'

export interface IJRU1_1_0Score extends ScoreInfo<IJRU1_1_0Events> {
  // Speed
  s?: number
  fStart?: number
  fSwitch?: number

  // FS
  mis?: number
  spc?: number
  tim?: number
  rep?: number

  // pres A
  pafep?: number
  pafec?: number
  pafem?: number

  // Pres R
  prenp?: number
  prenc?: number
  prenm?: number
  prmup?: number
  prmuc?: number
  prmum?: number

  // Req
  rqmul?: number
  rqgyp?: number
  rqwrr?: number
  rqint?: number
  rqtis?: number

  // Diff
  l05?: number
  l1?: number
  l2?: number
  l3?: number
  l4?: number
  l5?: number
  l6?: number
  l7?: number
  l8?: number
}

export interface IJRU1_1_0Result extends ResultInfo {
  // speed
  a?: number
  m?: number

  // FS
  D?: number
  P?: number
  aF?: number
  aE?: number
  aM?: number

  M?: number
  v?: number

  U?: number
  r?: number

  Q?: number
  R?: number

  // Overall
  S?: number
  N?: number
  T?: number
  B?: number
}

export const IJRU1_1_0average = (scores: number[]): number => {
  // sort ascending
  scores.sort(function (a, b) {
    return a - b
  })

  if (scores.length >= 4) {
    scores.pop()
    scores.shift()

    let score = scores.reduce((a, b) => a + b)
    return score / scores.length
  } else if (scores.length === 3) {
    const closest = scores[2] - scores[1] <= scores[2] - scores[1] ? scores[2] + scores[1] : scores[1] + scores[0]
    return (closest / 2) ?? 0
  } else if (scores.length === 2) {
    let score = scores.reduce((a, b) => a + b)
    return score / scores.length
  } else {
    return scores[0]
  }
}

interface DifficultyField extends InputField<IJRU1_1_0Score> {
  level: number
}

interface DifficultyJudge extends JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> {
  fields: DifficultyField[]
}

/* SPEED */
export const SpeedJudge: JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> = {
  ...FISACSpeedJudge as JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events>,
  result: scores => ({
    a: scores.s
  })
}

export const SpeedHeadJudgeMasters: JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> = {
  ...FISACSpeedHeadJudgeMasters as JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events>,
  result: scores => ({
    a: scores.s ?? 0,
    m: ((scores.fStart ?? 0) + (scores.fSwitch ?? 0)) * 10
  })
}

export const SpeedHeadJudgeRelays: JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> = {
  ...FISACSpeedHeadJudgeRelays as JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events>,
  result: SpeedHeadJudgeMasters.result
}

/* PRESENTATION */
export const AthletePresentationJudge: JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> = {
  name: 'Athlete Presentation',
  judgeTypeID: 'Pa',
  fields: [
    {
      name: 'Form and Execution +',
      fieldID: 'pafep',
      min: 0,
      step: 1
    },
    {
      name: 'Form and Execution ✓',
      fieldID: 'pafec',
      min: 0,
      step: 1
    },
    {
      name: 'Form and Execution -',
      fieldID: 'pafem',
      min: 0,
      step: 1
    },

    {
      name: 'Misses',
      fieldID: 'mis',
      min: 0
    }
  ],
  result: scores => {
    const top = (scores.pafep ?? 0) - (scores.pafem ?? 0)
    const bottom = (scores.pafep ?? 0) + (scores.pafec ?? 0) + (scores.pafem ?? 0)
    const avg = top / (bottom || 1)

    const aF = (avg * 0.35 * 0.5)
    return {
      m: roundTo(1 - ((scores.mis ?? 0) * 0.025), 3),
      aF: roundTo(aF, 6)
    }
  }
}

export const RoutinePresentationJudge: JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> = {
  name: 'Routine Presentation',
  judgeTypeID: 'Pr',
  fields: [
    {
      name: 'Repeated Skills',
      fieldID: 'rep',
      min: 0,
      step: 1
    },

    {
      name: 'Entertainment +',
      fieldID: 'prenp',
      min: 0,
      step: 1
    },
    {
      name: 'Entertainment ✓',
      fieldID: 'prenc',
      min: 0,
      step: 1
    },
    {
      name: 'Entertainment -',
      fieldID: 'prenm',
      min: 0,
      step: 1
    },

    {
      name: 'Musicality +',
      fieldID: 'prmup',
      min: 0,
      step: 1
    },
    {
      name: 'Musicality ✓',
      fieldID: 'prmuc',
      min: 0,
      step: 1
    },
    {
      name: 'Musicality -',
      fieldID: 'prmum',
      min: 0,
      step: 1
    }
  ],
  result: scores => {
    const enTop = (scores.prenp ?? 0) - (scores.prenm ?? 0)
    const enBottom = (scores.prenp ?? 0) + (scores.prenc ?? 0) + (scores.prenm ?? 0)
    const enAvg = enTop / (enBottom || 1)

    const muTop = (scores.prmup ?? 0) - (scores.prmum ?? 0)
    const muBottom = (scores.prmup ?? 0) + (scores.prmuc ?? 0) + (scores.prmum ?? 0)
    const muAvg = muTop / (muBottom || 1)

    return {
      r: roundTo((scores.rep ?? 0) * 0.0125, 4),
      aE: roundTo((enAvg * 0.35 * 0.25), 6),
      aM: roundTo((muAvg * 0.35 * 0.25), 6)
    }
  }
}

/* REQUIRED ELEMENTS */
export const MissJudgeSingleRopeIndividual: JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> = {
  name: 'Required Elements',
  judgeTypeID: 'R',
  fields: [
    {
      name: 'Time Violations',
      fieldID: 'tim',
      min: 0,
      max: 2
    },
    {
      name: 'Space Violations',
      fieldID: 'spc',
      min: 0
    },
    {
      name: 'Misses',
      fieldID: 'mis',
      min: 0
    },

    {
      name: 'Amount of different Gymnastics and Power Skills',
      fieldID: 'rqgyp',
      min: 0,
      max: 4
    },
    {
      name: 'Amount of different Multiples',
      fieldID: 'rqmul',
      min: 0,
      max: 4
    },
    {
      name: 'Amount of different Wraps and Releases',
      fieldID: 'rqwrr',
      min: 0,
      max: 4
    }
  ],
  result: function (scores) {
    if (!this) return
    const rqFields: InputField<IJRU1_1_0Score>[] = this.fields.filter(field => field.fieldID !== 'mis' && field.fieldID !== 'spc' && field.fieldID !== 'tim')
    const max: number = rqFields.reduce((acc, curr) => (acc + (curr.max ?? 0)), 0)

    let score = rqFields.map(field => scores[field.fieldID] ?? 0).reduce((a, b) => a + b)
    score = score > max ? max : score

    const missing = max - score


    return {
      Q: roundTo(1 - (missing * 0.025), 3),
      m: roundTo(1 - ((scores.mis ?? 0) * 0.025), 3),
      v: roundTo(1 - (((scores.spc ?? 0) + (scores.tim ?? 0)) * 0.025), 3)
    }
  }
}

export const MissJudgeSingleRopeTeam: JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> = {
  ...MissJudgeSingleRopeIndividual,
  fields: [
    ...MissJudgeSingleRopeIndividual.fields,
    {
      name: 'Amount of different Interactions',
      fieldID: 'rqint',
      min: 0,
      max: 4
    }
  ]
}

export const MissJudgeWheels: JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> = {
  ...MissJudgeSingleRopeTeam
}

export const MissJudgeDoubleDutchSingle: JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> = {
  ...MissJudgeSingleRopeIndividual,
  fields: [
    {
      name: 'Time Violations',
      fieldID: 'tim',
      min: 0
    },
    {
      name: 'Space Violations',
      fieldID: 'spc',
      min: 0
    },
    {
      name: 'Misses',
      fieldID: 'mis',
      min: 0
    },

    {
      name: 'Amount of different Gymnastics and Power Skills',
      fieldID: 'rqgyp',
      min: 0,
      max: 4
    },
    {
      name: 'Amount of different Turner Involvement Skills',
      fieldID: 'rqtis',
      min: 0,
      max: 4
    }
  ]
}

const DDRequiredFeilds = MissJudgeDoubleDutchSingle.fields.slice(0)
const rqgypIdx = DDRequiredFeilds.findIndex(field => field.fieldID === 'rqgyp')
DDRequiredFeilds.splice(rqgypIdx + 1, 0, {
  name: 'Amount of different Interactions',
  fieldID: 'rqint',
  min: 0,
  max: 4
})

export const MissJudgeDoubleDutchPair: JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> = {
  ...MissJudgeDoubleDutchSingle,
  fields: DDRequiredFeilds
}

export const MissJudgeDoubleDutchTriad: JudgeType<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events> = {
  ...MissJudgeDoubleDutchSingle,
  fields: DDRequiredFeilds
}

/* DIFFICULTY */
export const DifficultyJudge: DifficultyJudge = {
  name: 'Difficulty',
  judgeTypeID: 'D',
  fields: [
    {
      name: 'Level 0.5',
      fieldID: 'l05',
      min: 0,
      level: 0.5
    },
    ...Array(8).fill(undefined).map((el, idx) => ({
      name: `Level ${idx + 1}`,
      fieldID: `l${idx + 1}` as 'l1' | 'l2' | 'l3' | 'l4' | 'l5' | 'l6' | 'l7' | 'l8',
      level: idx + 1
    }))
  ],
  result: function (scores) {
    if (!this) return
    let l = (l: number): number => roundTo(0.1 * Math.pow(1.8, l), 2)

    let D = this.fields.filter(field => !!field.level).map(field => (scores[field.fieldID] ?? 0) * l(field.level)).reduce((a, b) => a + b)

    return {
      D: roundTo(D, 2)
    }
  }
}

/* RESULT TABLES */
export const SpeedResultTableHeaders: ResultTableHeaders<IJRU1_1_0Events> = {
  headers: [{
    text: 'Score',
    value: 'R'
  }, {
    text: 'Rank',
    value: 'S',
    color: 'red'
  }]
}

export const FreestyleResultTableHeaders: ResultTableHeaders<IJRU1_1_0Events> = {
  headers: [
    {
      text: 'Diff',
      value: 'D',
      color: 'grey'
    }, {
      text: 'Pres',
      value: 'P',
      color: 'grey'
    }, {
      text: 'Req. El',
      value: 'Q',
      color: 'grey'
    }, {
      text: 'Deduc',
      value: 'M',
      color: 'grey'
    }, {
      text: 'Rep',
      value: 'U',
      color: 'grey'
    },

    {
      text: 'Score',
      value: 'R'
    }, {
      text: 'Rank',
      value: 'S',
      color: 'red'
    }]
}

export const OverallResultTableGroupsIndividual: ResultTableHeaderGroup<IJRU1_1_0Events>[][] = [
  [{
    text: 'Single Rope',
    value: 'sr',
    colspan: 6
  }, {
    text: 'Overall',
    value: 'oa',
    colspan: 3,
    rowspan: 2
  }],

  [{
    text: 'Speed Sprint',
    value: 'srss',
    colspan: 2
  }, {
    text: 'Speed Endurance',
    value: 'srse',
    colspan: 2
  }, {
    text: 'Individual Freestyle',
    value: 'srif',
    colspan: 2
  }]
]

export const OverallResultTableHeadersIndividual: ResultTableHeader<IJRU1_1_0Events>[] = [
  {
    text: 'Score',
    value: 'R',
    eventID: 'srss'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'srss',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'srse'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'srse',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'srif'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'srif',
    color: 'red'
  },

  {
    text: 'Normalized',
    value: 'B',
    eventID: 'overall'
  }, {
    text: 'Rank Sum',
    value: 'T',
    color: 'green',
    eventID: 'overall'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'overall',
    color: 'red'
  }
]

export const SingleRopeOverallResultTableGroupsTeam: ResultTableHeaderGroup<IJRU1_1_0Events>[][] = [
  [{
    text: 'Single Rope',
    value: 'sr',
    colspan: 8
  }, {
    text: 'Overall',
    value: 'oa',
    colspan: 2,
    rowspan: 2
  }],

  [{
    text: 'Speed Relay',
    value: 'srsr',
    colspan: 2
  },
  {
    text: 'Pairs Double Unders',
    value: 'srdr',
    colspan: 2
  }, {
    text: 'Pair Freestyle',
    value: 'srpf',
    colspan: 2
  }, {
    text: 'Team Freestyle',
    value: 'srtf',
    colspan: 2
  }]
]

export const SingleRopeOverallResultTableHeadersTeam: ResultTableHeader<IJRU1_1_0Events>[] = [
  {
    text: 'Score',
    value: 'R',
    eventID: 'srsr'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'srsr',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'srdr'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'srdr',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'srpf'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'srpf',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'srtf'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'srtf',
    color: 'red'
  },

  {
    text: 'Rank Sum',
    value: 'T',
    color: 'green',
    eventID: 'overall'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'overall',
    color: 'red'
  }
]

export const DoubleDutchOverallResultTableGroupsTeam: ResultTableHeaderGroup<IJRU1_1_0Events>[][] = [
  [{
    text: 'Double Dutch',
    value: 'dd',
    colspan: 8
  }, {
    text: 'Overall',
    value: 'oa',
    colspan: 2,
    rowspan: 2
  }],

  [{
    text: 'Speed Relay',
    value: 'ddsr',
    colspan: 2
  }, {
    text: 'Speed Spring',
    value: 'ddss',
    colspan: 2
  }, {
    text: 'Single Freestyle',
    value: 'ddsf',
    colspan: 2
  }, {
    text: 'Pair Freestyle',
    value: 'ddpf',
    colspan: 2
  }]
]

export const DoubleDutchOverallResultTableHeadersTeam: ResultTableHeader<IJRU1_1_0Events>[] = [
  {
    text: 'Score',
    value: 'R',
    eventID: 'ddsr'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'ddsr',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'ddss'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'ddss',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'ddsf'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'ddsf',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'ddpf'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'ddpf',
    color: 'red'
  },

  {
    text: 'Rank Sum',
    value: 'T',
    color: 'green',
    eventID: 'overall'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'overall',
    color: 'red'
  }
]

export const AllAroundResultTableGroupsTeam: ResultTableHeaderGroup<IJRU1_1_0Events>[][] = [
  [{
    text: 'Single Rope',
    value: 'sr',
    colspan: 8
  }, {
    text: 'Double Dutch',
    value: 'dd',
    colspan: 8
  }, {
    text: 'Overall',
    value: 'oa',
    colspan: 2,
    rowspan: 2
  }],

  [{
    text: 'Speed Relay',
    value: 'srsr',
    colspan: 2
  },
  {
    text: 'Pairs Double Unders',
    value: 'srdr',
    colspan: 2
  }, {
    text: 'Pair Freestyle',
    value: 'srpf',
    colspan: 2
  }, {
    text: 'Team Freestyle',
    value: 'srtf',
    colspan: 2
  },

  {
    text: 'Speed Relay',
    value: 'ddsr',
    colspan: 2
  }, {
    text: 'Speed Spring',
    value: 'ddss',
    colspan: 2
  }, {
    text: 'Single Freestyle',
    value: 'ddsf',
    colspan: 2
  }, {
    text: 'Pair Freestyle',
    value: 'ddpf',
    colspan: 2
  }]
]

export const AllAroundResultTableHeadersTeam: ResultTableHeader<IJRU1_1_0Events>[] = [
  {
    text: 'Score',
    value: 'R',
    eventID: 'srsr'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'srsr',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'srdr'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'srdr',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'srpf'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'srpf',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'srtf'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'srtf',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'ddsr'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'ddsr',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'ddss'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'ddss',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'ddsf'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'ddsf',
    color: 'red'
  },

  {
    text: 'Score',
    value: 'R',
    eventID: 'ddpf'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'ddpf',
    color: 'red'
  },

  {
    text: 'Rank Sum',
    value: 'T',
    color: 'green',
    eventID: 'overall'
  }, {
    text: 'Rank',
    value: 'S',
    eventID: 'overall',
    color: 'red'
  }
]

export const SpeedResult = function (eventID: IJRU1_1_0Events): Event<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events, IJRU1_1_0Overalls>['result'] {
  return function (scores: { [judgeID: string]: IJRU1_1_0Score }, judges: [string, string][]) {
    let judgeResults: IJRU1_1_0Result[] = []
    let output: IJRU1_1_0Result = {}

    let eventObj = config.events.find(el => el.eventID === eventID)
    if (!eventObj) throw new Error('Could not find event ' + eventID)
    let eventJudgeTypes = eventObj.judges

    for (let JudgeType of judges) {
      let judgeID = JudgeType[0]
      let judgeType = JudgeType[1]

      let judgeObj = eventJudgeTypes!.find(el => el.judgeTypeID === judgeType)!
      let resultFunction = judgeObj.result

      let idx: number = judgeResults.findIndex(el => el.judgeID === judgeID)
      if (idx < 0) {
        judgeResults.push({
          judgeID,
          ...resultFunction.call(judgeObj, scores[judgeID] ?? {})
        })
      } else {
        judgeResults[idx] = {
          ...judgeResults[idx],
          ...resultFunction.call(judgeObj, scores[judgeID] ?? {})
        }
      }
    }

    // Calc a
    let as = judgeResults.map(el => el.a).filter(el => typeof el === 'number') as number[]
    output.a = IJRU1_1_0average(as)

    // Calc m
    let ms = judgeResults.map(el => el.m).filter(el => typeof el === 'number') as number[]
    output.m = IJRU1_1_0average(ms)

    output.R = roundTo((output.a ?? 0) - (output.m ?? 0), 2)

    return output
  }
}

export const SpeedRank: Event<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events, IJRU1_1_0Overalls>['rank'] = function (results: IJRU1_1_0Result[] = []): IJRU1_1_0Result[] {
  // results = results.filter(el => typeof el.Y === 'number')
  results.sort(function (a, b) {
    return (b.R ?? 0) - (a.R?? 0) // sort descending
  })

  const high = results.length > 0 ? results[0].R ?? 0: 0
  const low = results.length > 1 ? results[results.length - 1].R ?? 0 : 0

  results = results.map((el, _, arr) => ({
    ...el,
    S: arr.findIndex(obj => obj.R === el.R) + 1,
    N: roundTo((((100 - 1) * ((el.R ?? 0) - low)) / ((high - low !== 0 ) ? high - low : 1)) + 1, 2)
  }))

  // DEV SORT BY ID
  // results.sort((a, b) => Number(a.participant.substring(1, 4) - Number(b.participant.substring(1, 4))))

  return results
}

const FreestyleResult = function (eventID: IJRU1_1_0Events): Event<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events, IJRU1_1_0Overalls>['result'] {
  return function (scores: { [judgeID: string]: IJRU1_1_0Score }, judges: [string, string][]) {
    let judgeResults: IJRU1_1_0Result[] = []
    let output: IJRU1_1_0Result = {}

    let eventObj = config.events.find(el => el.eventID === eventID)
    if (!eventObj) throw new Error('Could not find event ' + eventID)
    let eventJudgeTypes = eventObj.judges

    for (let JudgeType of judges) {
      let judgeID = JudgeType[0]
      let judgeType = JudgeType[1]

      let judgeObj = eventJudgeTypes.find(el => el.judgeTypeID === judgeType)
      if (!judgeObj) throw new Error('Invalid judgeType')
      let resultFunction = judgeObj.result

      let idx: number = judgeResults.findIndex(el => el.judgeID === judgeID)
      if (idx < 0) {
        judgeResults.push({
          judgeID,
          ...resultFunction.call(judgeObj, scores[judgeID] || {})
        })
      } else {
        judgeResults[idx] = {
          ...judgeResults[idx],
          ...resultFunction.call(judgeObj, scores[judgeID] || {})
        }
      }
    }

    for (const scoreType of ['D', 'aF', 'aE', 'aM', 'm', 'v', 'r', 'Q'] as Array<keyof Omit<IJRU1_1_0Result, keyof ResultInfo>>) {
      let scores = judgeResults.map(el => el[scoreType]).filter(el => typeof el === 'number') as number[]
      if (['m', 'v', 'r'].includes(scoreType)) output[scoreType] = roundTo(IJRU1_1_0average(scores), 4)
      else if (['aF', 'aE', 'aM'].includes(scoreType)) output[scoreType] = roundTo(IJRU1_1_0average(scores), 6)
      else output[scoreType] = roundTo(IJRU1_1_0average(scores), 2) // D, Q

      if (typeof output[scoreType] !== 'number' || isNaN(Number(output[scoreType]))) output[scoreType] = (scoreType === 'D' ? 0 : 1)
    }

    output.M = roundTo(-(1 - (output.m ?? 0) - (output.v ?? 0)), 2) // the minus is because they're adlreay prepped to 1- and that needs to be reversed
    output.U = roundTo((1 - (output.r ?? 0)), 2)

    output.P = roundTo(1 + ((output.aE ?? 1) + (output.aF ?? 1) + (output.aM ?? 1)), 2)

    output.R = roundTo((output.D ?? 0) * (output.P ?? 1) * output.M * (output.Q ?? 1) * (output.U ?? 1), 2)
    output.R = output.R < 0 ? 0 : output.R

    return output
  }
}

export const FreestyleRank: Event<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events, IJRU1_1_0Overalls>['rank'] = function (results: IJRU1_1_0Result[] = []): IJRU1_1_0Result[] {
  // results = results.filter(el => typeof el.Y === 'number')
  let tiePriority = ['R', 'M', 'Q', 'P', 'U', 'D'] as Array<keyof IJRU1_1_0Result>
  results.sort(function (a, b) {
    if (a.R !== b.R) return (b.R ?? 0) - (a.R ?? 0) // descending 100 wins over 50
    if (a.M !== b.M) return (b.M ?? 1) - (a.M ?? 1) // descending *1 wins over *.9
    if (a.Q !== b.Q) return (b.Q ?? 1) - (a.Q ?? 1) // descending *1 wins over *.9
    if (a.P !== b.P) return (b.P ?? 1) - (a.P ?? 1) // descending 1.35 wins over 0.95
    if (a.U !== b.U) return (b.U ?? 1) - (a.U ?? 1) // descending *1 wins over *.9
    if (a.D !== b.D) return (b.D ?? 0) - (a.D ?? 0) // descending 100 wins over 50
    return 0
  })

  const high = results.length > 0 ? results[0].R ?? 0 : 0
  const low = results.length > 1 ? results[results.length - 1].R ?? 0 : 0

  results = results.map((el, idx, arr) => ({
    ...el,
    S: arr.findIndex(score =>
      score.R === el.R &&
      score.M === el.M &&
      score.Q === el.Q &&
      score.P === el.P &&
      score.U === el.U &&
      score.D === el.D
    ) + 1,
    N: roundTo((((100 - 1) * ((el.R ?? 0) - low)) / ((high - low) !== 0 ? high - low : 1)) + 1, 2)
  }))

  // DEV SORT BY ID
  // results.sort((a, b) => Number(a.participant.substring(1, 4)) - Number(b.participant.substring(1, 4)))

  return results
}

type eventResults = {
  [eventID in IJRU1_1_0Events]?: IJRU1_1_0Result[]
}

export const OverallRank = function (overallID: string) {
  return function (results: eventResults = {}) {
    let ranked: { overall: IJRU1_1_0Result[] } & eventResults = {
      overall: []
    }
    const overallObj = config.overalls.find(el => el.overallID === overallID)
    if (!overallObj) throw new Error('Could not find event ' + overallID)
    let tiePriority: (IJRU1_1_0Events | 'overall')[] = ['overall', 'srif', 'ddpf', 'ddsf', 'srtf', 'srpf', 'srse', 'srss', 'ddsr', 'srsr'] // TODO: break ties

    for (const eventID of overallObj.events) {
      const eventObj = config.events.find(el => el.eventID === eventID)
      if (!eventObj) continue
      ranked[eventID] = eventObj.rank(results[eventID]!)

      for (const scoreObj of ranked[eventID]!) {
        let idx = ranked.overall.findIndex(el => el.participantID === scoreObj.participantID)
        if (!scoreObj) continue
        console.log(scoreObj)

        if (idx >= 0) {
          ranked.overall[idx].R = roundTo((ranked.overall[idx].R ?? 0) + ((scoreObj.R ?? 0) * (eventObj.scoreMultiplier ?? 1)), 4)
          ranked.overall[idx].T = ((ranked.overall[idx].T ?? 0) + ((scoreObj.S ?? 0) * (eventObj.rankMultiplier ?? 1))) ?? 0
          ranked.overall[idx].B = ((ranked.overall[idx].B ?? 0) + (scoreObj.N ?? 0)) ?? 0
        } else {
          let R = roundTo(scoreObj.R ?? 0, 4)
          ranked.overall.push({
            participantID: scoreObj.participantID,
            R,
            T: scoreObj.S ?? 0,
            B: scoreObj.N ?? 0
          })
        }
      }
    }

    console.log(ranked)

    ranked.overall.sort((a, b) => {
      // TODO: tiebreak
      if (a.T !== b.T) return (a.T ?? 0) -(b.T ?? 0)
      return (b.B ?? 0) - (a.B ?? 0)
    })
    ranked.overall = ranked.overall.map((el, idx, arr) => ({
      ...el,
      // S: arr.findIndex(obj => obj.T === el.T) + 1
      S: idx + 1
    }))

    // DEV SORT BY ID
    // ranked.overall.sort((a, b) => Number(a.participant.substring(1, 4) - Number(b.participant.substring(1, 4))))

    return ranked
  }
}

const config: Ruleset<IJRU1_1_0Score, IJRU1_1_0Result, IJRU1_1_0Events, IJRU1_1_0Overalls> = {
  name: 'IJRU v1.1.0',
  rulesetID: 'IJRU1-0-0',
  events: [{
    eventID: 'srss',
    name: 'Single Rope Speed Sprint',
    judges: [SpeedJudge, SpeedHeadJudgeMasters],
    result: SpeedResult('srss'),
    rank: SpeedRank,
    headers: SpeedResultTableHeaders,
    multipleEntry: true
  }, {
    eventID: 'srse',
    name: 'Single Rope Speed Endurance',
    judges: [SpeedJudge, SpeedHeadJudgeMasters],
    result: SpeedResult('srse'),
    rank: SpeedRank,
    headers: SpeedResultTableHeaders,
    multipleEntry: true
  }, {
    eventID: 'srtu',
    name: 'Single Rope Triple Unders',
    judges: [SpeedJudge, SpeedHeadJudgeMasters],
    result: SpeedResult('srtu'),
    rank: SpeedRank,
    headers: SpeedResultTableHeaders,
    multipleEntry: true
  },
  {
    eventID: 'srif',
    name: 'Single Rope Individual Freestyle',
    judges: [AthletePresentationJudge, RoutinePresentationJudge, MissJudgeSingleRopeIndividual, DifficultyJudge],
    result: FreestyleResult('srif'),
    rank: FreestyleRank,
    headers: FreestyleResultTableHeaders,
    rankMultiplier: 2
  },

  {
    eventID: 'srsr',
    name: 'Single Rope Speed Relay',
    judges: [SpeedJudge, SpeedHeadJudgeRelays],
    result: SpeedResult('srsr'),
    rank: SpeedRank,
    headers: SpeedResultTableHeaders,
    multipleEntry: true
  }, {
    eventID: 'srdr',
    name: 'Single Rope Pairs Double Unders',
    judges: [SpeedJudge, SpeedHeadJudgeRelays],
    result: SpeedResult('srdr'),
    rank: SpeedRank,
    headers: SpeedResultTableHeaders,
    multipleEntry: true
  }, {
    eventID: 'ddsr',
    name: 'Double Dutch Speed Relay',
    judges: [SpeedJudge, SpeedHeadJudgeRelays],
    result: SpeedResult('ddsr'),
    rank: SpeedRank,
    headers: SpeedResultTableHeaders,
    multipleEntry: true
  }, {
    eventID: 'ddss',
    name: 'Double Dutch Speed Sprint',
    judges: [SpeedJudge, SpeedHeadJudgeRelays],
    result: SpeedResult('ddss'),
    rank: SpeedRank,
    headers: SpeedResultTableHeaders,
    multipleEntry: true
  },
  {
    eventID: 'srpf',
    name: 'Single Rope Pair Freestyle',
    judges: [AthletePresentationJudge, RoutinePresentationJudge, MissJudgeSingleRopeTeam, DifficultyJudge],
    result: FreestyleResult('srpf'),
    rank: FreestyleRank,
    headers: FreestyleResultTableHeaders
  }, {
    eventID: 'srtf',
    name: 'Single Rope Team Freestyle',
    judges: [AthletePresentationJudge, RoutinePresentationJudge, MissJudgeSingleRopeTeam, DifficultyJudge],
    result: FreestyleResult('srtf'),
    rank: FreestyleRank,
    headers: FreestyleResultTableHeaders
  }, {
    eventID: 'ddsf',
    name: 'Double Dutch Single Freestyle',
    judges: [AthletePresentationJudge, RoutinePresentationJudge, MissJudgeDoubleDutchSingle, DifficultyJudge],
    result: FreestyleResult('ddsf'),
    rank: FreestyleRank,
    headers: FreestyleResultTableHeaders
  }, {
    eventID: 'ddpf',
    name: 'Double Dutch Pairs Freestyle',
    judges: [AthletePresentationJudge, RoutinePresentationJudge, MissJudgeDoubleDutchPair, DifficultyJudge],
    result: FreestyleResult('ddpf'),
    rank: FreestyleRank,
    headers: FreestyleResultTableHeaders
  }, {
    eventID: 'ddtf',
    name: 'Double Dutch Triad Freestyle',
    judges: [AthletePresentationJudge, RoutinePresentationJudge, MissJudgeDoubleDutchTriad, DifficultyJudge],
    result: FreestyleResult('ddpf'),
    rank: FreestyleRank,
    headers: FreestyleResultTableHeaders
  },

  {
    eventID: 'whpf',
    name: 'Wheel Pair Freestyle',
    judges: [AthletePresentationJudge, RoutinePresentationJudge, MissJudgeWheels, DifficultyJudge],
    result: FreestyleResult('ddpf'),
    rank: FreestyleRank,
    headers: FreestyleResultTableHeaders
  }],

  overalls: [{
    overallID: 'isro',
    text: 'Individual Overall',
    type: 'individual',
    groups: OverallResultTableGroupsIndividual,
    headers: OverallResultTableHeadersIndividual,
    events: ['srss', 'srse', 'srif'],
    rank: OverallRank('isro')
  },

  {
    overallID: 'tsro',
    text: 'Team Single Rope Overall',
    type: 'team',
    groups: SingleRopeOverallResultTableGroupsTeam,
    headers: SingleRopeOverallResultTableHeadersTeam,
    events: ['srsr', 'srdr', 'srpf', 'srtf'],
    rank: OverallRank('tsro')
  },
  {
    overallID: 'tddo',
    text: 'Team Double Dutch Overall',
    type: 'team',
    groups: DoubleDutchOverallResultTableGroupsTeam,
    headers: DoubleDutchOverallResultTableHeadersTeam,
    events: ['ddsr', 'ddss', 'ddsf', 'ddpf'],
    rank: OverallRank('tddo')
  },
  {
    overallID: 'taac',
    text: 'Team All-Around',
    type: 'team',
    groups: AllAroundResultTableGroupsTeam,
    headers: AllAroundResultTableHeadersTeam,
    events: ['srsr', 'srdr', 'srpf', 'srtf', 'ddsr', 'ddss', 'ddsf', 'ddpf'],
    rank: OverallRank('taac')
  }]
}

export default config
