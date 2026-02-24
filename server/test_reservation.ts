import { getBalance } from './credits';
import { placeSession } from './reservations';

async function testPlaceSession() {
  const parent_id = 4;
  const student_id = 6;
  const tutor_id = 3;
  const subject_id = 5;
  const scheduled_at = '2024-07-01T10:00:00Z';
  const ends_at = '2024-07-01T11:30:00Z';

  console.log('Before placing session:');
  const balance = await getBalance(parent_id);
  console.dir(balance);

  if (balance.error) {
    console.error('Error fetching balance:', balance.error);
    return;
  }

  if (!balance.data) {
    console.error('No balance data found for parent');
    return;
  }

  const { amount_available } = balance.data[0];

  const { data, error } = await placeSession(parent_id, student_id, tutor_id, subject_id, scheduled_at, ends_at);

  if (error) {
    console.log('Error placing session:', error);
    return;
  } else {
    console.log('Placed session:');
    console.dir(data);
  }

  console.log('After placing session:');
  console.dir(await getBalance(parent_id));
}

testPlaceSession();
