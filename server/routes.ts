import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { documentOnlySchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.'));
    }
  },
});

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/kyc-onboard';

export async function registerRoutes(app: Express): Promise<Server> {
  // Create new onboarding session - just initialize with workflow ID
  app.post("/api/onboarding/create", async (req, res) => {
    try {
      const onboarding = await storage.createOnboarding({
        // Will be populated by OCR from documents
        clientName: "Pending OCR Extraction",
        email: "pending@ocr.extraction",
        mobile: "0000000000",
        panNumber: "PENDING00X",
        aadhaarNumber: "000000000000",
        status: "pending",
        basicValidationPassed: false, // Will be set by OCR
        ocrValidationPassed: false,
        panApiValid: false,
        allValidationsPassed: false,
        panFileUrl: null,
        aadhaarFileUrl: null,
        ocrData: null,
        verificationData: null,
        errorDetails: null,
      });

      res.json({
        success: true,
        onboarding,
        workflowId: onboarding.workflowId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  // Upload documents and trigger n8n workflow
  app.post("/api/onboarding/:workflowId/upload", upload.fields([
    { name: 'panFile', maxCount: 1 },
    { name: 'aadhaarFile', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const { workflowId } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.panFile || !files.aadhaarFile) {
        return res.status(400).json({
          success: false,
          error: "Both PAN and Aadhaar files are required",
        });
      }

      const onboarding = await storage.getOnboarding(workflowId);
      if (!onboarding) {
        return res.status(404).json({
          success: false,
          error: "Onboarding session not found",
        });
      }

      // Update status to processing
      await storage.updateOnboarding(workflowId, { status: "processing" });

      // Prepare form data for n8n webhook
      const formData = new FormData();
      formData.append('workflow_id', workflowId);
      // No personal data - will be extracted by OCR
      
      // Add files
      formData.append('pan_file', files.panFile[0].buffer, {
        filename: files.panFile[0].originalname,
        contentType: files.panFile[0].mimetype,
      });
      formData.append('aadhaar_file', files.aadhaarFile[0].buffer, {
        filename: files.aadhaarFile[0].originalname,
        contentType: files.aadhaarFile[0].mimetype,
      });

      // Trigger n8n workflow
      try {
        const n8nResponse = await axios.post(N8N_WEBHOOK_URL, formData, {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 30000, // 30 seconds timeout
        });

        res.json({
          success: true,
          message: "Documents uploaded and workflow triggered",
          workflowId,
          n8nResponse: n8nResponse.data,
        });
      } catch (n8nError) {
        console.error('N8N webhook error:', n8nError);
        
        // Update status to failed
        await storage.updateOnboarding(workflowId, { 
          status: "failed",
          errorDetails: {
            step: "n8n_webhook",
            error: n8nError instanceof Error ? n8nError.message : "Unknown error",
            timestamp: new Date().toISOString(),
          }
        });

        res.status(500).json({
          success: false,
          error: "Failed to trigger verification workflow",
          details: n8nError instanceof Error ? n8nError.message : "Unknown error",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to upload documents",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get onboarding status
  app.get("/api/onboarding/:workflowId/status", async (req, res) => {
    try {
      const { workflowId } = req.params;
      const onboarding = await storage.getOnboarding(workflowId);
      
      if (!onboarding) {
        return res.status(404).json({
          success: false,
          error: "Onboarding session not found",
        });
      }

      // Determine current step based on status and validations
      let currentStep = 1;
      if (onboarding.basicValidationPassed) currentStep = 2;
      if (onboarding.status === "processing") currentStep = 3;
      if (onboarding.status === "verified" || onboarding.status === "failed" || onboarding.status === "review_required") currentStep = 4;

      // Mock step statuses based on current progress (in real implementation, this would come from n8n or be tracked separately)
      const stepStatuses = {
        panUpload: onboarding.panFileUrl ? 'completed' as const : 'pending' as const,
        aadhaarUpload: onboarding.aadhaarFileUrl ? 'completed' as const : 'pending' as const,
        panOcr: onboarding.ocrData ? 'completed' as const : onboarding.status === 'processing' ? 'processing' as const : 'pending' as const,
        aadhaarOcr: onboarding.ocrData ? 'completed' as const : onboarding.status === 'processing' ? 'processing' as const : 'pending' as const,
        panVerification: onboarding.panApiValid ? 'completed' as const : onboarding.status === 'processing' ? 'processing' as const : 'pending' as const,
        sheetsStorage: onboarding.allValidationsPassed ? 'completed' as const : onboarding.status === 'processing' ? 'processing' as const : 'pending' as const,
        telegramNotification: onboarding.allValidationsPassed ? 'completed' as const : onboarding.status === 'processing' ? 'processing' as const : 'pending' as const,
      };

      const status = {
        workflowId,
        currentStep,
        status: onboarding.status,
        basicValidationPassed: onboarding.basicValidationPassed,
        ocrValidationPassed: onboarding.ocrValidationPassed,
        panApiValid: onboarding.panApiValid,
        allValidationsPassed: onboarding.allValidationsPassed,
        ocrData: onboarding.ocrData,
        verificationData: onboarding.verificationData,
        errorDetails: onboarding.errorDetails,
        stepStatuses,
      };

      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to get status",
      });
    }
  });

  // Webhook endpoint for n8n to update status
  app.post("/api/onboarding/:workflowId/webhook", async (req, res) => {
    try {
      const { workflowId } = req.params;
      const updates = req.body;

      const updatedOnboarding = await storage.updateOnboarding(workflowId, updates);
      
      if (!updatedOnboarding) {
        return res.status(404).json({
          success: false,
          error: "Onboarding session not found",
        });
      }

      res.json({
        success: true,
        message: "Status updated",
        onboarding: updatedOnboarding,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to update status",
      });
    }
  });

  // Get all onboardings for dashboard
  app.get("/api/onboardings", async (req, res) => {
    try {
      const { status, limit } = req.query;
      
      let onboardings;
      if (status && typeof status === 'string') {
        onboardings = await storage.getOnboardingsByStatus(status);
      } else {
        const limitNum = limit ? parseInt(limit as string) : undefined;
        onboardings = await storage.getRecentOnboardings(limitNum);
      }

      res.json({
        success: true,
        onboardings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to get onboardings",
      });
    }
  });

  // Get dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const allOnboardings = await storage.getAllOnboardings();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const stats = {
        total: allOnboardings.length,
        verifiedToday: allOnboardings.filter(o => 
          o.status === 'verified' && 
          new Date(o.updatedAt!) >= today
        ).length,
        pendingReview: allOnboardings.filter(o => o.status === 'review_required').length,
        processing: allOnboardings.filter(o => o.status === 'processing').length,
      };

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to get dashboard stats",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
