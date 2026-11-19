import { OpenRouterService } from '../services/openRouterService.ts';
import { buildAppointmentGraph } from './graph.ts';
import { AppointmentService } from '../services/appointmentService.ts';

export function buildGraph() {
  const llmService = new OpenRouterService();
  const appointmentService = new AppointmentService();
  return buildAppointmentGraph(llmService, appointmentService);
}

export const graph = async () => {
  return buildGraph();
};

export default graph;
