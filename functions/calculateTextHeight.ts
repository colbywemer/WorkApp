import { Item2, savedItem } from "../lib/types";

import wrap from "word-wrap";

function calculateLines(text: string, width: number) {
  const wrappedText = wrap(text, { width: width, cut: true });
  const lines = wrappedText.split('\n');
  return lines.length;
}

export const calculateTextHeight = (
    item: Item2 | savedItem,
    maxCharsPerLine: number,
    lineHeight = 24,
    marginTop = 8,
    marginBottom = 8
  ) => {
    let stringWords = item.item!;
    if (item !== undefined && 'bays' in item && item.bays.length !== 0) stringWords += " - ( " + item.bays.join(", ") + " )";
    const numberOfLines = calculateLines(stringWords, maxCharsPerLine);
    if(maxCharsPerLine === 34) console.log(numberOfLines);
    const textHeight = numberOfLines * lineHeight;
    const totalHeight = textHeight + marginTop + marginBottom;
    return totalHeight;
  };
