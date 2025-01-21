import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export function ClientPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Client ID: {id}</p>
          {/* TODO: Add client details, contact info, etc. */}
        </CardContent>
      </Card>
    </div>
  );
} 