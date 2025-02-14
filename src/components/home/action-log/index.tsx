import { format } from "date-fns";
import { motion } from "framer-motion";

import { useAudioStore } from "@/store";
import { Action, SystemActionType, UserActionType } from "@/types/action";

function getActionMessage(action: Action): string {
  switch (action.type) {
    case SystemActionType.BPMChanged:
      return `BPM set to ${action.bpm}`;
    case SystemActionType.StemAdded:
      return `added ${action.stem} stem`;
    case SystemActionType.StemSplit:
      return `splitting stems for ${action.filename}`;
    case UserActionType.BPMChanged:
      return `BPM set to ${action.bpm}`;
    case UserActionType.PlaybackStarted:
      return 'playback started';
    case UserActionType.PlaybackStopped:
      return 'playback stopped';
    case UserActionType.PlaybackRateChanged:
      return `playback rate set to ${action.rate}x`;
    case UserActionType.StemMuted:
      return `muted ${action.stem}`;
    case UserActionType.StemUnmuted:
      return `unmuted ${action.stem}`;
    case UserActionType.StemVolumeChanged:
      return `${action.stem} volume set to ${Math.round(action.volume * 100)}%`;
    case UserActionType.StemLoopChanged:
      return `${action.stem} loop changed to ${action.loopStart}:${action.loopLength}`;
    case UserActionType.StemReversed:
      return `${action.stem} playback ${action.reversed ? 'reversed' : 'normal'}`;
    case SystemActionType.Exited:
      return 'exited player';
    default:
      return '';
  }
}

export function ActionLog() {
  const actions = useAudioStore(state => state.actions);

  return (
    <div className="fixed left-4 right-4 h-[200px] bg-white font-mono text-xs border border-black overflow-y-auto">
      <div className="max-w-[1400px] mx-auto w-full px-3 mt-1">
        {actions.map((action) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mb-2"
          >
            <div className="text-neutral-500">
              {format(action.timestamp, 'HH:mm:ss.SSS')}
            </div>

            <div className="flex items-center gap-2">
              <span className="uppercase text-black font-mono">
                {Object.values(SystemActionType).includes(action.type as SystemActionType) ? 'SYSTEM' : action.type}
              </span>

              <span className="text-neutral-600">{getActionMessage(action)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
