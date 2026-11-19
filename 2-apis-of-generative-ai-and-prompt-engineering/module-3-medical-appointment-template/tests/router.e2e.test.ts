import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.ts';
import { professionals } from '../src/services/appointmentService.ts';

const app = createServer();

async function makeARequest(question: string) {
    return await app.inject({
        method: 'POST',
        url: '/chat',
        payload: {
            question,
        },
    });
}

describe('Medical Appointment System - E2E Tests', async () => {

    it('Schedule appointment - Success', async () => {
        const response = await makeARequest(
            `Hi, I'm Maria Santos and I'd like to schedule an appointment with ${professionals.at(0)?.name} tomorrow at 4pm for a regular check-up`
        )

        console.log('Schedule Success Response:', response.body);

        assert.equal(response.statusCode, 200);
        // const body = JSON.parse(response.body);
        // assert.equal(body.intent, 'schedule');
        // assert.equal(body.success, true);
    });


    it('Cancel appointment - Success', async () => {

         await makeARequest(
            `I'm Joao da Silva and I'd like to schedule an appointment with ${professionals.at(1)?.name} today at 2pm`
        )

        const response = await makeARequest(
            `Please cancel my appointment with ${professionals.at(1)?.name} today at 2pm, my name is Joao da Silva`
        );

        console.log('Cancel Success Response:', response.body);

        assert.equal(response.statusCode, 200);
        // const body = JSON.parse(response.body);
        // assert.equal(body.intent, 'cancel');
        // assert.equal(body.success, true);
    });
});
