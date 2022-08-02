import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Router from 'next/router';
import { useState } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import openseaLogo from '../public/images/opensea.png';
import { CgProfile } from 'react-icons/cg';
import WalletAddressModal from '../components/modals/WalletAddressModal';

const style = {
   wrapper: 'px-[1.2rem] py-[0.8rem] w-screen bg-[#04111d] flex justify-between fixed z-10',
   logoContainer: 'flex items-center cursor-pointer',
   logoText: 'ml-[0.8rem] text-white font-semibold text-2xl',
   searchBar: 'flex flex-1 mx-[0.8rem] w-max-[520px] items-center bg-[#363840] rounded-[0.8rem] hover:bg-[#4c505c]',
   searchIcon: 'text-[#8a939b] mx-3 font-bold text-lg',
   searchInput: 'h-[2.6rem] w-full border-0 bg-transparent outline-0 ring-0 px-2 pl-0 text-[#e6e8eb] placeholder:text-[#8a939b] focus:outline-none',
   headerItems: 'flex items-center justify-end',
   headerItem: 'text-white px-4 font-bold text-[#c8cacd] hover:text-white cursor-pointer',
   headerIcon: 'text-[#8a939b] text-3xl font-black px-4 hover:text-white cursor-pointer',
};

const Header = () => {
   const address = useAddress();
   const [showModal, updateShowModal] = useState<boolean>(false);

   return (
      <>
         <div className={style.wrapper}>
            <Link href="/">
               <div className={style.logoContainer}>
                  <Image src={openseaLogo} height={40} width={40} />
                  <div className={style.logoText}>Opensea</div>
               </div>
            </Link>
            <div className={style.headerItems}>
               <Link href={`/explore`}>
                  <div className={style.headerItem}> Explore </div>
               </Link>
               <div onClick={() => (address ? Router.push({ pathname: `/profiles/${address}`, query: { create_collection: true } }) : updateShowModal(true))}>
                  <div className={style.headerItem}> Create </div>
               </div>
               <div className={style.headerIcon} onClick={() => (address ? Router.push({ pathname: `/profiles/${address}` }) : updateShowModal(true))}>
                  <CgProfile />
               </div>
            </div>
         </div>

         {showModal && <WalletAddressModal close={() => updateShowModal(false)} />}
      </>
   );
};

export default Header;
