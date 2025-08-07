import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type OnboardingStatus } from "@shared/schema";

interface CompletionStatusProps {
  status: OnboardingStatus;
  onStartNew: () => void;
  onViewDashboard: () => void;
}

export function CompletionStatus({ status, onStartNew, onViewDashboard }: CompletionStatusProps) {
  const isSuccess = status.status === "verified" && status.allValidationsPassed;
  const isFailure = status.status === "failed" || status.status === "review_required";

  return (
    <Card className="w-full">
      <CardContent className="text-center py-8">
        {isSuccess && (
          <div>
            <i className="fas fa-check-circle text-6xl text-success mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">Verification Successful!</h3>
            <p className="text-muted-foreground mb-6">
              Your documents have been processed successfully! Personal information was automatically extracted using OCR and verified through government APIs.
            </p>
            
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-medium text-success mb-3">Verification Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Document Upload:</span>
                  <i className="fas fa-check text-success" />
                </div>
                <div className="flex justify-between">
                  <span>OCR Data Extraction:</span>
                  <i className="fas fa-check text-success" />
                </div>
                <div className="flex justify-between">
                  <span>PAN Verification:</span>
                  <i className="fas fa-check text-success" />
                </div>
                <div className="flex justify-between">
                  <span>Data Storage & Notification:</span>
                  <i className="fas fa-check text-success" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button onClick={onStartNew} className="px-6 py-3 font-medium">
                Start New Onboarding
              </Button>
              <Button variant="outline" onClick={onViewDashboard} className="px-6 py-3 font-medium">
                View Dashboard
              </Button>
            </div>
          </div>
        )}

        {isFailure && (
          <div>
            <i className="fas fa-exclamation-triangle text-6xl text-warning mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              {status.status === "failed" ? "Verification Failed" : "Manual Review Required"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {status.status === "failed" 
                ? "OCR extraction or government verification failed. Please check document quality and try again."
                : "OCR extraction succeeded but manual review is required for verification. The admin team has been notified."
              }
            </p>
            
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-medium text-destructive mb-3">Issues Found</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Document Processing:</span>
                  <i className={`fas ${status.basicValidationPassed ? 'fa-check text-success' : 'fa-times text-destructive'}`} />
                </div>
                <div className="flex justify-between">
                  <span>OCR Data Extraction:</span>
                  <i className={`fas ${status.ocrValidationPassed ? 'fa-check text-success' : 'fa-times text-destructive'}`} />
                </div>
                <div className="flex justify-between">
                  <span>PAN API Verification:</span>
                  <i className={`fas ${status.panApiValid ? 'fa-check text-success' : 'fa-times text-destructive'}`} />
                </div>
              </div>
              
              {status.errorDetails && (
                <div className="mt-3 pt-3 border-t border-destructive/20">
                  <p className="text-xs text-destructive">{status.errorDetails.error}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button onClick={onStartNew} variant="outline" className="px-6 py-3 font-medium">
                Start New Onboarding
              </Button>
              <Button onClick={onViewDashboard} className="px-6 py-3 font-medium">
                Contact Support
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
