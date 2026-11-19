import { getSystemPrompt, getUserPromptTemplate } from '../../prompts/v1/identifyIntent.ts';
import { IntentSchema } from '../../schemas/intentSchema.ts';
import { AppointmentService } from '../../services/appointmentService.ts';
import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../graph.ts';

export function createIdentifyIntentNode(llmService: OpenRouterService, appointmentService: AppointmentService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    console.log(`🔍 Identifying intent...`);
    const input = state.messages.at(-1)!.text;

    try {
      const systemPrompt = getSystemPrompt(appointmentService.getProfessionals());
      const userPrompt = getUserPromptTemplate(input);

      const result = await llmService.generateStructuredOutput(systemPrompt, userPrompt, IntentSchema);

      if (!result.success) {
        console.error('❌ Error identifying intent:', result.error);
        return {
          ...state,
          intent: 'unknown',
          error: result.error,
        };
      }

      const intentData = result.data;
      console.log(`✅ Intent identified:`, intentData);

      return {
        ...intentData,
      };
    } catch (error) {
      console.error('❌ Error in identifyIntent node:', error);
      return {
        ...state,
        intent: 'unknown',
        error: error instanceof Error ? error.message : 'Intent identification failed',
      };
    }
  };
}
