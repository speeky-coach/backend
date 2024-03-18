import { v4 as uuid } from 'uuid';
import { SpeechRecognitionAlternative } from '../types';

export interface TimePosition {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

export interface Word {
  value: string;
  starts: TimePosition;
  ends: TimePosition;
}

export interface Paragraph {
  id: string;
  speakerLabel: string;
  words: Word[];
}

function parseTimePosition(
  time: { nanos?: number | null; seconds?: number | Long | string | null },
  offsetTime: number,
): TimePosition {
  const nanos = Number(time.nanos || 0);
  const seconds = Number(time.seconds || 0) + offsetTime;

  const hour = Math.floor(Number(seconds) / 3600);
  const minute = Math.floor((Number(seconds) - hour * 3600) / 60);
  const second = Number(seconds) - hour * 3600 - minute * 60;
  const millisecond = nanos / 1000000;

  return {
    hour,
    minute,
    second,
    millisecond,
  };
}

export function getParagraphs(alternative: SpeechRecognitionAlternative, offsetTime: number): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (alternative.words && alternative.words.length === 0) {
    return paragraphs;
  }

  let speakerLabel = alternative.words![0].speakerTag!.toString();

  let paragraph: Paragraph = {
    id: uuid(),
    speakerLabel,
    words: [],
  };

  alternative.words!.forEach((word) => {
    const starts = parseTimePosition(word.startTime!, offsetTime);
    const ends = parseTimePosition(word.endTime!, offsetTime);

    if (word.speakerTag?.toString() !== speakerLabel) {
      speakerLabel = word.speakerTag!.toString();

      paragraph.words.push({
        value: word.word!,
        starts,
        ends,
      });

      paragraphs.push(paragraph);

      paragraph = {
        id: uuid(),
        speakerLabel,
        words: [],
      };
    } else {
      paragraph.words.push({
        value: word.word!,
        starts,
        ends,
      });
    }
  });

  paragraphs.push(paragraph);

  return paragraphs;
}

interface Conversation {
  id: string;
  uuid: string;
  paragraphs: Paragraph[];
}

export default Conversation;
