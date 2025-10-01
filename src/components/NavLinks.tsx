import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import type { RootState } from '../store';

interface LinksType {
  id: number;
  url: string;
  text: string;
}
const links: LinksType[] = [
  { id: 0, url: 'dashboard', text: 'Dashboard' },
  { id: 1, url: 'companies', text: 'Companies' },
  { id: 2, url: 'about', text: 'About Us' },
  { id: 3, url: 'dashboard/wallet', text: 'Wallet' },
];

const NavLinks = () => {
  const user = useSelector((state: RootState) => state.userState.user);
  return (
    <>
      {links.map((link) => {
        const { id, url, text } = link;
        if ((url === 'companies' || url === 'dashboard' || url === 'wallet') && !user) return null;
        return (
          <li key={id}>
            <NavLink to={url} className="capitalize">
              {text}
            </NavLink>
          </li>
        );
      })}
    </>
  );
};
export default NavLinks;
