import { RequiredFieldsSchema } from '../../schemas/requiredFieldsSchema.ts';
import { AppointmentService } from '../../services/appointmentService.ts';
import type { GraphState } from '../graph.ts';

export function createSchedulerNode(appointmentService: AppointmentService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    console.log(`📅 Scheduling appointment...`);

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

      const appointment = appointmentService.bookAppointment(
        state.professionalId!,
        new Date(state.datetime!),
        state.patientName!,
        state.reason || 'General Consultation'
      );

      console.log(`✅ Appointment scheduled successfully`);

      return {
        ...state,
        actionSuccess: true,
        appointmentData: appointment
      };
    } catch (error) {
      console.log(`❌ Scheduling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        ...state,
        actionSuccess: false,
        actionError: error instanceof Error ? error.message : 'Scheduling failed',
      };
    }
  };
}
