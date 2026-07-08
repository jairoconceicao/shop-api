import { cn } from "@/shared/lib/cn";

export type StepperStep = {
  title: string;
  description?: string;
};

type StepperProps = {
  steps: ReadonlyArray<StepperStep>;
  currentStep: number;
};

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="grid gap-3 lg:grid-cols-4">
      {steps.map((step, index) => {
        const stepState = index < currentStep ? "completed" : index === currentStep ? "active" : "pending";

        return (
          <li
            key={step.title}
            className={cn(
              "rounded-3xl border p-4 transition",
              stepState === "completed"
                ? "border-emerald-200 bg-emerald-50"
                : stepState === "active"
                  ? "border-spanish-green-300 bg-white shadow-sm"
                  : "border-spanish-green-200 bg-spanish-green-50/70",
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
                  stepState === "completed"
                    ? "bg-emerald-600 text-white"
                    : stepState === "active"
                      ? "bg-spanish-green-700 text-white"
                      : "bg-spanish-green-200 text-spanish-green-700",
                )}
              >
                {index + 1}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-spanish-green-950">{step.title}</p>
                {step.description ? <p className="text-sm leading-6 text-spanish-green-700">{step.description}</p> : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
