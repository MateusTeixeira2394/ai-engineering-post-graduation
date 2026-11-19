import { RequiredFieldsSchema } from '../../schemas/requiredFieldsSchema.ts';
import { AppointmentService } from '../../services/appointmentService.ts';
import type { GraphState } from '../graph.ts';

export function createCancellerNode(appointmentService: AppointmentService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    console.log(`❌ Cancelling appointment...`);

    try {
      const validation = RequiredFieldsSchema.safeParse({
        patientName: state.patientName,
        professionalId: state.professionalId,
        datetime: state.datetime
      });

      if (!validation.success) {
        const errorMessages = validation.error.errors.map(err => err.message).join('; ');
        console.error(`❌ Validation failed: ${errorMessages}`);
        return {
          ...state,
          actionSuccess: false,
          actionError: `Validation failed: ${errorMessages}`
        };
      }

      appointmentService.cancelAppointment(
        state.professionalId!,
        state.patientName!,
        new Date(state.datetime!),
      );

      console.log(`✅ Appointment cancelled successfully`);

      return {
        actionSuccess: true,
      };
    } catch (error) {
      console.log(`❌ Cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        actionSuccess: false,
        actionError: error instanceof Error ? error.message : 'Cancellation failed',
      };
    }

  };
}
