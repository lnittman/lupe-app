import { getTransport } from 'tone';

export class GridClock {
  private barDuration: number;
  private gridSize = 32; // Number of squares per view
  private transport: ReturnType<typeof getTransport>;

  constructor(transport: ReturnType<typeof getTransport>, bpm: number) {
    this.transport = transport;
    this.barDuration = (60 / bpm) * 4;
  }

  // Convert grid position to time in seconds
  gridToTime(gridPosition: number): number {
    return gridPosition * (this.barDuration / 4); // Each grid square is 1/4 bar
  }

  // Convert time to grid position
  timeToGrid(time: number): number {
    return Math.floor(time / (this.barDuration / 4));
  }

  // Get current grid position
  getCurrentGridPosition(): number {
    return this.timeToGrid(this.transport.seconds);
  }

  // Calculate next valid grid position for loop start
  getNextGridPosition(currentPosition: number): number {
    return Math.floor(currentPosition / this.gridSize) * this.gridSize;
  }

  // Update BPM and recalculate timing
  updateBPM(bpm: number): void {
    this.barDuration = (60 / bpm) * 4;
  }

  // Calculate loop points that align with grid
  calculateLoopPoints(startGrid: number, lengthInSquares: number): {
    startTime: number;
    endTime: number;
    startBar: number;
    endBar: number;
  } {
    const startTime = this.gridToTime(startGrid);
    const endTime = this.gridToTime(startGrid + lengthInSquares);
    
    return {
      startTime,
      endTime,
      startBar: Math.floor(startGrid / 4),
      endBar: Math.ceil((startGrid + lengthInSquares) / 4)
    };
  }
}
