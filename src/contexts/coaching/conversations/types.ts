import speech, { protos } from '@google-cloud/speech';

export type StreamingRecognitionConfig = protos.google.cloud.speech.v1.IStreamingRecognitionConfig;

export type StreamingRecognizeResponse = protos.google.cloud.speech.v1.StreamingRecognizeResponse;

/* export interface SpeechRecognitionData {
  results: protos.google.cloud.speech.v1.IStreamingRecognitionResult[];
  speechAdaptationInfo: protos.google.cloud.speech.v1.ISpeechAdaptationInfo;
  requestId: string;
} */
