import { Request, Response, NextFunction } from 'express';
import { llmService } from '../service/llmService.js';
import { commandService } from '../service/commandService.js';
import { securityService } from '../service/securityService.js';
import { messageModel } from '../model/messageModel.js';
import { userModel } from '../model/userModel.js';
import { DEFAULT_USER_ID, DEFAULT_USER_NAME } from '../util/constants.js';
import { ValidationError, CommandError } from '../util/errors.js';
import { logger } from '../util/logger.js';
import type { ActionName } from '../policy/commandWhitelist.js';

async function ensureDefaultUser(): Promise<void> {
  await userModel.upsert(DEFAULT_USER_ID, DEFAULT_USER_NAME, 'admin');
}

interface ProcessResult {
  transcript: string;
  response: string;
  action: string;
  actionResult: string | null;
}

async function processTranscript(transcript: string): Promise<ProcessResult> {
  const history = await messageModel.findRecent(DEFAULT_USER_ID, 10);

  await messageModel.create({ userId: DEFAULT_USER_ID, role: 'user', content: transcript });

  const intent = await llmService.detectIntent(transcript);
  logger.info({ intent }, 'Intención detectada');

  let responseText: string;
  let actionResult: string | null = null;

  if (intent.action === 'general_question') {
    responseText = await llmService.generateResponse(transcript, null, history);
  } else if (!securityService.isCommandAllowed(intent)) {
    throw new CommandError(`Acción no permitida: ${intent.action}`);
  } else {
    actionResult = await commandService.execute(intent.action as ActionName, intent.params);

    if (actionResult === '__LLM_ANSWER__') {
      responseText = await llmService.generateResponse(transcript, null, history);
      actionResult = null;
    } else {
      responseText = await llmService.generateResponse(transcript, actionResult, history);
    }
  }

  await messageModel.create({
    userId: DEFAULT_USER_ID,
    role: 'assistant',
    content: responseText,
    action: intent.action !== 'general_question' ? intent.action : undefined,
  });

  return { transcript, response: responseText, action: intent.action, actionResult };
}

export const voiceController = {
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body as { text?: string };
      if (!text?.trim()) throw new ValidationError('Campo "text" requerido');

      await ensureDefaultUser();

      const transcript = text.trim();
      logger.info({ transcript }, 'Texto recibido desde cliente');

      const result = await processTranscript(transcript);

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
};
