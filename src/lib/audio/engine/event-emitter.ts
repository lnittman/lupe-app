import type { EventCallback, EventMap } from "@/types/audio";

export class EventEmitter {
  private events: { [K in keyof EventMap]?: EventCallback<EventMap[K]>[] } = {};

  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]?.push(callback);
  }

  off<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event]?.filter(cb => cb !== callback);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    if (!this.events[event]) return;
    this.events[event]?.forEach(callback => callback(data));
  }

  removeAllListeners(): void {
    this.events = {};
  }
} 