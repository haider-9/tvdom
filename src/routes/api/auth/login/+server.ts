import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectToDatabase } from '$lib/server/database';
import { User } from '$lib/server/models/User';

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user || !user.passwordHash) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // For now we treat passwordHash as a plain stored password value.
    // This MUST be replaced by proper hashing in a real application.
    if (user.passwordHash !== password) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    return json({ user });
  } catch (error) {
    console.error('Error during login:', error);
    return json({ error: 'Login failed' }, { status: 500 });
  }
};
