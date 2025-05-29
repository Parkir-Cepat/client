import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS } from '../graphql/queries';

const TestDashboard = () => {
  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS, {
    context: {
      headers: {
        authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzdjYjYzNmNjMmE2NmFjM2U5NWRiNiIsImVtYWlsIjoidGVzdEBwYXJraXJpbi5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc0ODQ4NzAxMSwiZXhwIjoxNzQ5MDkxODExfQ.Vj9kVyGxIhxN1D6CNbC58qf7IgHoW9CI2IrQULaF1DQ`
      }
    }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Dashboard Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default TestDashboard;
