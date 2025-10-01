import { FormInput, SubmitBtn } from '../../components/index';
import { 
  Form, 
  Link, 
  redirect, 
  type ActionFunctionArgs 
} from 'react-router-dom';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  console.log('Data:', data);
  
  // Modern React Router + Rails format
  const payload = { user: data };
  console.log('Payload:', payload);

  try {
    console.log('Payload inside try:', JSON.stringify(payload, null, 2));
    
    // Convert to FormData to avoid preflight
    const formData = new FormData();
    formData.append('user[email]', data.email);
    formData.append('user[password]', data.password);
    
    await customFetch.post('/users/login', formData);
    toast.success('logged in successfully');
    return redirect('/dashboard');
  } catch (error) {
    console.log('Try-Catch Login Error:', error);
    const err = error as AxiosError<{ error: { message: string } }>;
    const errorMessage =
      err.response?.data?.error?.message || 'Invalid credentials';
    toast.error(errorMessage);
    return null;
  }
};

const Login = () => {
  return (
    <section className="h-screen grid place-items-center">
      <Form
        method="post"
        className="card w-96 p-8 shadow-lg flex flex-col gap-y-5 outline-blue-800"
      >
        <h4 className="text-center text-3x1 font-bold">
          Login to Orbital Finances
        </h4>
        <FormInput
          type="email"
          label="Email (required)"
          name="email"
          placeholder="email@email.com"
        />
        <FormInput
          type="password"
          label="Password (required)"
          name="password"
          placeholder="pass1234"
        />
        <div className="mt-4 flex flex-col gap-y-5 items-center w-full">
          <SubmitBtn text="Login" />
          <button type="button" className="btn btn-primary btn-block">
            Guest User
          </button>
          <Link to="/">
            <button type="button" className="btn bg-neutral-800 btn-block">
              Cancel
            </button>
          </Link>
          <p>
            Not yet registered?
            <Link
              to="/signup"
              className="ml-2 link link-hover link-secondary capitalize"
            >
              Register
            </Link>
          </p>
        </div>
      </Form>
    </section>
  );
};
export default Login;
