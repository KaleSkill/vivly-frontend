import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Stepper = ({ currentStep, steps, className }) => {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  isUpcoming && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-primary",
                    isCompleted && "text-foreground",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    isCurrent && "text-muted-foreground",
                    isCompleted && "text-muted-foreground",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-all duration-300",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};