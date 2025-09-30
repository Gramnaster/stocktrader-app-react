import { FormInput, SubmitBtn } from '../../components/index';
import { Form, Link } from 'react-router-dom';

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
          <Link to="/" className="btn bg-neutral-800 btn-block">
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
