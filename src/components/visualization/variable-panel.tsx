'use client';

import { useEffect, useState } from 'react';
import { VariableSetAccordion } from './variable-set-accordion';
import type { VariableSet } from '@/lib/types';

interface Props {
  onCombinationChange: (combination: string) => void;
}

const COMBINATION_MAP: Record<string, string> = {
  low: 'low-discount',
  mid: 'default',
  high: 'high-damage',
  extreme: 'extreme',
};

export function VariablePanel({ onCombinationChange }: Props) {
  const [sets, setSets] = useState<VariableSet[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/variables')
      .then((res) => res.json())
      .then((data: VariableSet[]) => {
        setSets(data);
        const defaults: Record<string, string> = {};
        data.forEach((set) => {
          set.subParameters.forEach((param) => {
            if (param.values.length > 0) {
              defaults[param.id] = param.values[0].id;
            }
          });
        });
        setSelections(defaults);
        setLoading(false);
      });
  }, []);

  const handleSelectionChange = (subParamId: string, valueId: string) => {
    const newSelections = { ...selections, [subParamId]: valueId };
    setSelections(newSelections);

    // 프로토타입: 첫 번째 세트의 첫 번째 파라미터 값에 따라 조합 결정
    const firstSet = sets[0];
    if (firstSet) {
      const firstParam = firstSet.subParameters[0];
      if (firstParam) {
        const selectedValueId = newSelections[firstParam.id];
        const selectedValue = firstParam.values.find(
          (v) => v.id === selectedValueId
        );
        if (selectedValue) {
          const idx = firstParam.values.indexOf(selectedValue);
          const keys = ['default', 'low-discount', 'high-damage', 'extreme'];
          onCombinationChange(keys[Math.min(idx, keys.length - 1)]);
          return;
        }
      }
    }
    onCombinationChange('default');
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        변수 데이터 로딩 중...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <VariableSetAccordion
        sets={sets}
        selections={selections}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}
