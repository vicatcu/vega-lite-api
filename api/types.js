import {aggregateOps, timeUnitOps} from './ops';
import {capitalize} from './generate/util';

const N = 'nominal';
const O = 'ordinal';
const Q = 'quantitative';
const T = 'temporal';

export function transform(def, ...args) {
  return {
    def: def,
    arg: args
  };
}

export function aggregateOp(op, ...args) {
  return {
    def: 'AggregatedFieldDef',
    set: {op: op},
    arg: args,
    ext: {order: {arg: ['order']}} // to aid sorting
  };
}

export function windowOp(op, ...args) {
  return {
    def: 'WindowFieldDef',
    set: {op: op},
    arg: args
  };
}

export function timeUnitOp(op, ...args) {
  return {
    def: 'TimeUnitTransform',
    set: {timeUnit: op},
    arg: args
  };
}

export function groupby() {
  return {
    arg: ['...groupby'],
    switch: {
      aggregate:     'aggregate',
      join:          'joinaggregate',
      joinaggregate: 'joinaggregate',
      window:        'window'
    }
  };
}

// TODO Field.*Predicate values via switch
// field / timeUnit -> equal, gte, gt, lte, lt, oneOf, range, valid

// export function not() {
//   return {
//     arg: ['not']
//   };
// }

// export function logical(op) {
//   return {
//     arg: [`...${op}`]
//   };
// }

// TODO id auto-generation
export function selection(type) {
  return {
    def: `${capitalize(type)}Selection`,
    set: {type: type},
    arg: ['_id'],
    key: [
      {selection: '_id'},
      '_id'
    ]
  };
}

const channelAggregate = {};
for (let key in aggregateOps) {
  const _ = aggregateOps[key];
  channelAggregate[key] = {
    arg: [_[1]],
    set: {type: Q, aggregate: _[0]}
  };
}

const channelTimeUnit = {};
for (let key in timeUnitOps) {
  const _ = timeUnitOps[key];
  channelTimeUnit[key] = {
    arg: ['field'],
    set: {type: T, timeUnit: _[0]}
  };
}

export function channel(type) {
  return {
    def: `FacetedEncoding/properties/${type}`,
    key: [null, type],
    ext: {
      fieldN: {arg: ['field'], set: {type: N}},
      fieldO: {arg: ['field'], set: {type: O}},
      fieldQ: {arg: ['field'], set: {type: Q}},
      fieldT: {arg: ['field'], set: {type: T}},
      if: {arg: ['+++condition'], flag: 0}, // TODO clause accretion?
      ...channelAggregate,
      ...channelTimeUnit
    }
  };
}

export function encoding() {
  return {
    arg: ['encoding']
  };
}

export function sort() {
  return {
    def: 'Sort'
  };
}

// condition

const specExt = {
  transform: {arg: ['...transform']},
  selection: null,
  select:    {arg: ['+++selection'], flag: 1}
};

export function mark(type) {
  let set = type ? {mark: {type: type}} : null;

  return {
    def: 'TopLevelUnitSpec',
    set: set,
    arg: ['+++mark'],
    ext: {
      encode:   {arg: ['+++encoding'], flag: 1},
      encoding: null,
      ...specExt
    }
  };
}

export function data() {
  return {
    def: 'TopLevelSpec',
    arg: ['data'],
    ext: {
      layer:   {arg: ['...layer']},
      hconcat: {arg: ['...hconcat']},
      vconcat: {arg: ['...vconcat']},
      facet:   {arg: ['facet', 'spec']},  // TODO multi-arg extensions
      repeat:  {arg: ['repeat', 'spec']},
      ...specExt
    }
  };
}

export function spec(def, ...args) {
  return {
    def: def,
    arg: args,
    ext: specExt
  };
}
