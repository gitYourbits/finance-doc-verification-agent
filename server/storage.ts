import { type KycOnboarding, type InsertKycOnboarding, type OnboardingStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createOnboarding(onboarding: Omit<InsertKycOnboarding, 'workflowId'>): Promise<KycOnboarding>;
  getOnboarding(workflowId: string): Promise<KycOnboarding | undefined>;
  getOnboardingById(id: string): Promise<KycOnboarding | undefined>;
  updateOnboarding(workflowId: string, updates: Partial<KycOnboarding>): Promise<KycOnboarding | undefined>;
  getAllOnboardings(): Promise<KycOnboarding[]>;
  getRecentOnboardings(limit?: number): Promise<KycOnboarding[]>;
  getOnboardingsByStatus(status: string): Promise<KycOnboarding[]>;
}

export class MemStorage implements IStorage {
  private onboardings: Map<string, KycOnboarding>;

  constructor() {
    this.onboardings = new Map();
  }

  async createOnboarding(insertOnboarding: Omit<InsertKycOnboarding, 'workflowId'>): Promise<KycOnboarding> {
    const id = randomUUID();
    const workflowId = `${id}_${Date.now()}`;
    const now = new Date();
    
    const onboarding: KycOnboarding = {
      ...insertOnboarding,
      id,
      workflowId,
      status: insertOnboarding.status || 'pending',
      createdAt: now,
      updatedAt: now,
    };
    
    this.onboardings.set(workflowId, onboarding);
    return onboarding;
  }

  async getOnboarding(workflowId: string): Promise<KycOnboarding | undefined> {
    return this.onboardings.get(workflowId);
  }

  async getOnboardingById(id: string): Promise<KycOnboarding | undefined> {
    return Array.from(this.onboardings.values()).find(
      (onboarding) => onboarding.id === id
    );
  }

  async updateOnboarding(workflowId: string, updates: Partial<KycOnboarding>): Promise<KycOnboarding | undefined> {
    const existing = this.onboardings.get(workflowId);
    if (!existing) return undefined;

    const updated: KycOnboarding = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    this.onboardings.set(workflowId, updated);
    return updated;
  }

  async getAllOnboardings(): Promise<KycOnboarding[]> {
    return Array.from(this.onboardings.values()).sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getRecentOnboardings(limit: number = 10): Promise<KycOnboarding[]> {
    const all = await this.getAllOnboardings();
    return all.slice(0, limit);
  }

  async getOnboardingsByStatus(status: string): Promise<KycOnboarding[]> {
    return Array.from(this.onboardings.values()).filter(
      (onboarding) => onboarding.status === status
    );
  }
}

export const storage = new MemStorage();
