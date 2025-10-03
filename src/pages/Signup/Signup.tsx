import { useEffect, useState } from 'react';
import { FormInput, SubmitBtn } from '../../components/index';
import {
  Form,
  Link,
  redirect,
  type ActionFunctionArgs,
} from 'react-router-dom';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

interface Country {
  id: number;
  name: string;
  code: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  // Convert to FormData to avoid preflight (same fix as login)
  const submitData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    submitData.append(`user[${key}]`, value as string);
  });

  try {
    await customFetch.post('/users/signup', submitData);
    toast.success('account created successfully');
    return redirect('/login');

  } catch (error) {
    const err = error as AxiosError<{ error: { message: string } }>;
    const errorMessage =
      err.response?.data?.error?.message || 'Double check thy credentials';
    toast.error(errorMessage);
    return null;
  }
};

const Signup = () => {
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      const res = await customFetch.get('/countries');
      setCountries(res.data);
    };
    fetchCountries();
  }, []);

  return (
    <section className="h-screen grid place-items-center">
      <Form
        method="POST"
        className="card w-150 p-8 bg-base shadow-lg flex flex-col gap-y-4"
      >
        <h4> Sign Up to ORBITAL FINANCES </h4>
        <div className="flex flex-row">
          <div className="flex flex-col gap-x-10 mx-10">
            <FormInput
              type="email"
              label="Email (required)"
              name="email"
              placeholder="user@email.com"
            />
            <FormInput
              type="password"
              label="Password (required)"
              name="password"
              placeholder="user123456"
            />
            <FormInput
              type="password"
              label="Password Confirmation (required)"
              name="password_confirmation"
              placeholder="user123456"
            />
            <FormInput
              type="text"
              label="First Name (required)"
              name="first_name"
              placeholder="Juan Patricio"
            />
            <FormInput
              type="text"
              label="Middle Name"
              name="middle_name"
              placeholder="Chameleon"
            />
            <FormInput
              type="text"
              label="Last Name (required)"
              name="last_name"
              placeholder="Villalobos"
            />
            <FormInput
              type="date"
              label="Date of Birth (required)"
              name="date_of_birth"
              placeholder="1990/01/01"
            />
          </div>
          <div className="flex flex-col gap-x-10">
            <FormInput
              type="text"
              label="Address Line 01"
              name="address_line_01"
              placeholder="Unit No, Apartment Name, Street"
            />
            <FormInput
              type="text"
              label="Address Line 02"
              name="address_line_02"
              placeholder="Village / Town / City"
            />
            <FormInput
              type="text"
              label="Zip Code (required)"
              name="zip_code"
              placeholder="1234"
            />
            <FormInput
              as="select"
              label="Country (required)"
              name="country_id"
              options={countries
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => ({ value: c.id, label: c.name }))}
            />
            <FormInput
              type="text"
              label="Mobile No (required)"
              name="mobile_no"
              placeholder="+63 999 999 999"
            />
            <div className="my-4 gap-y-4">
              <Link to="/">
                <button className="btn bg-neutral-800 btn-block">Cancel</button>
              </Link>
              <SubmitBtn text="Sign Up" />
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
  );
};
export default Signup;
