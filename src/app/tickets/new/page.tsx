// by moving the form into a component, the page can stay as server rendered
import NewTicketForm from './ticketForm';
import { getCurrentUser } from '@/lib/current-user';
import { redirect } from 'next/navigation';

async function NewTicketPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className='min-h-screen bg-blue-50 flex items-center justify-center px-4'>
        <NewTicketForm />
    </div>
  )
}

export default NewTicketPage