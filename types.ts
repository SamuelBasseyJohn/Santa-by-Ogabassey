// FIX: This file should only contain type definitions.
// All implementation logic has been moved to services/geminiService.ts.
// Exporting this interface resolves import errors across the application.
export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
  audioUrl?: string;
  imageUrl?: string;
  action?: string;
}