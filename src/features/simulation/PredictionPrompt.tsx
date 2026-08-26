import type { ProcessStep, OutputPortId } from '../../domain/contracts';
import { ACTIONS } from '../../domain/actions';

const questions: Record<ProcessStep['actionId'], string> = {
  sieve: '큰 자갈과 고운 모래는 통과와 잔류 중 어디에 있을까요?',
  'wait-for-layers': '기다린 뒤 물과 식용유 모형은 어떤 모습일까요?',
  'layer-separation': '식용유 모형과 물은 위층과 아래층 중 어디에 있을까요?',
  'add-water': '물을 넣으면 소금과 모래 중 무엇의 상태가 달라질까요?',
  filtration: '거른 액체와 거름 찌꺼기에는 무엇이 남을까요?',
  'virtual-evaporation': '화면 속 물 토큰이 이동한 뒤 무엇이 남을까요?',
};

export interface PredictionPromptProps { step: ProcessStep; candidatePorts: readonly OutputPortId[]; selectedPort?: OutputPortId | undefined; onSelect: (port: OutputPortId) => void; }
export function PredictionPrompt({ step, candidatePorts, selectedPort, onSelect }: PredictionPromptProps) {
  const labels: Record<OutputPortId, string> = { pass: '통과', retained: '잔류', upper: '위층', lower: '아래층', filtrate: '거른 액체', 'filter-residue': '거름 찌꺼기', mixture: '섞인 물질함', 'layered-mixture': '층이 생긴 물질함', 'vapor-model': '수증기 모형', 'solid-residue': '고체 잔류', unchanged: '변화 없음' };
  return <fieldset className="prediction-prompt"><legend>{questions[step.actionId]}</legend>{candidatePorts.map((port) => <label key={port}><input type="radio" name={`prediction-${step.id}`} value={port} checked={selectedPort === port} onChange={() => onSelect(port)} />{labels[port] ?? ACTIONS[step.actionId].name}{step.actionId === 'sieve' && port === 'retained' ? ' (자갈은 잔류)' : ''}</label>)}</fieldset>;
}
