import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_ROLE_COOKIE_NAME } from '../app/dashboard/mock-api';
import { Button } from './ui/button';

export default async function LogoutButton() {
  return (
    <Button
      onClick={async () => {
        'use server';
        (await cookies()).delete(USER_ROLE_COOKIE_NAME);
        redirect('/login');
      }}
    >
      Logout
    </Button>
  );
}
