import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type StatusResponse } from "@/lib/api";
import { type DocumentOnlyInfo, type OnboardingStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useOnboarding() {
  const [workflowId, setWorkflowId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create onboarding session (no personal data needed)
  const createOnboardingMutation = useMutation({
    mutationFn: () => api.createOnboarding(),
    onSuccess: (data) => {
      setWorkflowId(data.workflowId);
      setCurrentStep(1); // Start directly with document upload
      toast({
        title: "Session created",
        description: "Please upload your documents to begin verification.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload documents
  const uploadDocumentsMutation = useMutation({
    mutationFn: ({ panFile, aadhaarFile }: { panFile: File; aadhaarFile: File }) =>
      api.uploadDocuments(workflowId, panFile, aadhaarFile),
    onSuccess: () => {
      setCurrentStep(2); // Move to verification step
      toast({
        title: "Documents uploaded",
        description: "OCR extraction and verification process has started.",
      });
      // Start polling for status updates
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/status", workflowId] });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get onboarding status with polling
  const statusQuery = useQuery<StatusResponse>({
    queryKey: ["/api/onboarding/status", workflowId],
    queryFn: () => api.getOnboardingStatus(workflowId || ''), // Ensure workflowId is always a string
    enabled: !!workflowId && currentStep >= 2,
    refetchInterval: (query) => {
      // Stop polling if verification is complete or failed
      const status = query.state.data?.status?.status;
      if (status === "verified" || status === "failed" || status === "review_required") {
        return false;
      }
      return 3000; // Poll every 3 seconds while processing
    },
    refetchIntervalInBackground: false,
  });

  // Update current step based on status
  const handleStatusUpdate = useCallback((status: OnboardingStatus) => {
    if (status.currentStep !== currentStep) {
      setCurrentStep(status.currentStep);
    }

    if (status.status === "verified" && currentStep !== 3) {
      setCurrentStep(3);
      toast({
        title: "Verification completed!",
        description: "Your KYC onboarding has been successfully verified.",
      });
    } else if (status.status === "failed" && currentStep !== 3) {
      setCurrentStep(3);
      toast({
        title: "Verification failed",
        description: "Manual review may be required. Please check the details.",
        variant: "destructive",
      });
    } else if (status.status === "review_required" && currentStep !== 3) {
      setCurrentStep(3);
      toast({
        title: "Manual review required",
        description: "Your application will be reviewed manually.",
        variant: "default",
      });
    }
  }, [currentStep, toast]);

  // Watch for status changes
  if (statusQuery.data?.status) {
    handleStatusUpdate(statusQuery.data.status);
  }

  const resetOnboarding = useCallback(() => {
    setWorkflowId("");
    setCurrentStep(1);
    queryClient.clear();
  }, [queryClient]);

  return {
    workflowId,
    currentStep,
    setCurrentStep,
    createOnboarding: createOnboardingMutation.mutate,
    uploadDocuments: uploadDocumentsMutation.mutate,
    status: statusQuery.data?.status,
    isCreating: createOnboardingMutation.isPending,
    isUploading: uploadDocumentsMutation.isPending,
    isLoading: statusQuery.isLoading,
    error: createOnboardingMutation.error || uploadDocumentsMutation.error || statusQuery.error,
    resetOnboarding,
  };
}
