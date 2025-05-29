// Actions related to tickets in the application
'use server';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';
import { logEvent } from '@/utils/sentry';
import { getCurrentUser } from '@/lib/current-user';

// TS code style with all the expected types
export async function createTicket(
    preState: { success: boolean, message: string },
    formData: FormData
): Promise<{ success: boolean, message: string }> {

    try {
        const user = await getCurrentUser();

        if (!user) {
            logEvent('Unauthorized ticket creation attempt', 'ticket', {}, 'warning');

            return {
                success: false,
                message: 'You must be logged in to create a ticket',
            };
        }
        // Initialize Sentry for error tracking
        const subject = formData.get('subject') as string;
        const description = formData.get('description') as string;
        const priority = formData.get('priority') as string;

        if (!subject || !description || !priority) {
            logEvent('Ticket creation failed due to missing fields', 'ticket', { subject, description, priority }, 'warning');
            return { success: false, message: 'All fields are required' };
        }

        // create the ticket in the database
        const ticket = await prisma.ticket.create({
            data: {
                subject,
                description,
                priority,
                user: {
                    connect: { id: user.id }
                }
            }
        });

        // add log in Sentry
        logEvent('Ticket created successfully', 'ticket', { ticketId: ticket.id }, 'info');

        // revalidate the path to update the cache
        revalidatePath('/tickets');

        return { success: true, message: 'Ticket created successfully' };
    } catch (error) {
        logEvent('Error creating ticket', 'ticket', { formData: Object.fromEntries(formData.entries()) }, 'error', error);
        console.error('Error creating ticket:', error);
        return { success: false, message: 'Failed to create ticket. Please try again later.' };
    }
}

// GET action to fetch all tickets
export async function getTickets() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            logEvent('Unauthorized access to ticket list', 'ticket', {}, 'warning');
            return [];
        }
        // Fetch all tickets from the database
        const tickets = await prisma.ticket.findMany({
            where: {
                userId: user.id // Fetch tickets for the current user
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Log the event in Sentry
        // logEvent('Fetched all tickets', 'ticket', {count: tickets.length}, 'info');

        return tickets;
    } catch (error) {
        logEvent('Error fetching tickets', 'ticket', {}, 'error', error);
        console.error('Error fetching tickets:', error);
        return []; // Return an empty array on error
    }
}

// GET single ticket by ID
export async function getTicketById(ticketId: string) {
    try {
        // Fetch the ticket by ID from the database
        const ticket = await prisma.ticket.findUnique({
            where: { id: Number(ticketId) }
        });

        if (!ticket) {
            logEvent('Ticket not found', 'ticket', { ticketId }, 'warning');
            return null; // Return null if ticket not found
        }

        // Log the event in Sentry
        // logEvent('Fetched ticket by ID', 'ticket', {ticketId}, 'info');

        return ticket;
    } catch (error) {
        logEvent('Error fetching ticket by ID', 'ticket', { ticketId }, 'error', error);
        console.error('Error fetching ticket by ID:', error);
        return null; // Return null on error
    }
}

// Close Ticket
export async function closeTicket(
    prevState: { success: boolean; message: string },
    formData: FormData
): Promise<{ success: boolean; message: string }> {
    const ticketId = Number(formData.get('ticketId'));

    if (!ticketId) {
        logEvent('Missing ticket ID', 'ticket', {}, 'warning');
        return { success: false, message: 'Ticket ID is Required' };
    }

    const user = await getCurrentUser();

    if (!user) {
        logEvent('Missing user ID', 'ticket', {}, 'warning');

        return { success: false, message: 'Unauthorized' };
    }

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
    });

    if (!ticket || ticket.userId !== user.id) {
        logEvent(
            'Unauthorized ticket close attempt',
            'ticket',
            { ticketId, userId: user.id },
            'warning'
        );

        return {
            success: false,
            message: 'You are not authorized to close this ticket',
        };
    }

    await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'Closed' },
    });

    revalidatePath('/tickets');
    revalidatePath(`/tickets/${ticketId}`);

    return { success: true, message: 'Ticket closed successfully' };
}