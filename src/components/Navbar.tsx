import { Link, NavLink } from 'react-router-dom';
import logoIcon from '../assets/images/logo-1.png';
import userIcon from '../assets/images/icon-user.png';
import languageIcon from '../assets/images/icon-language.png';
import hamburgerIcon from '../assets/images/icon-hamburger.png';
import NavLinks from './NavLinks';
import { useState } from 'react';

const Navbar = () => {
  const [theme, setTheme] = useState(false);

  return (
    <nav className="bg-neutral px-10 max-h-[75px]">
      <div className="navbar align-element">
        <div className="navbar-start">
          <NavLink
            to="/"
            className="hidden lg:flex btn text-2xl bg-transparent text-secondary items-center"
          >
            <img src={logoIcon} alt="Logo" className="w-[42px] h-[42px]" />
            ORBITAL.FINANCES
          </NavLink>
          {/* Dropdown Menu */}
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <img src={hamburgerIcon} alt="Hamburger" />
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box"
            >
              <NavLinks />
            </ul>
          </div>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal">
            <NavLinks />
          </ul>
        </div>
        <div className="navbar-end">
          <div className="flex gap-x-y justify-center items-center ">
            <button className="btn btn-primary h-[33px]">
              <Link to="/login" className="link link-hover text-cs sm:text-sm">
                Login
              </Link>
            </button>
            <button className="btn bg-transparent h-[28px] ml-4">
              <img src={userIcon} alt="user-icon" />
            </button>
            <button className="btn bg-transparent h-[30px]">
              <img src={languageIcon} alt="language-icon" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
