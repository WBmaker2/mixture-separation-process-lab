import type { ProcessOutcome, RuleContext } from './contracts';
import { applyPreparationAction } from './rules/preparation';
import { applySeparationAction } from './rules/separation';

export function applyProcessStep(context: RuleContext): ProcessOutcome {
  switch (context.step.actionId) {
    case 'add-water':
    case 'wait-for-layers':
      return applyPreparationAction(context);
    case 'sieve':
    case 'layer-separation':
    case 'filtration':
    case 'virtual-evaporation':
      return applySeparationAction(context);
  }
}
