// by moving the form into a component, the page can stay as server rendered
import NewTicketForm from './ticketForm';

function NewTicketPage() {

  return (
    <div className='min-h-screen bg-blue-50 flex items-center justify-center px-4'>
        <NewTicketForm />
    </div>
  )
}

export default NewTicketPage