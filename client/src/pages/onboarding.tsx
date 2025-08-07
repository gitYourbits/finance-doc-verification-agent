import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressSteps } from "@/components/ui/progress-steps";
// BasicInfoForm removed - now document-only approach
import { DocumentUpload } from "@/components/onboarding/DocumentUpload";
import { VerificationStatus } from "@/components/onboarding/VerificationStatus";
import { CompletionStatus } from "@/components/onboarding/CompletionStatus";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";

const steps = [
  { number: 1, label: "Upload Documents" },
  { number: 2, label: "OCR & Verification" },
  { number: 3, label: "Complete" },
];

export default function OnboardingPage() {
  const {
    workflowId,
    currentStep,
    setCurrentStep,
    createOnboarding,
    uploadDocuments,
    status,
    isCreating,
    isUploading,
    isLoading,
    resetOnboarding,
  } = useOnboarding();

  // Auto-create session when component loads
  useEffect(() => {
    if (!workflowId && !isCreating) {
      createOnboarding();
    }
  }, [workflowId, isCreating, createOnboarding]);

  // No basic info needed - documents only

  const handleDocumentUpload = (panFile: File, aadhaarFile: File) => {
    uploadDocuments({ panFile, aadhaarFile });
  };

  const handleStartNew = () => {
    resetOnboarding();
  };

  const handleViewDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">KYC Platform</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/onboarding" className="text-primary font-medium border-b-2 border-primary pb-1">
                Client Onboarding
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="p-2">
                <i className="fas fa-bell text-muted-foreground" />
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Progress Indicator */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-6">KYC Document Verification</h2>
              <p className="text-muted-foreground mb-4">Upload your PAN and Aadhaar documents. We'll automatically extract and verify all information using OCR and government APIs.</p>
              <div className="mb-8">
                <ProgressSteps steps={steps} currentStep={currentStep} />
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          {currentStep === 1 && workflowId && (
            <DocumentUpload
              onUpload={handleDocumentUpload}
              onBack={() => {}} // No back step needed
              isLoading={isUploading}
            />
          )}

          {currentStep === 2 && status && (
            <VerificationStatus status={status} />
          )}

          {currentStep === 3 && status && (
            <CompletionStatus
              status={status}
              onStartNew={handleStartNew}
              onViewDashboard={handleViewDashboard}
            />
          )}
          
          {!workflowId && isCreating && (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-primary mb-4" />
              <p className="text-muted-foreground">Initializing onboarding session...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
