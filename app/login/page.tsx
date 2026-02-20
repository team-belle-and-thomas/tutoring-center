import { Playfair_Display } from 'next/font/google';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { login } from '@/lib/mock-api';
import { UserRound, UserRoundCog } from 'lucide-react';

const playfair = Playfair_Display({ style: 'italic', subsets: ['latin'] });
export default function LoginPage() {
  return (
    <main>
      <h3 className={`${playfair.className} text-2xl uppercase text-primary mb-5 tracking-widest font-extrabold`}>
        Momentum Learning
      </h3>
      <form action={login} className='text-primary text-center'>
        <FieldGroup>
          <FieldSet className='flex flex-col items-center justify-center w-full text-center gap-y-6'>
            <FieldLegend className='!text-4xl flex mx-auto mb-4 text-center border-b-2 border-primary'>
              Login
            </FieldLegend>

            <FieldDescription className='text-lg text-center'>
              Login in to your Momentum Learning account.
            </FieldDescription>

            <RoleField />
          </FieldSet>
        </FieldGroup>
        <Button className='rounded-none text-xl w-fit font-bold py-6 px-6 mt-6' size='sm'>
          <span className='border-b-2 border-b-white'>Login</span>
        </Button>
      </form>
    </main>
  );
}
function RoleField() {
  return (
    <FieldGroup className='w-full max-w-xs'>
      <FieldSet>
        <FieldLegend className='!text-2xl flex mx-auto text-center' variant='label'>
          Role
        </FieldLegend>
        <FieldDescription className='text-lg text-center'>Select your role.</FieldDescription>
        <RadioGroup
          name='role'
          required={true}
          className='flex flex-row items-center justify-center w-full gap-6 bg-secondary'
        >
          <FieldLabel htmlFor='parent' className='cursor-pointer border'>
            <Field orientation='vertical' className='items-center'>
              <FieldContent className='flex flex-col items-center'>
                <FieldTitle className='text-black'>Parent</FieldTitle>
                <UserRound size={48} />
              </FieldContent>
              <RadioGroupItem value='parent' id='parent' className='mt-2' />
            </Field>
          </FieldLabel>

          <FieldLabel htmlFor='admin' className='cursor-pointer border'>
            <Field orientation='vertical' className='items-center'>
              <FieldContent className='flex flex-col items-center'>
                <FieldTitle className='text-black'>Admin</FieldTitle>
                <UserRoundCog size={48} />
              </FieldContent>
              <RadioGroupItem value='admin' id='admin' className='mt-2' />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </FieldSet>
    </FieldGroup>
  );
}
