import { z } from 'zod';

export const IntentSchema = z.object({
    intent: z.enum(['schedule', 'cancel', 'unknown']).describe('The user intent'),
    professionalId: z.number().optional().describe('ID of the medical professional'),
    professionalName: z.string().optional().describe('Name of the medical professional'),
    datetime: z.string().optional().describe('Appointment date and time in ISO format'),
    patientName: z.string().optional().describe('Patient name extracted from question'),
    reason: z.string().optional().describe('Reason for appointment (for scheduling)'),
});