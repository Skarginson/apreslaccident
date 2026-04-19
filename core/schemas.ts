import { z } from "zod";

const PisteWordSchema = z.enum([
  "Amour",
  "Animal",
  "Autel",
  "Calme",
  "Cauchemars",
  "Chaos",
  "Culte",
  "Jouet",
  "Effrayant",
  "Esprit",
  "Famille",
  "Impossible",
  "Lueurs",
  "Mélodie",
  "Message",
  "Mourant",
  "Signal",
  "Vengeance",
]);

export const CardPromptSchema = z.object({
  text: z.string().min(1),
  pistes: z.tuple([PisteWordSchema, PisteWordSchema, PisteWordSchema]).optional(),
});

export const StoryCardFileSchema = z.object({
  suit: z.enum(["heart", "diamond", "club"]),
  act: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  title: z.string(),
  cards: z.record(z.string(), CardPromptSchema),
});

export const SpadeCardFileSchema = z.object({
  suit: z.literal("spade"),
  cards: z.object({
    ace: z.object({ role: z.literal("end"), text: z.string() }),
    king: z.object({
      role: z.literal("wound_or_epilogue"),
      woundText: z.string(),
      epilogueText: z.string(),
    }),
    queen: z.object({
      role: z.literal("wound_or_epilogue"),
      woundText: z.string(),
      epilogueText: z.string(),
    }),
    jack: z.object({
      role: z.literal("wound_or_epilogue"),
      woundText: z.string(),
      epilogueText: z.string(),
    }),
  }),
  note: z.string().optional(),
});

export const PisteDataSchema = z.object({
  word: PisteWordSchema,
  entryText: z.string().min(1),
});

export const PistesFileSchema = z.object({
  pistes: z.array(PisteDataSchema).length(18),
});

export const FrameSectionSchema = z.object({
  text: z.string().min(1),
  questions: z.array(z.string()),
});

export const FrameSchema = z.object({
  id: z.string(),
  rank: z.string(),
  title: z.string(),
  sections: z.array(FrameSectionSchema).min(1),
});

export const FramesFileSchema = z.object({
  note: z.string().optional(),
  frames: z.array(FrameSchema).length(13),
});
