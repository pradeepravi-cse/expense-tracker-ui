import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    redirect({
      to: '/$lang/dashboard',
      params: { lang: 'my' },
      throw: true,
    });
  });
  return <div>Hello "/"!</div>;
}
