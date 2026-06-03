'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useMapStore, activeNodeSelector } from '@/store/useMapStore';
import { useHydrated } from '@/hooks/useHydrated';
import MapScreen from './MapScreen';
import CareerEntry from './CareerEntry';
import ScenarioSim from './ScenarioSim';
import ResultReport from './ResultReport';
import RelationEntry from './RelationEntry';
import CompatReport from './CompatReport';
import ChatSim from './ChatSim';
import CounselReport from './CounselReport';
import OnbMapState from '@/components/onboarding/OnbMapState';
import OnbMapLoading from '@/components/onboarding/OnbMapLoading';

export default function MapPageClient() {
  const hydrated = useHydrated();
  const { user, completeMapOnboarding } = useUserStore();
  const { flow, simKind, setFlow, resetFlow, setSimKind, confirmNode, saveUnselectedScenarioOptions } = useMapStore();
  const activeNode = useMapStore(activeNodeSelector);
  const [onbStep, setOnbStep] = useState<'state' | 'loading'>('state');

  if (!hydrated) {
    return <div style={{ flex: 1, background: '#000' }} />;
  }

  if (!user.mapOnboardingDone) {
    if (onbStep === 'state') return <OnbMapState onNext={() => setOnbStep('loading')} />;
    return <OnbMapLoading onDone={() => { completeMapOnboarding(); setOnbStep('state'); }} />;
  }

  const confirmed = !!activeNode?.selected;

  switch (flow) {
    case 'career':
      return <CareerEntry onNext={() => setFlow('scenario')} onBack={resetFlow} />;
    case 'scenario':
      return (
        <ScenarioSim
          initialPicks={activeNode?.scenarioPicks}
          onNext={(picks, choices) => {
            saveUnselectedScenarioOptions(picks, choices);
            setFlow('result');
          }}
          onBack={() => setFlow('career')}
          onClose={resetFlow}
        />
      );
    case 'result':
      return (
        <ResultReport
          confirmed={confirmed}
          decision={activeNode?.decision}
          onConfirm={(decision) => confirmNode(decision)}
          onBack={() => (confirmed ? resetFlow() : setFlow('scenario'))}
          onClose={resetFlow}
        />
      );
    case 'relation':
      return <RelationEntry onNext={() => setFlow('compat')} onBack={resetFlow} />;
    case 'compat':
      return (
        <CompatReport
          confirmed={confirmed}
          onConfirm={() => confirmNode()}
          onSim={(k) => { setSimKind(k); setFlow('chatsim'); }}
          onBack={() => (confirmed ? resetFlow() : setFlow('relation'))}
          onClose={resetFlow}
        />
      );
    case 'chatsim':
      return <ChatSim onBack={() => setFlow('compat')} onClose={resetFlow} kind={simKind} />;
    case 'counsel':
      return (
        <CounselReport
          confirmed={confirmed}
          onConfirm={() => confirmNode()}
          onBack={resetFlow}
          onClose={resetFlow}
        />
      );
    default:
      return <MapScreen />;
  }
}
