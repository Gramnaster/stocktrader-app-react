import { FormInput, SubmitBtn } from '../../components/index';
import { Form, Link } from 'react-router-dom';

const Signup = () => {
  return (
    <section className="h-screen grid place-items-center">
      <Form method="POST" className='card w-150 p-8 bg-base shadow-lg flex flex-col gap-y-4'>
        <h4> Sign Up to ORBITAL FINANCES </h4>
        <div className='flex flex-row'>
          <div className='flex flex-col gap-x-10 mx-10'>
            <FormInput type='email' label='Email (required)' name='email' placeholder='user@email.com' />
            <FormInput type='password' label='Password (required)' name='password' placeholder='user123456' />
            <FormInput type='password' label='Password Confirmation (required)' name='password_confirmation' placeholder='user123456' />
            <FormInput type='text' label='First Name (required)' name='first_name' placeholder='Juan Patricio' />
            <FormInput type='text' label='Middle Name (required)' name='middle_name' placeholder='Chameleon' />
            <FormInput type='text' label='Last Name (required)' name='last_name' placeholder='Villalobos' />
            <FormInput type='text' label='Date of Birth (required)' name='username' placeholder='1990/01/01' />
          </div>
          <div className='flex flex-col gap-x-10'>
            <FormInput type='text' label='Address Line 01' name='address_line_01' placeholder='Unit No, Apartment Name, Street' />
            <FormInput type='text' label='Address Line 02' name='address_line_02' placeholder='Village / Town / City' />
            <FormInput type='text' label='Zip Code (required)' name='password_confirmation' placeholder='1234' />
            <FormInput type='text' label='Country (required)' name='first_name' placeholder='Philippines' />
            <FormInput type='text' label='Mobile No (required)' name='middle_name' placeholder='+63 999 999 999' />
            <div className="my-4 gap-y-4">
              <Link to='/'><button className='btn bg-neutral-800 btn-block'>Cancel</button></Link>
              <SubmitBtn text='Sign Up' />
            </div>
          <p>
            Already a member?
            <Link
              to="/login"
              className="ml-2 link link-hover link-secondary capitalize"
            >
              Login
            </Link>
          </p>
          </div>
        </div>
      </Form>
    </section>
  )
}
export default Signup