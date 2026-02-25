'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { VariableSet } from '@/lib/types';

interface Props {
  sets: VariableSet[];
  selections: Record<string, string>;
  onSelectionChange: (subParamId: string, valueId: string) => void;
}

export function VariableSetAccordion({
  sets,
  selections,
  onSelectionChange,
}: Props) {
  return (
    <TooltipProvider>
      <Accordion
        type="multiple"
        defaultValue={sets.map((s) => s.id)}
        className="w-full"
      >
        {sets.map((set) => (
          <AccordionItem key={set.id} value={set.id}>
            <AccordionTrigger className="text-sm font-semibold">
              {set.name}
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              {set.description && (
                <p className="text-xs text-muted-foreground">
                  {set.description}
                </p>
              )}
              {set.subParameters.map((param) => (
                <div key={param.id} className="space-y-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="cursor-help text-xs">
                        {param.name}
                      </Label>
                    </TooltipTrigger>
                    {param.description && (
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          {param.description}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  <Select
                    value={selections[param.id] || param.values[0]?.id}
                    onValueChange={(valueId) =>
                      onSelectionChange(param.id, valueId)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {param.values.map((v) => (
                        <SelectItem
                          key={v.id}
                          value={v.id}
                          className="text-xs"
                        >
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </TooltipProvider>
  );
}
