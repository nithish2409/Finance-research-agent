import * as v from 'valibot';

// A minimal non-financial schema to verify Valibot is installed and working
export const ChatMessageSchema = v.object({
  id: v.string(),
  role: v.picklist(['user', 'agent']),
  text: v.string(),
});

export type ChatMessage = v.InferInput<typeof ChatMessageSchema>;
