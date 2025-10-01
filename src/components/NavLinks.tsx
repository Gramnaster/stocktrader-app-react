import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import type { RootState } from '../store';

interface LinksType {
  id: number;
  url: string;
  text: string;
}
const links: LinksType[] = [
  { id: 0, url: '/', text: 'Home' },
  { id: 1, url: 'companies', text: 'Companies' },
  { id: 2, url: 'about', text: 'About Us' },
];

const NavLinks = () => {
  const user = useSelector((state: RootState) => state.userState.user);
  return (
    <>
      {links.map((link) => {
        const { id, url, text } = link;
        if (url === 'companies' && !user) return null;
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
