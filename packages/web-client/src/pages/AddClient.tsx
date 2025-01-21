import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClientWithInvite } from '../services/clientService';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export function AddClient() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleContactInfoChange = (field: keyof ContactInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear any previous errors/warnings when form is modified
    setError(null);
    setWarning(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setWarning(null);

    try {
      const { data, error: submitError, warning: submitWarning } = await createClientWithInvite({ 
        name, 
        contact_info: contactInfo,
        notes 
      });

      if (submitError) {
        console.error('Error adding client:', submitError);
        setError(submitError.message);
      } else {
        console.log('Client added:', data);
        // Navigate to the client page
        navigate(`/clients/${data.id}`);
        
        // Show warning if invite failed but client was created
        if (submitWarning) {
          setWarning(submitWarning);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Client</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {warning && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                {warning}
              </div>
            )}

            {/* Organization Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Organization Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                  setWarning(null);
                }}
                required
                disabled={isLoading}
                placeholder="Enter organization name"
              />
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Primary Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium leading-none">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    value={contactInfo.firstName}
                    onChange={handleContactInfoChange('firstName')}
                    required
                    disabled={isLoading}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium leading-none">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    value={contactInfo.lastName}
                    onChange={handleContactInfoChange('lastName')}
                    required
                    disabled={isLoading}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={handleContactInfoChange('email')}
                    required
                    disabled={isLoading}
                    placeholder="Email address"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium leading-none">
                    Phone (optional)
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={handleContactInfoChange('phone')}
                    disabled={isLoading}
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium leading-none">
                Notes (optional)
              </label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setError(null);
                  setWarning(null);
                }}
                disabled={isLoading}
                placeholder="Add any additional notes"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Adding Client...' : 'Add Client'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}