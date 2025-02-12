import type { AudioContext } from 'standardized-audio-context';

export async function base64ToAudioBuffer(base64: string, context: AudioContext): Promise<AudioBuffer> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const audioData = await context.decodeAudioData(bytes.buffer);

  return audioData;
}

function calculateTempo(peaks: number[], sampleRate: number): number {
  if (peaks.length < 2) return 120;

  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push((peaks[i] - peaks[i - 1]) / sampleRate);
  }

  const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  return 60 / averageInterval;
}

export function detectBPM(audioBuffer: AudioBuffer): number {
  const DEFAULT_BPM = 120;
  try {
    const data = audioBuffer.getChannelData(0);
    const peaks = findPeaks(data, audioBuffer.sampleRate);
    const tempo = calculateTempo(peaks, audioBuffer.sampleRate);

    return Math.round(tempo) || DEFAULT_BPM;
  } catch (err) {
    console.warn('BPM detection failed:', err);
    return DEFAULT_BPM;
  }
}

function findPeaks(data: Float32Array, sampleRate: number): number[] {
  const peaks: number[] = [];
  const threshold = 0.7;
  const minPeakDistance = Math.floor(sampleRate * 0.1);

  for (let i = 1; i < data.length - 1; i++) {
    if (
      Math.abs(data[i]) > threshold &&
      data[i] > data[i - 1] &&
      data[i] > data[i + 1] &&
      (peaks.length === 0 || i - peaks[peaks.length - 1] > minPeakDistance)
    ) {
      peaks.push(i);
    }
  }

  return peaks;
}
