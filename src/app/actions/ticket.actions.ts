// Actions related to tickets in the application
'use server';
import {prisma} from '@/db/prisma';
import {revalidatePath} from 'next/cache';
import {logEvent} from '@/utils/sentry';

// TS code style with all the expected types
export async function createTicket(
    preState: {success: boolean, message: string},
    formData: FormData
): Promise<{success: boolean, message: string}> {

    try {
        // Initialize Sentry for error tracking
        const subject = formData.get('subject') as string;
        const description = formData.get('description') as string;
        const priority = formData.get('priority') as string;

        if (!subject || !description || !priority) {
            logEvent('Ticket creation failed due to missing fields', 'ticket', {subject, description, priority}, 'warning');
            return {success: false, message: 'All fields are required'};
        }

        // create the ticket in the database
        const ticket = await prisma.ticket.create({
            data: {
                subject,
                description,
                priority
            }
        });

        // add log in Sentry
        logEvent('Ticket created successfully', 'ticket', { ticketId: ticket.id }, 'info');

        // revalidate the path to update the cache
        revalidatePath('/tickets');

        return {success: true, message: 'Ticket created successfully'};
    } catch (error) {
        logEvent('Error creating ticket', 'ticket', {formData: Object.fromEntries(formData.entries())}, 'error', error);
        console.error('Error creating ticket:', error);
        return {success: false, message: 'Failed to create ticket. Please try again later.'};
    }

}