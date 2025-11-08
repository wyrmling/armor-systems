import React from 'react';
import { InjuryResult } from '../../combat';

interface InjuryResultDisplayProps {
  injuryResult: InjuryResult;
}

export function InjuryResultDisplay({ injuryResult }: InjuryResultDisplayProps) {
  return (
    <div className="mt-2 p-2 bg-background/50 rounded border-l-4 border-red-500">
      <div className="text-sm font-medium text-red-400 mb-1">
        🩸 {injuryResult.description}
      </div>
      <div className="text-xs space-y-1">
        <div>HP: {injuryResult.newHP}/{injuryResult.maxHP} (потеря: -{injuryResult.hpLoss})</div>
        {injuryResult.isMajorWound && (
          <div className="text-red-400 font-medium">⚠️ Major Wound (больше 1/2 максимальных HP)</div>
        )}
        {injuryResult.shockPenalty > 0 && (
          <div className="text-yellow-400">⚡ Шок: -{injuryResult.shockPenalty} на следующий ход</div>
        )}
        {injuryResult.conditions.map((condition, idx) => (
          <div key={idx} className="text-orange-400">{condition}</div>
        ))}
      </div>
    </div>
  );
}