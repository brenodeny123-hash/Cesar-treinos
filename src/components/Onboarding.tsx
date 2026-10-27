import React, { useState } from 'react';
import { ArrowRight, CalendarCheck, ChartNoAxesColumnIncreasing, Dumbbell } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: CalendarCheck,
    title: 'Seu treino de hoje, sem complicação',
    description: 'Abra o app e veja qual treino fazer. Toque no botão grande para começar.',
  },
  {
    icon: Dumbbell,
    title: 'Acompanhe cada exercício',
    description: 'Faça uma série por vez, marque quando terminar e use o relógio para descansar.',
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: 'Veja sua evolução',
    description: 'Seus treinos ficam guardados. Assim você acompanha os dias treinados e sua sequência.',
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const step = onboardingSteps[stepIndex];
  const StepIcon = step.icon;
  const isLastStep = stepIndex === onboardingSteps.length - 1;

  const handleContinue = () => {
    if (!isLastStep) {
      setStepIndex(index => index + 1);
      return;
    }

    try {
      localStorage.setItem('pulsefit_onboarding_seen', 'true');
    } catch {
      // The onboarding can still finish if browser storage is unavailable.
    }
    onComplete();
  };

  return (
    <main className="min-h-dvh w-full overflow-x-hidden bg-[#0b1326] px-5 py-8 text-[#dae2fd] flex items-center justify-center">
      <section
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#131b2e] p-6 sm:p-8 shadow-2xl"
      >
        <p className="text-base font-semibold text-[#f97316]">
          Bem-vindo ao César Treinos
        </p>

        <div className="mt-8 flex items-center justify-between gap-3">
          <span className="text-base font-medium text-[#dae2fd]">
            Etapa {stepIndex + 1} de {onboardingSteps.length}
          </span>
          <div
            className="flex gap-2"
            role="progressbar"
            aria-label="Progresso da apresentação"
            aria-valuemin={1}
            aria-valuemax={onboardingSteps.length}
            aria-valuenow={stepIndex + 1}
          >
            {onboardingSteps.map((item, index) => (
              <span
                key={item.title}
                aria-hidden="true"
                className={`h-2.5 w-8 rounded-full ${index <= stepIndex ? 'bg-[#f97316]' : 'bg-[#2d3449]'}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 flex min-h-64 flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#f97316]/15 text-[#f97316]">
            <StepIcon aria-hidden="true" className="h-10 w-10" />
          </div>
          <h1 id="onboarding-title" className="mt-7 text-2xl font-bold leading-tight text-white">
            {step.title}
          </h1>
          <p id="onboarding-description" className="mt-4 max-w-sm text-base leading-7 text-[#dae2fd]">
            {step.description}
          </p>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="mt-8 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#f97316] px-6 py-4 text-lg font-bold text-[#090d16] shadow-lg transition hover:bg-[#ea580c] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span>{isLastStep ? 'Começar agora' : 'Continuar'}</span>
          <ArrowRight aria-hidden="true" className="h-6 w-6" />
        </button>
      </section>
    </main>
  );
};
