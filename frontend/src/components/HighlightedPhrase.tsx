import React, { Fragment } from "react";

import { Phrase } from "../types";

interface Props {
  phrase: Phrase;
}

const HighlightedPhrase = ({ phrase }: Props) => {
  const matches = phrase.lexeme_matches!;
  const text = phrase.text;
  return (
    <>
      {text.slice(0, matches[0].start)}
      {matches.map((span, idx) => (
        <Fragment key={idx}>
          <span style={{ color: "red" }}>
            {text.slice(span.start, span.end)}
          </span>
          {text.slice(
            span.end,
            (idx !== matches.length - 1 && matches[idx + 1].start) || undefined
          )}
        </Fragment>
      ))}
    </>
  );
};

export default HighlightedPhrase;
