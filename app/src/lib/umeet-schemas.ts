import { z } from "zod";

import { LOCATIONS, MOOD_IDS, QUESTIONS } from "./umeet-shared";

const keyOnly = z.object({ key: z.string().min(6).max(32) });

export const createFamilySchema = z.object({
      parentName: z.string().trim().min(1).max(24),
      childName: z.string().trim().min(1).max(24),
      companionKind: z.enum(["pet", "plant"]),
      companionName: z.string().trim().min(1).max(20),
    });
export const getFamilySchema = keyOnly;
export const setMoodSchema = z.object({ key: z.string().min(6).max(32), mood: z.enum(MOOD_IDS) });
export const sendNoteSchema = z.object({ key: z.string().min(6).max(32), text: z.string().trim().min(1).max(80) });
export const setLocationSchema = z.object({ key: z.string().min(6).max(32), location: z.enum(LOCATIONS) });
export const careForCompanionSchema = z.object({ key: z.string().min(6).max(32), action: z.enum(["feed", "play"]) });
export const submitCheckinSchema = z.object({
      key: z.string().min(6).max(32),
      answers: z.array(z.number().int().min(0).max(3)).length(QUESTIONS.length),
    });
export const decideSessionSchema = z.object({ key: z.string().min(6).max(32), allow: z.boolean() });
export const requestSessionSchema = keyOnly;

