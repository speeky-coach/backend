import { Writable } from 'stream';
import speech, { protos, v1p1beta1 } from '@google-cloud/speech';
import { StreamingRecognitionConfig, StreamingRecognizeResponse } from './types';
import { Socket } from 'socket.io';
import { getParagraphs } from './domain/conversation';

const streamingLimit = 10_000;

const request: StreamingRecognitionConfig = {
  config: {
    enableWordTimeOffsets: true,
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    languageCode: 'en-US',
    enableAutomaticPunctuation: true,
    // https://cloud.google.com/speech-to-text/docs/multiple-voices
    // enableSpeakerDiarization: true,
  },
  interimResults: true, // Enable interim results for real-time transcription
  singleUtterance: false, // Do not stop after the first utterance
};

class StreamingRecognitionManager {
  private newStream: boolean = true;
  private lastAudioInput: Buffer[] = [];
  private bridgingOffset: number = 0;
  private finalRequestEndTime: number = 0;
  private recognizeStream: Writable | null = null;
  private audioInput: Buffer[] = [];
  private client = new speech.SpeechClient();
  private audioInputStreamTransform: Writable;
  private resultEndTime: number = 0;
  private restartCounter: number = 0;
  private isFinalEndTime: number = 0;
  private lastTranscriptWasFinal: boolean = false;
  private socket: Socket;
  private conversationUuid: string;

  constructor(socket: Socket, conversationUuid: string) {
    this.socket = socket;
    this.conversationUuid = conversationUuid;
    const self = this;
    this.audioInputStreamTransform = new Writable({
      write(chunk: Buffer, encoding, next) {
        if (self.newStream && self.lastAudioInput.length !== 0) {
          // Approximate math to calculate time of chunks
          const chunkTime = streamingLimit / self.lastAudioInput.length;

          if (chunkTime !== 0) {
            if (self.bridgingOffset < 0) {
              self.bridgingOffset = 0;
            }
            if (self.bridgingOffset > self.finalRequestEndTime) {
              self.bridgingOffset = self.finalRequestEndTime;
            }
            const chunksFromMS = Math.floor((self.finalRequestEndTime - self.bridgingOffset) / chunkTime);
            self.bridgingOffset = Math.floor((self.lastAudioInput.length - chunksFromMS) * chunkTime);

            for (let i = chunksFromMS; i < self.lastAudioInput.length; i++) {
              self.recognizeStream!.write(self.lastAudioInput[i]);
            }
          }
          self.newStream = false;
        }

        self.audioInput.push(chunk);

        if (self.recognizeStream) {
          self.recognizeStream.write(chunk);
        }

        next();
      },

      final() {
        if (self.recognizeStream) {
          self.recognizeStream.end();
        }
      },
    });
  }

  private startStream() {
    // Clear current audioInput
    this.audioInput = [];
    // Initiate (Reinitiate) a recognize stream
    this.recognizeStream = this.client
      .streamingRecognize(request)
      .on('error', (err: any) => {
        if (err.code === 11) {
          // restartStream();
          console.error('API request error 11');
        } else {
          console.error('API request error ' + err);
        }
      })
      .on('data', this.speechCallback);

    // Restart stream when streamingLimit expires
    setTimeout(this.restartStream, streamingLimit);
  }

  private speechCallback(data: StreamingRecognizeResponse) {
    /* // Convert API result end time from seconds + nanoseconds to milliseconds
    this.resultEndTime =
      data.results[0].resultEndTime.seconds * 1000 + Math.round(data.results[0].resultEndTime.nanos / 1000000);

    // Calculate correct time based on offset from audio sent twice
    const correctedTime = this.resultEndTime - this.bridgingOffset + streamingLimit * this.restartCounter; */

    /* process.stdout.clearLine();
    process.stdout.cursorTo(0);
    let stdoutText = '';
    if (data.results[0] && data.results[0].alternatives[0]) {
      stdoutText = correctedTime + ': ' + data.results[0].alternatives[0].transcript;
    } */

    /* if (data.results[0].isFinal) {
      process.stdout.write(chalk.green(`${stdoutText}\n`));

      this.isFinalEndTime = this.resultEndTime;
      this.lastTranscriptWasFinal = true;
    } else {
      // Make sure transcript does not exceed console character length
      if (stdoutText.length > process.stdout.columns) {
        stdoutText = stdoutText.substring(0, process.stdout.columns - 4) + '...';
      }
      process.stdout.write(chalk.red(`${stdoutText}`));

      this.lastTranscriptWasFinal = false;
    } */

    console.log('on streamingRecognize data');

    const result = data.results[0];
    const { isFinal, alternatives, resultEndTime } = result;

    // Convert API result end time from seconds + nanoseconds to milliseconds
    this.resultEndTime =
      (resultEndTime!.seconds! as number) * 1000 + Math.round((resultEndTime!.nanos! as number) / 1000000);

    // Calculate correct time based on offset from audio sent twice
    // const correctedTime = this.resultEndTime - this.bridgingOffset + streamingLimit * this.restartCounter;

    if (alternatives) {
      const { transcript } = alternatives[0];

      this.socket.emit('incoming-message-transcripted', {
        conversationUuid: this.conversationUuid,
        incomingMessage: transcript,
      });
    }

    if (alternatives && isFinal) {
      const paragraphs = getParagraphs(alternatives[0]);

      this.socket.emit('paragraphs-transcripted', { conversationUuid: this.conversationUuid, paragraphs });

      this.isFinalEndTime = this.resultEndTime;
      this.lastTranscriptWasFinal = true;
    } else {
      this.lastTranscriptWasFinal = false;
    }
  }

  private restartStream() {
    if (this.recognizeStream) {
      this.recognizeStream.end();
      this.recognizeStream.removeListener('data', this.speechCallback);
      this.recognizeStream = null;
    }
    if (this.resultEndTime > 0) {
      this.finalRequestEndTime = this.isFinalEndTime;
    }
    this.resultEndTime = 0;

    this.lastAudioInput = [];
    this.lastAudioInput = this.audioInput;

    this.restartCounter++;

    /* if (!this.lastTranscriptWasFinal) {
      process.stdout.write('\n');
    }
    process.stdout.write(chalk.yellow(`${streamingLimit * this.restartCounter}: RESTARTING REQUEST\n`)); */

    console.log('RESTARTING REQUEST');

    this.newStream = true;

    this.startStream();
  }

  public write(data: ArrayBuffer) {
    if (this.recognizeStream) {
      this.audioInputStreamTransform.write(data);
    }
  }

  public end() {
    if (this.recognizeStream) {
      this.audioInputStreamTransform.end();
    }
  }
}

export default StreamingRecognitionManager;
