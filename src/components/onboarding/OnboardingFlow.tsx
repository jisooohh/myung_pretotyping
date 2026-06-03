'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import MobileContainer from '@/components/layout/MobileContainer';
import OnbLogin from './OnbLogin';
import OnbSplash from './OnbSplash';
import OnbName from './OnbName';
import OnbBirth from './OnbBirth';
import OnbGender from './OnbGender';
import OnbRegion from './OnbRegion';
import OnbReceiving from './OnbReceiving';

// SNS login → splash → 이름 → 생년월일시 → 성별 → 지역 → 명(命) 받아오기(로딩, 알림).
// Steps 7–8 (state input + clone-creation loading) live on first map-tab entry.
type Step = 'login' | 'splash' | 'name' | 'birth' | 'gender' | 'region' | 'receiving';

export default function OnboardingFlow() {
  const router = useRouter();
  const { user, completeOnboarding } = useUserStore();
  const [step, setStep] = useState<Step>('login');

  useEffect(() => {
    if (user.onboardingDone) {
      router.replace('/os');
    }
  }, [user.onboardingDone, router]);

  const next = (nextStep: Step) => setStep(nextStep);

  const handleReceivingDone = () => {
    completeOnboarding();
    router.push('/os');
  };

  return (
    <MobileContainer>
      {step === 'login' && <OnbLogin onNext={() => next('splash')} />}
      {step === 'splash' && <OnbSplash onNext={() => next('name')} />}
      {step === 'name' && <OnbName onNext={() => next('birth')} />}
      {step === 'birth' && <OnbBirth onNext={() => next('gender')} onBack={() => next('name')} />}
      {step === 'gender' && <OnbGender onNext={() => next('region')} onBack={() => next('birth')} />}
      {step === 'region' && <OnbRegion onNext={() => next('receiving')} onBack={() => next('gender')} />}
      {step === 'receiving' && <OnbReceiving onDone={handleReceivingDone} />}
    </MobileContainer>
  );
}
