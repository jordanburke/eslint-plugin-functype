import preferOption from "./prefer-option"
import preferEither from "./prefer-either"
import preferList from "./prefer-list"
import noGetUnsafe from "./no-get-unsafe"
import preferFold from "./prefer-fold"
import preferMap from "./prefer-map"
import preferFlatmap from "./prefer-flatmap"
import noImperativeLoops from "./no-imperative-loops"
import preferDoNotation from "./prefer-do-notation"

export {
  preferOption,
  preferEither,
  preferList,
  noGetUnsafe,
  preferFold,
  preferMap,
  preferFlatmap,
  noImperativeLoops,
  preferDoNotation,
}

export default {
  "prefer-option": preferOption,
  "prefer-either": preferEither,
  "prefer-list": preferList,
  "no-get-unsafe": noGetUnsafe,
  "prefer-fold": preferFold,
  "prefer-map": preferMap,
  "prefer-flatmap": preferFlatmap,
  "no-imperative-loops": noImperativeLoops,
  "prefer-do-notation": preferDoNotation,
}
