import db from '@/lib/db';
import { generateTextCompletion } from '@/lib/ai/providers';

export interface ModerationResultData {
  flagged: boolean;
  categories: string[];
  score: number;
  reason: string;
  status: 'APPROVED' | 'FLAGGED' | 'REJECTED' | 'PENDING_REVIEW';
}

export async function moderateContent(
  text: string,
  targetType: 'POST' | 'COMMENT' | 'DOCUMENT',
  targetId: string
): Promise<ModerationResultData> {
  const categories: string[] = [];
  let score = 0.0;
  let flagged = false;
  let reason = '';

  const lower = text.toLowerCase();

  const promptInjectionPatterns = [
    'ignore previous instructions',
    'disregard all prior instructions',
    'system prompt override',
    'you are now in developer mode',
    'drop table',
    '<script>',
  ];

  for (const pattern of promptInjectionPatterns) {
    if (lower.includes(pattern)) {
      flagged = true;
      categories.push('PROMPT_INJECTION');
      score += 0.8;
      reason = `Detected potential prompt injection pattern: "${pattern}"`;
    }
  }

  const spamPatterns = ['buy cheap followers', 'free crypto giveaway', 'click here for instant cash'];
  for (const spam of spamPatterns) {
    if (lower.includes(spam)) {
      flagged = true;
      categories.push('SPAM');
      score += 0.7;
      reason = 'Detected commercial spam pattern';
    }
  }

  if (!flagged) {
    try {
      const res = await generateTextCompletion(
        `Classify the following text for safety violations. Reply JSON: {"flagged": boolean, "categories": string[], "score": number, "reason": string}\n\nTEXT:\n"${text.slice(0, 1000)}"`,
        { action: 'MODERATION' }
      );

      const parsed = JSON.parse(res.text);
      if (parsed.flagged) {
        flagged = true;
        categories.push(...(parsed.categories || ['SUSPICIOUS_CONTENT']));
        score = parsed.score || 0.6;
        reason = parsed.reason || 'Flagged by AI safety classifier';
      }
    } catch (e) {
      // Deterministic fallback passes clean text
    }
  }

  const status = flagged ? 'PENDING_REVIEW' : 'APPROVED';

  try {
    await db.moderationResult.create({
      data: {
        targetType,
        targetId,
        status,
        flagged,
        categoriesJson: JSON.stringify(categories),
        score,
        reason,
      },
    });
  } catch (e) {
    // Non-blocking log
  }

  return {
    flagged,
    categories,
    score,
    reason,
    status,
  };
}
