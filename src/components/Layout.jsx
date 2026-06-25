import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const Layout = () => {
  return (
    <div className="page-with-bottom-nav">
      <Outlet />
      <BottomNavigation />
    </div>
  );
};

export default Layout;
