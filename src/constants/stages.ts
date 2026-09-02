import type { WorkStage } from '@/types';

export const WORK_STAGES: { key: WorkStage; label: string }[] = [
  { key: 'NEW', label: 'New' },
  { key: 'REQUIREMENTS', label: 'Requirements' },
  { key: 'DESIGN', label: 'Design' },
  { key: 'DESIGN_QC', label: 'Design QC' },
  { key: 'CLIENT_APPROVAL', label: 'Client Approval' },
  { key: 'DEVELOPMENT', label: 'Development' },
  { key: 'DEVELOPMENT_QC', label: 'Development QC' },
  { key: 'FINAL_PAYMENT', label: 'Final Payment' },
  { key: 'DEPLOYMENT', label: 'Deployment' },
  { key: 'ONE_MONTH_SUPPORT', label: '1-Month Support' },
  { key: 'COMPLETED', label: 'Completed' },
];

export function getStageIndex(stage: WorkStage): number {
  return WORK_STAGES.findIndex((s) => s.key === stage);
}

export function getStageLabel(stage: WorkStage): string {
  return WORK_STAGES.find((s) => s.key === stage)?.label || stage;
}
