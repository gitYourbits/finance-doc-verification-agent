import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const kycOnboardings = pgTable("kyc_onboardings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: text("workflow_id").notNull().unique(),
  clientName: text("client_name").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile").notNull(),
  panNumber: text("pan_number").notNull(),
  aadhaarNumber: text("aadhaar_number").notNull(),
  panFileUrl: text("pan_file_url"),
  aadhaarFileUrl: text("aadhaar_file_url"),
  status: text("status").notNull().default("pending"), // pending, processing, verified, failed, review_required
  basicValidationPassed: boolean("basic_validation_passed").default(false),
  ocrValidationPassed: boolean("ocr_validation_passed").default(false),
  panApiValid: boolean("pan_api_valid").default(false),
  allValidationsPassed: boolean("all_validations_passed").default(false),
  ocrData: jsonb("ocr_data"), // Store extracted OCR data
  verificationData: jsonb("verification_data"), // Store API verification results
  errorDetails: jsonb("error_details"), // Store any error information
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertKycOnboardingSchema = createInsertSchema(kycOnboardings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Simplified schema - no personal details required from user
export const documentOnlySchema = z.object({
  // Only collect files - all personal data will be extracted via OCR
});

export const documentUploadSchema = z.object({
  panFile: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "PAN file must be less than 5MB"
  ),
  aadhaarFile: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "Aadhaar file must be less than 5MB"
  ),
});

export type InsertKycOnboarding = z.infer<typeof insertKycOnboardingSchema>;
export type KycOnboarding = typeof kycOnboardings.$inferSelect;
export type DocumentOnlyInfo = z.infer<typeof documentOnlySchema>;
export type DocumentUpload = z.infer<typeof documentUploadSchema>;

export interface OnboardingStatus {
  workflowId: string;
  currentStep: number;
  status: string;
  basicValidationPassed: boolean;
  ocrValidationPassed: boolean;
  panApiValid: boolean;
  allValidationsPassed: boolean;
  ocrData?: any;
  verificationData?: any;
  errorDetails?: any;
  stepStatuses: {
    panUpload: 'pending' | 'processing' | 'completed' | 'failed';
    aadhaarUpload: 'pending' | 'processing' | 'completed' | 'failed';
    panOcr: 'pending' | 'processing' | 'completed' | 'failed';
    aadhaarOcr: 'pending' | 'processing' | 'completed' | 'failed';
    panVerification: 'pending' | 'processing' | 'completed' | 'failed';
    sheetsStorage: 'pending' | 'processing' | 'completed' | 'failed';
    telegramNotification: 'pending' | 'processing' | 'completed' | 'failed';
  };
}
