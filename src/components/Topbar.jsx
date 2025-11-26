import React from 'react';
import { useLocation } from 'react-router-dom';
import usrImg from '../assets/usr.png';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const location = useLocation();
  const path = location.pathname;
 const navigate = useNavigate(); 
  // Map paths to titles
  const title = {
    '/': { title: 'Shop', subtitle: 'Shop > Books' },
    '/stores': { title: 'Stores', subtitle: 'Admin > Stores' },
    '/author': { title: 'Authors', subtitle: 'Admin > Authors' },
    '/books': { title: 'Books', subtitle: 'Admin > Books' },
    '/store/:storeId': { title: 'Store Inventory', subtitle: 'Admin > Store Inventory' },
    '/browsebooks': { title: 'Browse Books', subtitle: 'Shop > Books' },
    '/browseauthors': { title: 'Browse Authors', subtitle: 'Shop > Authors' },
  };

  // Get user from cookie
  const userCookie = Cookies.get('user');
  const user = userCookie ? JSON.parse(userCookie) : null;

  const onSignOut = ()=>{
    Cookies.remove("user")
    navigate("/", { replace: true });
  }
  return (
    <div className="h-24 border-b border-b-secondary-text flex justify-between items-center px-6">
      <div className="flex flex-col justify-start items-start">
        <p className="text-lg text-secondary-text">{title[path]?.title}</p>
        <p className="font-light text-secondary-text">{title[path]?.subtitle}</p>
      </div>

      <div className="flex-1 flex justify-end items-center gap-3">
        {user ? (
          <>
            <img src={usrImg} alt="profile" className="ml-4 rounded w-10 h-10" />
            <p className="text-secondary-text font-light">{user.name}</p>
            <button
              onClick={onSignOut}
              className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </>
        ) : (
           <button
              onClick={()=>navigate("/login", { replace: true })}
              className="ml-4 px-3 py-1 bg-orange-500 text-white rounded "
            >
              Sign in
            </button>
        )}
      </div>
    </div>
  );
};

export default Topbar;
