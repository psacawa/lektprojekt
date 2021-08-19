import { render, screen } from "@testing-library/react";
import React from "react";
import { Phrase } from "types";

import HighlightedPhrase from "./HighlightedPhrase";

const phrase: Phrase = {
  id: 264,
  text: "Había hablado con los vecinos, pero no me hicieron caso.",
  lexeme_matches: [
    {
      number: 6,
      start: 31,
      end: 35,
    },
  ],
} as Phrase;

const colourMap = { "264": "red" };

describe("HighlightedPhrase", () => {
  it("renders", () => {
    const result = render(
      <HighlightedPhrase phrase={phrase} colourMap={colourMap} />
    );
    expect(result.container.textContent).toInclude(phrase.text);

    const charSpan = phrase.text.slice(
      phrase.lexeme_matches![0].start,
      phrase.lexeme_matches![0].end
    );
    expect(screen.queryByText(charSpan)).toHaveTextContent("pero");
  });
});
