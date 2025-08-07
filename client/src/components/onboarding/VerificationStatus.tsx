import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { type OnboardingStatus } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerificationStatusProps {
  status: OnboardingStatus;
}

export function VerificationStatus({ status }: VerificationStatusProps) {
  const showOcrResults = status.ocrData && Object.keys(status.ocrData).length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-search text-primary mr-3" />
          OCR Processing & Verification
        </CardTitle>
        <p className="text-muted-foreground text-sm mt-2">
          Your documents are being processed automatically using OCR technology and verified through government APIs.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Status */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-4">Document Upload Status</h4>
          <div className="space-y-3">
            <StatusIndicator
              status={status.stepStatuses.panUpload}
              label="PAN Document to Google Drive"
            />
            <StatusIndicator
              status={status.stepStatuses.aadhaarUpload}
              label="Aadhaar Document to Google Drive"
            />
          </div>
        </div>

        {/* OCR Processing */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-4">OCR Data Extraction</h4>
          <div className="space-y-3">
            <StatusIndicator
              status={status.stepStatuses.panOcr}
              label="PAN OCR Processing (Mindee API)"
            />
            <StatusIndicator
              status={status.stepStatuses.aadhaarOcr}
              label="Aadhaar OCR Processing (Mindee API)"
            />
          </div>
        </div>

        {/* API Verification */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-4">Government Database Verification</h4>
          <div className="space-y-3">
            <StatusIndicator
              status={status.stepStatuses.panVerification}
              label="PAN Verification (Karza API)"
            />
          </div>
        </div>

        {/* Data Storage */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-4">Data Storage</h4>
          <div className="space-y-3">
            <StatusIndicator
              status={status.stepStatuses.sheetsStorage}
              label="Client Data to Google Sheets"
            />
            <StatusIndicator
              status={status.stepStatuses.telegramNotification}
              label="Telegram Notification"
            />
          </div>
        </div>

        {/* OCR Results */}
        {showOcrResults && (
          <Alert className="border-primary/20 bg-primary/5">
            <i className="fas fa-robot" />
            <AlertDescription>
              <h4 className="font-medium text-primary mb-4">🤖 Automatically Extracted Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {status.ocrData.panNumber && (
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-id-card text-primary" />
                    <div>
                      <span className="font-medium block">PAN Number:</span>
                      <span className="text-primary font-mono text-lg">{status.ocrData.panNumber}</span>
                    </div>
                  </div>
                )}
                {status.ocrData.panName && (
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-user text-primary" />
                    <div>
                      <span className="font-medium block">Name from PAN:</span>
                      <span className="text-primary">{status.ocrData.panName}</span>
                    </div>
                  </div>
                )}
                {status.ocrData.aadhaarNumber && (
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-address-card text-primary" />
                    <div>
                      <span className="font-medium block">Aadhaar Number:</span>
                      <span className="text-primary font-mono text-lg">{status.ocrData.aadhaarNumber}</span>
                    </div>
                  </div>
                )}
                {status.ocrData.aadhaarName && (
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-user-circle text-primary" />
                    <div>
                      <span className="font-medium block">Name from Aadhaar:</span>
                      <span className="text-primary">{status.ocrData.aadhaarName}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-primary/20">
                <p className="text-xs text-primary/70">
                  <i className="fas fa-magic mr-1" />
                  All information was extracted automatically using AI-powered OCR technology.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Details */}
        {status.errorDetails && (
          <Alert variant="destructive">
            <i className="fas fa-exclamation-triangle" />
            <AlertDescription>
              <h4 className="font-medium mb-2">Error Details</h4>
              <p className="text-sm">{status.errorDetails.error}</p>
              {status.errorDetails.step && (
                <p className="text-xs mt-1">Step: {status.errorDetails.step}</p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
