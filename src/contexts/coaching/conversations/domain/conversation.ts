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
  analized: boolean;
  createdAt: Date;
}

function parseTimePosition(time: { nanos?: number | null; seconds?: number | Long | string | null }): TimePosition {
  const nanos = time.nanos || 0;
  const seconds = time.seconds || 0;

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

export function getParagraphs(alternative: SpeechRecognitionAlternative): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (alternative.words && alternative.words.length === 0) {
    return paragraphs;
  }

  let speakerLabel = alternative.words![0].speakerTag!.toString();

  let paragraph: Paragraph = {
    id: uuid(),
    speakerLabel,
    words: [],
    analized: false,
    createdAt: new Date(),
  };

  alternative.words!.forEach((word) => {
    const starts = parseTimePosition(word.startTime!);
    const ends = parseTimePosition(word.endTime!);

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
        analized: false,
        createdAt: new Date(),
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
  // recognitionRequestId: string;
  paragraphs: Paragraph[];
}

export default Conversation;
