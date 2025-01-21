import { type FormEvent, useEffect, useState } from "react";
import { createTicket, getTicketTypes, type TicketType } from "../../services/ticketService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AddTicket = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');
  
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [formValues, setFormValues] = useState({
    ticket_type_id: "",
    title: "",
    description: "",
    priority: "NORMAL",
    severity: "NONE",
  });
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await getTicketTypes();
      setTypesLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setTicketTypes(data || []);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await createTicket({
      ticket_type_id: Number(formValues.ticket_type_id),
      title: formValues.title,
      description: formValues.description,
      priority: formValues.priority,
      severity: formValues.severity,
      client_id: clientId || undefined
    });

    if (error) {
      setError(error.message);
    } else if (data) {
      navigate(`/tickets/${data.id}`);
    }
    setLoading(false);
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Ticket</h1>

      {error && (
        <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
        {typesLoading ? (
          <p className="text-gray-600">Loading ticket types...</p>
        ) : (
          <div className="space-y-2">
            <label htmlFor="ticket_type_id" className="block font-medium">
              Ticket Type
            </label>
            <select
              id="ticket_type_id"
              name="ticket_type_id"
              value={formValues.ticket_type_id}
              onChange={handleChange}
              className="border rounded w-full p-2"
              required
            >
              <option value="" disabled>Select a type</option>
              {ticketTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="title" className="block font-medium">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="border rounded w-full p-2"
            value={formValues.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="border rounded w-full p-2"
            rows={4}
            value={formValues.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="priority" className="block font-medium">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formValues.priority}
            onChange={handleChange}
            className="border rounded w-full p-2"
          >
            <option value="LOW">LOW</option>
            <option value="NORMAL">NORMAL</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="severity" className="block font-medium">
            Severity
          </label>
          <select
            id="severity"
            name="severity"
            value={formValues.severity}
            onChange={handleChange}
            className="border rounded w-full p-2"
          >
            <option value="NONE">NONE</option>
            <option value="MINOR">MINOR</option>
            <option value="MAJOR">MAJOR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
          Create Ticket
        </button>
      </form>
    </main>
  );
};

export default AddTicket;