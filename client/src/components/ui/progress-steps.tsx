import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
  active?: boolean;
  completed?: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className={cn("step-indicator flex items-center space-x-2", {
            "active": step.number <= currentStep
          })}>
            <div className={cn(
              "step-number w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step.number <= currentStep
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            )}>
              {step.number <= currentStep ? (
                step.number < currentStep ? (
                  <i className="fas fa-check text-xs" />
                ) : (
                  step.number
                )
              ) : (
                step.number
              )}
            </div>
            <span className={cn(
              "step-label text-sm font-medium transition-colors hidden sm:block",
              step.number <= currentStep
                ? "text-foreground"
                : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 bg-muted mx-2 sm:mx-4 min-w-8">
              <div 
                className={cn(
                  "h-full bg-primary transition-all duration-500",
                  step.number < currentStep ? "w-full" : "w-0"
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
