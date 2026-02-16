import { login } from '../dashboard/mock-api';

export default function LoginPage() {
  return (
    <main>
      <h1>Login Page</h1>
      <form action={login}>
        <label htmlFor='user-role'>Choose a user role:</label>
        <select name='role' id='user-role'>
          <option value=''>--User Role--</option>
          <option value='admin'>Admin</option>
          <option value='parent'>Parent</option>
        </select>
        <button type='submit'>Log in</button>
      </form>
    </main>
  );
}
