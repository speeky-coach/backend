import { Writable } from "stream";
import speech /* , { v1p1beta1 } */ from "@google-cloud/speech";
import {
  StreamingRecognitionConfig,
  StreamingRecognizeResponse,
} from "./types";

const logger = (message: string, data?: any) => {
  if (false) {
    console.log("RecognitionManagerStream::" + message, data);
  }
};

const streamingLimit = 10_000;

const request: StreamingRecognitionConfig = {
  config: {
    enableWordTimeOffsets: true,
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "en-US",
    enableAutomaticPunctuation: true,
    // https://cloud.google.com/speech-to-text/docs/multiple-voices
    // enableSpeakerDiarization: true,
  },
  interimResults: true, // Enable interim results for real-time transcription
  singleUtterance: false, // Do not stop after the first utterance
};

type OnDateCallback = (
  response: StreamingRecognizeResponse,
  context: RecognitionManagerStream
) => void;

interface RecognitionManagerStreamOptions {
  onData: OnDateCallback;
  onRestart?: (context: RecognitionManagerStream) => void;
}

class RecognitionManagerStream extends Writable {
  public newStream: boolean = true;
  public lastAudioInput: Buffer[] = [];
  public bridgingOffset: number = 0;
  public finalRequestEndTime: number = 0;
  public recognizeStream: Writable | null = null;
  public audioInput: Buffer[] = [];
  public client = new speech.SpeechClient();
  public resultEndTime: number = 0;
  public restartCounter: number = 0;
  public isFinalEndTime: number = 0;
  public lastTranscriptWasFinal: boolean = false;
  public restartTimeout: NodeJS.Timeout | null = null;
  private onData: OnDateCallback;

  constructor(options: RecognitionManagerStreamOptions) {
    super();
    const { onData } = options;

    this.onData = onData;

    this.startStream();
  }

  public _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): void {
    logger("_write - chunk", chunk);
    logger("_write - encoding", encoding);

    if (this.newStream && this.lastAudioInput.length !== 0) {
      logger("write - is a newStream");
      logger("write - lastAudioInput.length", this.lastAudioInput.length);

      // Approximate math to calculate time of chunks
      const chunkTime = streamingLimit / this.lastAudioInput.length;
      logger("write - chunkTime", chunkTime);

      if (chunkTime !== 0) {
        logger("write - bridgingOffset", this.bridgingOffset);
        if (this.bridgingOffset < 0) {
          this.bridgingOffset = 0;
        }

        logger("write - finalRequestEndTime", this.finalRequestEndTime);
        if (this.bridgingOffset > this.finalRequestEndTime) {
          this.bridgingOffset = this.finalRequestEndTime;
        }

        const chunksFromMS = Math.floor(
          (this.finalRequestEndTime - this.bridgingOffset) / chunkTime
        );
        logger("write - chunksFromMS", chunksFromMS);
        this.bridgingOffset = Math.floor(
          (this.lastAudioInput.length - chunksFromMS) * chunkTime
        );
        logger("write - bridgingOffset", this.bridgingOffset);

        for (let i = chunksFromMS; i < this.lastAudioInput.length; i++) {
          this.recognizeStream!.write(this.lastAudioInput[i]);
        }
      }

      this.newStream = false;
    }

    logger("write - push chunk to audioInput");
    this.audioInput.push(chunk);

    if (this.recognizeStream) {
      logger("write - write chunk to recognizeStream");
      this.recognizeStream.write(chunk);
    }

    callback();
  }

  public _final(callback: (error?: Error | null) => void): void {
    logger("_final");

    if (this.recognizeStream) {
      this.recognizeStream.end();
    }

    if (this.restartTimeout) {
      logger("_final - this.restartTimeout exists");
      clearTimeout(this.restartTimeout);
    }

    callback();
  }

  private handleData(response: StreamingRecognizeResponse) {
    logger("handleData - start");

    const result = response.results[0];
    const { isFinal, alternatives } = result;

    if (alternatives && isFinal) {
      this.isFinalEndTime = this.resultEndTime;
      this.lastTranscriptWasFinal = true;
    } else {
      this.lastTranscriptWasFinal = false;
    }

    this.onData(response, this);
  }

  private startStream() {
    this.audioInput = [];
    this.recognizeStream = this.client
      .streamingRecognize(request)
      .on("error", (err: any) => {
        if (err.code === 11) {
          // restartStream();
          console.error("API request error 11");
        } else {
          console.error("API request error " + err);
        }
      })
      .on("data", this.handleData.bind(this));

    // Restart stream when streamingLimit expires and save it to be deleted when the streaming is ended
    this.restartTimeout = setTimeout(
      this.restartStream.bind(this),
      streamingLimit
    );
  }

  private restartStream() {
    if (this.recognizeStream) {
      this.recognizeStream.end();
      this.recognizeStream.removeListener("data", this.handleData.bind(this));
      this.recognizeStream = null;
    }

    if (this.resultEndTime > 0) {
      this.finalRequestEndTime = this.isFinalEndTime;
    }

    this.resultEndTime = 0;

    this.lastAudioInput = [];
    this.lastAudioInput = this.audioInput;

    this.restartCounter++;

    console.log("RESTARTING REQUEST");

    this.newStream = true;

    this.startStream();
  }
}

export default RecognitionManagerStream;
