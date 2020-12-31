import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HighlightedPhrase from "../components/HighlightedPhrase";
import { Phrase } from "../types";

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
const match = phrase.lexeme_matches![0];

describe("HighlightedPhrase", () =>
  it("highlights multiple spans", async () => {
    const result = render(<HighlightedPhrase phrase={phrase} />);
    expect(result.container.textContent).toInclude(phrase.text);
    const charSpan = phrase.text.slice(
      phrase.lexeme_matches![0].start,
      phrase.lexeme_matches![0].end
    );
    expect(screen.queryByText(charSpan));
    expect(screen.queryByText(charSpan)?.style.color).toBe("red");
  }));
