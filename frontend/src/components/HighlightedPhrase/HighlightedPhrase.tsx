import { sortBy } from "lodash";
import React, { Fragment } from "react";
import { Phrase, TokenSpan } from "types";

interface Props {
  phrase: Phrase;
  colourMap: Record<number, string | undefined>;
}

const HighlightedPhrase = ({ phrase, colourMap }: Props) => {
  const lexemeMatches = sortBy(phrase.lexeme_matches!, (match) => match.start);
  const featureMatches = sortBy(
    phrase.feature_matches!,
    (match) => match.start
  );
  const text = phrase.text;

  // merge match lists
  let matches: TokenSpan[] = [];
  let [i, j] = [0, 0];
  while (i !== lexemeMatches.length && j !== featureMatches.length) {
    if (lexemeMatches[i].start < featureMatches[j].start) {
      matches.push(lexemeMatches[i++]);
    } else if (lexemeMatches[i].start > featureMatches[j].start) {
      matches.push(featureMatches[j++]);
    } else {
      // in this case, both types of matches occur, and we highlight only the lexeme
      matches.push(lexemeMatches[i++]);
      j++;
    }
  }
  // add unused matches
  matches = [...matches, ...lexemeMatches.slice(i), ...featureMatches.slice(j)];

  return (
    <>
      {matches.length > 0 ? (
        <>
          {text.slice(0, matches[0].start)}
          {matches.map((span, idx) => {
            let colour = colourMap[(span.lexeme ?? span.feature) as number];
            return (
              <Fragment key={idx}>
                <span style={{ backgroundColor: colour, borderRadius: "3px" }}>
                  {text.slice(span.start, span.end)}
                </span>
                {text.slice(
                  span.end,
                  (idx !== matches.length - 1 && matches[idx + 1].start) ||
                    undefined
                )}
              </Fragment>
            );
          })}
        </>
      ) : (
        <>{text}</>
      )}
    </>
  );
};

export default HighlightedPhrase;
