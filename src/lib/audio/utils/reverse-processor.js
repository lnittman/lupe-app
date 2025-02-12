class ReverseProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    
    for (let channel = 0; channel < input.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      
      // Reverse the audio by writing samples in reverse order
      for (let i = 0; i < inputChannel.length; i++) {
        outputChannel[i] = inputChannel[inputChannel.length - 1 - i];
      }
    }
    return true;
  }
}

registerProcessor('reverse-processor', ReverseProcessor); 