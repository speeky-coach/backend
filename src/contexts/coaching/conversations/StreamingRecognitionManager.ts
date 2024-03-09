// based on https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/speech/infiniteStreaming.js#L94

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
  private restartTimeout: NodeJS.Timeout | null = null;

  constructor(socket: Socket, conversationUuid: string) {
    this.socket = socket;
    this.conversationUuid = conversationUuid;
    const self = this;
    this.audioInputStreamTransform = new Writable({
      write(chunk: Buffer, encoding, next) {
        console.log('audioInputStreamTransform::write - start');

        if (self.newStream && self.lastAudioInput.length !== 0) {
          console.log('audioInputStreamTransform::write - is a newStream');
          console.log('audioInputStreamTransform::write - lastAudioInput.length', self.lastAudioInput.length);

          // Approximate math to calculate time of chunks
          const chunkTime = streamingLimit / self.lastAudioInput.length;
          console.log('audioInputStreamTransform::write - chunkTime', chunkTime);

          if (chunkTime !== 0) {
            console.log('audioInputStreamTransform::write - bridgingOffset', self.bridgingOffset);
            if (self.bridgingOffset < 0) {
              self.bridgingOffset = 0;
            }

            console.log('audioInputStreamTransform::write - finalRequestEndTime', self.finalRequestEndTime);
            if (self.bridgingOffset > self.finalRequestEndTime) {
              self.bridgingOffset = self.finalRequestEndTime;
            }

            const chunksFromMS = Math.floor((self.finalRequestEndTime - self.bridgingOffset) / chunkTime);
            console.log('audioInputStreamTransform::write - chunksFromMS', chunksFromMS);
            self.bridgingOffset = Math.floor((self.lastAudioInput.length - chunksFromMS) * chunkTime);
            console.log('audioInputStreamTransform::write - bridgingOffset', self.bridgingOffset);

            for (let i = chunksFromMS; i < self.lastAudioInput.length; i++) {
              self.recognizeStream!.write(self.lastAudioInput[i]);
            }
          }

          self.newStream = false;
        }

        console.log('audioInputStreamTransform::write - push chunk to audioInput');
        self.audioInput.push(chunk);

        if (self.recognizeStream) {
          console.log('audioInputStreamTransform::write - write chunk to recognizeStream');
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
    this.startStream();
  }

  private speechCallback(data: StreamingRecognizeResponse) {
    console.log('on streamingRecognize data');

    const result = data.results[0];
    const { isFinal, alternatives, resultEndTime } = result;

    // Convert API result end time from seconds + nanoseconds to milliseconds
    this.resultEndTime =
      (resultEndTime!.seconds! as number) * 1000 + Math.round((resultEndTime!.nanos! as number) / 1000000);

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
      .on('data', this.speechCallback.bind(this));

    // Restart stream when streamingLimit expires and save it to be deleted when the streaming is ended
    this.restartTimeout = setTimeout(this.restartStream.bind(this), streamingLimit);
    // setTimeout(this.restartStream.bind(this), streamingLimit);
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

    console.log('RESTARTING REQUEST');

    this.newStream = true;

    this.startStream();
  }

  public write(data: ArrayBuffer) {
    console.log('StreamingRecognitionManager::write - start');
    if (this.recognizeStream) {
      console.log('StreamingRecognitionManager::write - this.recognizeStream exists');
      this.audioInputStreamTransform.write(data);
    }
  }

  public end() {
    console.log('StreamingRecognitionManager::end - start');
    if (this.recognizeStream) {
      console.log('StreamingRecognitionManager::end - this.recognizeStream exists');
      this.audioInputStreamTransform.end();
    }

    if (this.restartTimeout) {
      console.log('StreamingRecognitionManager::end - this.restartTimeout exists');
      clearTimeout(this.restartTimeout);
    }
  }
}

export default StreamingRecognitionManager;
