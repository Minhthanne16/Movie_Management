import React from "react";
import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
}

interface BookingStepsProps {
  currentStep: number;
  steps: Step[];
}

export default function BookingSteps({
  currentStep,
  steps,
}: BookingStepsProps) {
  return (
    <div className="px-8 py-4 border-b border-white/5 flex items-center justify-center gap-4 md:gap-12 overflow-x-auto no-scrollbar">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-3 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-tickify-pink text-white shadow-[0_0_15px_rgba(255,0,128,0.5)] scale-110"
                    : isCompleted
                      ? "bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                      : "bg-white/5 text-gray-500"
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-widest hidden sm:block ${
                  isActive
                    ? "text-white"
                    : isCompleted
                      ? "text-green-500"
                      : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="h-1 w-8 md:w-16 bg-white/5 rounded-full overflow-hidden shrink-0">
                <div
                  className={`h-full bg-linear-to-r from-tickify-pink to-tickify-purple transition-all duration-700 ${
                    isCompleted ? "w-full" : "w-0"
                  }`}
                ></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
