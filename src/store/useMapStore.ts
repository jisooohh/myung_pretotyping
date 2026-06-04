'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Tag = '진로' | '관계' | '상담';

export type MapFlow =
  | 'map'
  | 'loading'
  | 'career' | 'scenario' | 'result'
  | 'relation' | 'compat' | 'chatsim'
  | 'counsel';

export type ReportType = 'result' | 'compat' | 'counsel';

export interface WorryNode {
  id: string;
  kind: Tag;
  label: string;
  worry: string;
  reportType: ReportType;
  selected: boolean;     // confirmed (선택 확정) vs explored-but-unselected
  decision?: string;
  scenarioText?: string;
  parentId?: string;
  scenarioPicks?: Record<number, number>;
  choiceId?: number;
  nodeType?: 'worry' | 'scenario-branch';
  createdAt: number;
}

const reportFor = (tag: Tag): ReportType =>
  tag === '관계' ? 'compat' : tag === '상담' ? 'counsel' : 'result';

const entryFor = (tag: Tag): MapFlow =>
  tag === '관계' ? 'relation' : tag === '상담' ? 'counsel' : 'career';

const shortLabel = (worry: string): string => {
  const t = worry.trim().replace(/\s+/g, ' ');
  if (!t) return '새 고민';
  return t.length > 12 ? t.slice(0, 12) + '…' : t;
};

interface ScenarioOption {
  label: string;
  scenario: string;
}

const CAREER_EXPECTED_SCENARIOS = [
  {
    label: '프리랜서',
    scenarioText: '지금 프리랜서로 전향한다 · 빠른 독립 · 火의 추진력 흐름',
  },
  {
    label: '6개월 준비',
    scenarioText: '6개월 더 준비하며 병행한다 · 뿌리를 다지는 안정형 흐름',
  },
  {
    label: '기획 전환',
    scenarioText: '기획 직군으로 전환한다 · 개발 경험을 무기로 쓰는 변화형',
  },
];

interface MapStore {
  flow: MapFlow;
  worry: string;
  tag: Tag | null;
  simKind: string;
  nodes: WorryNode[];
  activeNodeId: string | null;

  setFlow: (flow: MapFlow) => void;
  enterActiveFlow: () => void;
  startFlow: (tag: Tag, worry: string) => void;
  openNode: (id: string) => void;
  confirmNode: (decision?: string) => void;
  saveUnselectedScenarioOptions: (picks: Record<number, number>, choices: Array<{ id: number; opts: ScenarioOption[] }>) => void;
  saveRelationSimulation: (decision: string) => void;
  setSimKind: (kind: string) => void;
  resetFlow: () => void;
  removeNode: (id: string) => void;
  clearNodes: () => void;
}

const SESSION = { flow: 'map' as MapFlow, worry: '', tag: null as Tag | null, activeNodeId: null as string | null };

export const useMapStore = create<MapStore>()(
  persist(
    (set, get) => ({
      ...SESSION,
      simKind: '연애',
      nodes: [],

      setFlow: (flow) => set({ flow }),

      enterActiveFlow: () => {
        const { tag } = get();
        if (!tag) {
          set({ flow: 'map' });
          return;
        }
        set({ flow: entryFor(tag) });
      },

      // A worry is saved as an UNSELECTED node the moment exploration starts,
      // so it persists on the map (gray/dashed) even if never confirmed.
      startFlow: (tag, worry) => {
        const { nodes } = get();
        const dupe = nodes.find((n) => !n.selected && n.kind === tag && n.worry === worry);
        if (dupe) {
          set({ tag, worry, activeNodeId: dupe.id, flow: 'loading' });
          return;
        }
        const node: WorryNode = {
          id: `n_${Date.now().toString(36)}`,
          kind: tag,
          label: shortLabel(worry),
          worry,
          reportType: reportFor(tag),
          selected: false,
          nodeType: 'worry',
          createdAt: Date.now(),
        };
        set({ nodes: [...nodes, node], tag, worry, activeNodeId: node.id, flow: 'loading' });
      },

      // Open an existing node — selected ones show their report; unselected ones
      // open so the user can confirm ("이 선택으로 확정").
      openNode: (id) => {
        const node = get().nodes.find((n) => n.id === id);
        if (!node) return;
        const flow = !node.selected && node.kind === '진로' ? 'scenario' : node.reportType;
        set({ tag: node.kind, worry: node.worry, activeNodeId: id, flow });
      },

      confirmNode: (decision) => {
        const { activeNodeId, nodes } = get();
        set({
          nodes: nodes.map((n) => (n.id === activeNodeId ? { ...n, selected: true, decision: decision ?? n.decision } : n)),
          ...SESSION,
        });
      },

      saveUnselectedScenarioOptions: (picks, choices) => {
        const { activeNodeId, nodes, tag, worry } = get();
        if (!activeNodeId || tag !== '진로') return;

        const active = nodes.find((n) => n.id === activeNodeId);
        if (!active) return;

        let nextNodes = nodes
          .filter((n) => n.parentId !== activeNodeId || n.selected)
          .map((n) =>
            n.id === activeNodeId
              ? { ...n, scenarioPicks: picks, decision: choices.map((c) => c.opts[picks[c.id]]?.label).filter(Boolean).join(' · ') }
              : n
          );

        for (const [scenarioIndex, scenario] of CAREER_EXPECTED_SCENARIOS.entries()) {
          const existing = nextNodes.find(
            (n) =>
              !n.selected &&
              n.parentId === activeNodeId &&
              n.choiceId === scenarioIndex &&
              n.decision === scenario.label
          );

          if (existing) {
            nextNodes = nextNodes.map((n) =>
              n.id === existing.id
                ? { ...n, scenarioPicks: picks, worry, label: scenario.label, scenarioText: scenario.scenarioText }
                : n
            );
            continue;
          }

          nextNodes = [
            ...nextNodes,
            {
              id: `n_${Date.now().toString(36)}_expected_${scenarioIndex}`,
              kind: '진로',
              label: scenario.label,
              worry,
              reportType: 'result',
              selected: false,
              decision: scenario.label,
              scenarioText: scenario.scenarioText,
              parentId: activeNodeId,
              scenarioPicks: picks,
              choiceId: scenarioIndex,
              nodeType: 'scenario-branch',
              createdAt: Date.now(),
            },
          ];
        }

        set({ nodes: nextNodes });
      },

      saveRelationSimulation: (decision) => {
        const { activeNodeId, nodes } = get();
        if (!activeNodeId) return;
        set({
          nodes: nodes.map((n) =>
            n.id === activeNodeId
              ? { ...n, selected: true, decision, label: shortLabel(decision), nodeType: 'worry' }
              : n
          ),
        });
      },

      setSimKind: (simKind) => set({ simKind }),

      resetFlow: () => set({ ...SESSION }),

      removeNode: (id) => set((s) => ({ nodes: s.nodes.filter((n) => n.id !== id) })),

      clearNodes: () => set({ nodes: [], ...SESSION }),
    }),
    {
      name: 'myung-ai-map',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ nodes: s.nodes, simKind: s.simKind }),
    }
  )
);

export const activeNodeSelector = (s: MapStore): WorryNode | undefined =>
  s.nodes.find((n) => n.id === s.activeNodeId);
