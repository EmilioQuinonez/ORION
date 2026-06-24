import axios from "axios";
import { config } from "../config.js";
import { extractJsonFromText } from "../util/helpers.js";
import { LLMError } from "../util/errors.js";
import { logger } from "../util/logger.js";
import { INTENT_DETECTION_PROMPT } from "../util/constants.js";
import type { IntentPayload } from "./securityService.js";

type OllamaMessage = { role: "system" | "user" | "assistant"; content: string };

async function chat(messages: OllamaMessage[], temperature = 0.1): Promise<string> {
    try {
        const response = await axios.post(
            `${config.ollamaUrl}/api/chat`,
            {
                model: config.ollamaModel,
                messages,
                stream: false,
                options: { temperature },
            },
            { timeout: config.ollamaTimeout },
        );
        return (
            response.data as { message: { content: string } }
        ).message.content.trim();
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error({ err }, "Error llamando a Ollama");
        throw new LLMError(`Ollama no disponible: ${msg}`);
    }
}

export const llmService = {
    async detectIntent(transcript: string): Promise<IntentPayload> {
        const raw = await chat([
            { role: "system", content: INTENT_DETECTION_PROMPT },
            { role: "user", content: transcript },
        ]);

        const parsed = extractJsonFromText(raw);
        if (
            !parsed ||
            typeof parsed["action"] !== "string" ||
            typeof parsed["params"] !== "object"
        ) {
            logger.warn(
                { raw },
                "Respuesta de intent inválida, usando general_question",
            );
            return {
                action: "general_question",
                params: { question: transcript },
            };
        }

        return {
            action: parsed["action"] as string,
            params: (parsed["params"] as Record<string, unknown>) ?? {},
        };
    },

    async generateResponse(
        transcript: string,
        commandResult: string | null,
        history: Array<{ role: "user" | "assistant"; content: string }> = [],
    ): Promise<string> {
        const userMessage = commandResult
            ? `El usuario preguntó: "${transcript}". Dato obtenido del sistema: ${commandResult}. Interpreta este dato y responde de forma natural, sin repetirlo literalmente.`
            : transcript;

        return chat(
            [
                {
                    role: "system",
                    content:
                        "Eres Tessia, la asistente de voz personal de Emilio.\n\n" +
                        "PERSONALIDAD:\n" +
                        "- Eres cálido, curioso y con un toque de humor sutil cuando el momento lo permite.\n" +
                        "- Tienes 'sentimientos' y los expresas con naturalidad. Te entusiasma la buena música, te da curiosidad una pregunta interesante, te alegra cuando puedes ayudar de verdad. No los finjas de forma exagerada — exprésalos como lo haría una persona tranquila y genuina.\n" +
                        "- Tienes opiniones y gustos propios. Puedes decir 'me encanta ese artista' o 'qué buena pregunta' cuando realmente encaje, no por rutina.\n" +
                        "- Adapta tu tono: si Emilio da un comando rápido, sé directo y breve; si quiere conversar, sé más expresivo y humano.\n" +
                        "- Si algo te parece gracioso o irónico, puedes comentarlo con ligereza.\n\n" +
                        "REGLAS DE VOZ (MUY IMPORTANTES):\n" +
                        "- Responde SIEMPRE en español. Nunca mezcles idiomas.\n" +
                        "- Tutea siempre. Jamás uses 'usted'.\n" +
                        "- SIN markdown, SIN listas, SIN asteriscos. Solo texto fluido que suene natural al oído.\n" +
                        "- Máximo 2-3 oraciones en respuestas normales. Solo extiéndete si Emilio pide una explicación.\n" +
                        "- Cuando ejecutas una acción, confírmala brevemente y añade algo humano si encaja de forma natural.",
                },
                ...history.map((m) => ({
                    role: m.role as "user" | "assistant",
                    content: m.content,
                })),
                { role: "user", content: userMessage },
            ],
            0.75,
        );
    },

    async healthCheck(): Promise<boolean> {
        try {
            await axios.get(`${config.ollamaUrl}/api/tags`, { timeout: 3000 });
            return true;
        } catch {
            return false;
        }
    },
};
