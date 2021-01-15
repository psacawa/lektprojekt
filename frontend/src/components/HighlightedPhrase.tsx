import { sortBy } from "lodash";
import React, { Fragment } from "react";

import { Phrase } from "../types";

interface Props {
  phrase: Phrase;
  lexemeColourMap: Record<number, string | undefined>;
}

const HighlightedPhrase = ({ phrase, lexemeColourMap }: Props) => {
  const lexeme_matches = phrase.lexeme_matches!;
  const matches = sortBy(lexeme_matches, (match) => match.start);
  const text = phrase.text;
  return (
    <>
      {lexeme_matches.length > 0 ? (
        <>
          {text.slice(0, lexeme_matches[0].start)}
          {lexeme_matches.map((span, idx) => {
            let colour = lexemeColourMap[span.lexeme!];
            return (
              <Fragment key={idx}>
                <span style={{ backgroundColor: colour }}>
                  {text.slice(span.start, span.end)}
                </span>
                {text.slice(
                  span.end,
                  (idx !== lexeme_matches.length - 1 &&
                    lexeme_matches[idx + 1].start) ||
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
