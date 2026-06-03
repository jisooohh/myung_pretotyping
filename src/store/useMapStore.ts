'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Tag = '진로' | '관계' | '상담';

export type MapFlow =
  | 'map'
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

const scenarioNodeLabel = (scenario: string): string => {
  const t = scenario.trim().replace(/\s+/g, ' ');
  if (!t) return '예상 시나리오';
  return t.length > 24 ? t.slice(0, 24) + '…' : t;
};

interface ScenarioOption {
  label: string;
  scenario: string;
}

interface MapStore {
  flow: MapFlow;
  worry: string;
  tag: Tag | null;
  simKind: string;
  nodes: WorryNode[];
  activeNodeId: string | null;

  setFlow: (flow: MapFlow) => void;
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

      // A worry is saved as an UNSELECTED node the moment exploration starts,
      // so it persists on the map (gray/dashed) even if never confirmed.
      startFlow: (tag, worry) => {
        const { nodes } = get();
        const dupe = nodes.find((n) => !n.selected && n.kind === tag && n.worry === worry);
        if (dupe) {
          set({ tag, worry, activeNodeId: dupe.id, flow: entryFor(tag) });
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
        set({ nodes: [...nodes, node], tag, worry, activeNodeId: node.id, flow: entryFor(tag) });
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

        const alternatives = choices.flatMap((choice) =>
          choice.opts
            .map((option, optionIndex) => ({ choice, option, optionIndex }))
            .filter(({ choice, optionIndex }) => picks[choice.id] !== optionIndex)
        );

        let nextNodes = nodes
          .filter((n) => n.parentId !== activeNodeId || n.selected)
          .map((n) =>
            n.id === activeNodeId
              ? { ...n, scenarioPicks: picks, decision: choices.map((c) => c.opts[picks[c.id]]?.label).filter(Boolean).join(' · ') }
              : n
          );

        for (const alt of alternatives) {
          const scenarioPicks = { ...picks, [alt.choice.id]: alt.optionIndex };
          const existing = nextNodes.find(
            (n) =>
              !n.selected &&
              n.parentId === activeNodeId &&
              n.choiceId === alt.choice.id &&
              n.decision === alt.option.label
          );

          if (existing) {
            nextNodes = nextNodes.map((n) =>
              n.id === existing.id
                ? { ...n, scenarioPicks, worry, label: scenarioNodeLabel(alt.option.scenario), scenarioText: alt.option.scenario }
                : n
            );
            continue;
          }

          nextNodes = [
            ...nextNodes,
            {
              id: `n_${Date.now().toString(36)}_${alt.choice.id}_${alt.optionIndex}`,
              kind: '진로',
              label: scenarioNodeLabel(alt.option.scenario),
              worry,
              reportType: 'result',
              selected: false,
              decision: alt.option.label,
              scenarioText: alt.option.scenario,
              parentId: activeNodeId,
              scenarioPicks,
              choiceId: alt.choice.id,
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
