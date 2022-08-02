import React from 'react';
import Header from './Header';
import { Toaster } from 'react-hot-toast';

interface Props {
   children: React.ReactNode;
}
const Layout: React.FC<Props> = ({ children }) => {
   return (
      <>
         <Header />
         <main className="pt-16 w-screen">{children}</main>
         <Toaster position="top-center" reverseOrder={false} />
      </>
   );
};

export default Layout;
