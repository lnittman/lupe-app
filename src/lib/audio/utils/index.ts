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

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = numOfChan * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = length;

  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length minus RIFF identifier length and file description length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numOfChan, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, byteRate, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitsPerSample, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);

  // Write the PCM samples
  const offset = 44;
  let pos = offset;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      // Clamp between -1 and 1
      const clampedSample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer
      const int16 = clampedSample < 0 
        ? clampedSample * 0x8000 
        : clampedSample * 0x7FFF;
      view.setInt16(pos, int16, true);
      pos += 2;
    }
  }

  return arrayBuffer;
}
