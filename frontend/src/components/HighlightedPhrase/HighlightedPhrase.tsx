import _ from "lodash";
import React from "react";
import { Phrase, TokenSpan } from "types";
import { getLogger } from "utils";

const logger = getLogger("HighlightedPhrase");

/**
 * Create a JS Map taking indexes in phrase text to the set of colours used at the slice
 * beginning at that location
 */
function createColourMap(
  phrase: Phrase,
  breakpoints: number[],
  obsMap: Record<number, string | undefined>
) {
  let locMap: Map<number, string[]> = new Map();
  for (let pt of breakpoints) {
    locMap.set(pt, []);
  }
  if (phrase.lexeme_matches !== undefined) {
    for (let m of phrase.lexeme_matches) {
      obsMap[m.lexeme] && locMap.get(m.start)!.push(obsMap[m.lexeme]!);
    }
  }
  if (phrase.feature_matches !== undefined) {
    for (let m of phrase.feature_matches) {
      obsMap[m.feature] && locMap.get(m.start)!.push(obsMap[m.feature]!);
    }
  }
  return locMap;
}

/**
 * Generate a style object for the span corresponding to a match. If there is more than
 * colour, use the repeating-linear-gradient() trick to get a pinstripe effect.
 * See: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-linear-gradient()
 */
function getMatchStyle(colours: string[]): React.CSSProperties {
  let style: React.CSSProperties = { borderRadius: "3px" };
  if (colours.length !== 0) {
    if (colours.length === 1) {
      style.backgroundColor = colours[0];
    } else {
      let repeatedColours = _(colours)
        .flatMap((col) => [col, col])
        .join(",");
      style.background = `repeating-linear-gradient(-45deg,${repeatedColours} 12px)`;
    }
  }

  return style;
}

interface Props {
  phrase: Phrase;
  colourMap: Record<number, string | undefined>;
}

/**
 * The strategy here is as follows: Record all "start" and "end" attributes of
 * feature/lexeme matches as points where the rendering behaviour must change,
 * Then create  the dict determining the map from slice start points to a list of colours
 * Lastly, render the slices in a for loop, using the utility to generate gradients
 */
const HighlightedPhrase = ({
  phrase,
  colourMap: observableColourMap,
}: Props) => {
  // NOTE 20/09/20 psacawa: broken lodash typing returns Collection<boolean>
  let matches: TokenSpan[] = _([phrase.feature_matches, phrase.lexeme_matches])
    .filter((arr) => arr !== undefined)
    .flatten()
    .value() as TokenSpan[];
  let breakpoints: number[] = _(matches)
    .flatMap((m) => [m.start, m.end] as number[])
    .concat([0])
    .uniq()
    .sort((a, b) => a - b) // sort numerically, not lexicographically, the JS default
    .value();
  let locationColourMap = createColourMap(
    phrase,
    breakpoints,
    observableColourMap
  );
  // logger({ phrase, breakpoints, locationColourMap });
  return (
    <>
      {breakpoints.slice(0, -1).map((point, idx) => {
        let colours = locationColourMap.get(point)!;
        return colours.length ? (
          <span key={idx} style={getMatchStyle(colours)}>
            {phrase.text.slice(breakpoints[idx], breakpoints[idx + 1])}
          </span>
        ) : (
          phrase.text.slice(breakpoints[idx], breakpoints[idx + 1])
        );
      })}
    </>
  );
};

export default HighlightedPhrase;
