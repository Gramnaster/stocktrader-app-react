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
  { id: 4, url: 'dashboard/transactions', text: 'Transactions' },
  { id: 5, url: 'dashboard/stocktrading', text: 'Folio' },
];

const NavLinks = () => {
  const user = useSelector((state: RootState) => state.userState.user);
  return (
    <>
      {links.map((link) => {
        const { id, url, text } = link;
        if (
          (url === 'companies' ||
            url === 'dashboard' ||
            url === 'dashboard/wallet' ||
            url === 'dashboard/transactions') &&
          !user
        )
          return null;
        
        // Hide "About Us" when user is logged in
        if (url === 'about' && user) return null;
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
