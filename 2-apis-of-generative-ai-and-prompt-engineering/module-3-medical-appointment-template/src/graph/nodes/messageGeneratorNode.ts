import { getSystemPrompt, getUserPromptTemplate } from '../../prompts/v1/messageGenerator.ts';
import { MessageSchema } from '../../schemas/messageSchema.ts';
import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../graph.ts';
import { AIMessage } from 'langchain';

export function createMessageGeneratorNode(llmService: OpenRouterService) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        console.log(`💬 Generating response message...`);

        try {

            const hasSuccess = state.actionSuccess ? 'success' : 'error';
            const scenario = `${state.intent || 'unknown'}_${hasSuccess}`;
            const details = {
                professionalName: state.professionalName || 'N/A',
                datetime: state.datetime || 'N/A',
                reason: state.reason || 'N/A',
                patientName: state.patientName || 'N/A',
                error: state.actionError || state.error || 'N/A',
            }

            const systemPrompt = getSystemPrompt();
            const userPrompt = getUserPromptTemplate({ scenario, details });

            const result = await llmService.generateStructuredOutput(systemPrompt, userPrompt, MessageSchema);

            if (result.error) {
                console.error('❌ Error generating message:', result.error);
                return {
                    ...state,
                    messages: [
                        ...state.messages,
                        new AIMessage('An error occurred while processing your request.')
                    ],
                };
            }

            return {
                ...state,
                messages: [
                    ...state.messages,
                    new AIMessage(result.data.message)
                ],
            };
        } catch (error) {
            console.error('❌ Error in messageGenerator node:', error);
            return {
                ...state,
                messages: [
                    ...state.messages,
                    new AIMessage('An error occurred while processing your request.')
                ],
            };
        }
    };
}
