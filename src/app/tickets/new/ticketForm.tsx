"use client";
// This component is used to create a new ticket in the application
import { use, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/app/actions/ticket.actions";
import { toast } from "sonner";

function NewTicketForm() {
  const [state, formAction] = useActionState(createTicket, {
    success: false,
    message: "",
  });
  const router = useRouter();
  useEffect(() => {
    if (state.success) {
      toast.success("Ticket created successfully!");
      router.push("/tickets");
    }
  }, [state.success, router]);
  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8 border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Create New Ticket
      </h1>
      {state.message && !state.success && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          <p className="text-sm">{state.message}</p>
        </div>
      )}
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            className="mt-1 block w-full border border-blue-300 p-3"
            placeholder="Enter ticket subject"
            name="subject"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className="mt-1 block w-full border border-blue-300 p-3"
            rows={4}
            placeholder="Describe your issue"
            name="description"
          ></textarea>
        </div>
        <div>
          <select
            name="priority"
            id=""
            defaultValue="Low"
            className="block w-full border border-blue-300 p-3 rounded-md"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
}

export default NewTicketForm;
