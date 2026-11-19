import { z } from 'zod';

export const RequiredFieldsSchema = z.object({
    patientName: z.string({ required_error: 'Patient name is required' }),
    professionalId: z.number({ required_error: 'Professional ID is required' }),
    datetime: z.string({ required_error: 'Datetime is required' })
});