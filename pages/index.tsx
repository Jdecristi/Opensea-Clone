import { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import toast, { Toaster } from 'react-hot-toast';
import WalletAddressModal from '../components/modals/WalletAddressModal';

const style = {
   walletConnectWrapper: 'h-screen w-screen flex flex-col justify-center items-center bg-[#3b3d42] ',
   details: 'text-lg text-center text=[#282b2f] font-semibold mt-4',
   wrapper: 'relative',
   container: `before:content-[''] before:bg-red-500 before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-[url('https://lh3.googleusercontent.com/ujepnqpnL0nDQIHsWxlCXzyw4pf01yjz1Jmb4kAQHumJAPrSEj0-e3ABMZlZ1HEpJoqwOcY_kgnuJGzfXbd2Tijri66GXUtfN2MXQA=s250')] before:bg-cover before:bg-center before:opacity-30 before:blur`,
   contentWrapper: 'flex h-screen relative justify-center flex-wrap items-center',
   copyContainer: 'w-1/2',
   title: 'relative text-white text-[46px] font-semibold',
   description: 'text-[#8a939b] container-[400px] text-2xl mt-[0.8rem] mb-[2.5rem]',
   ctaContainer: 'flex',
   accentedButton: 'relative text-lg font-semibold px-12 py-4 bg-[#2181e2] rounded-lg mr-5 text-white hover:bg-[#42a0ff] cursor-pointer',
   button: ' relative text-lg font-semibold px-12 py-4 bg-[#363840] rounded-lg mr-5 text-[#e4e8ea] hover:bg-[#4c505c] cursor-pointer',
   cardContainer: 'rounded-[3rem]',
   infoContainer: 'h-20 bg-[#313338] p-4 rounded-b-lg flex items-center text-white',
   author: 'flex flex-col justify-center ml-4',
   infoIcon: 'flex justify-end items-center flex-1 text-[#8a939b] text-3xl font-bold',
};

const Home: NextPage = () => {
   const [showModal, updateShowModal] = useState<boolean>(false);
   const address = useAddress();

   const initialLoad = useRef<boolean>(true);

   useEffect(() => {
      if (initialLoad.current) {
         initialLoad.current = false;
         if (!address) updateShowModal(true);
      }

      if (!address) return;

      updateShowModal(false);
      welocomeToast();
   }, [address]);

   const welocomeToast = (toastHandler = toast) => {
      toastHandler.success(`Welcome back!`, {
         style: {
            background: '#04111d',
            color: '#ffffff',
         },
      });
   };

   const checkAddress = () => {
      if (!address) return updateShowModal(true);

      Router.push({
         pathname: `/${address}`,
         query: { createCollection: true },
      });
   };

   return (
      <>
         <Head>
            <title>OpenSea Clone</title>
            <link rel="icon" href="/images/opensea.png" />
         </Head>
         <div className={style.wrapper}>
            <div className={style.container}>
               <div className={style.contentWrapper}>
                  <div className={style.copyContainer}>
                     <div className={style.title}>Discover, collect, and sell extraordinary NFTs</div>
                     <div className={style.description}>OpenSea is the world&apos;s first and largest NFT marketplace</div>
                     <div className={style.ctaContainer}>
                        <Link href="/explore">
                           <button className={style.accentedButton}>Explore</button>
                        </Link>
                        <button className={style.button} onClick={() => checkAddress()}>
                           Create
                        </button>
                     </div>
                  </div>
                  <div className={style.cardContainer}>
                     <img
                        className="rounded-t-lg"
                        src="https://lh3.googleusercontent.com/ujepnqpnL0nDQIHsWxlCXzyw4pf01yjz1Jmb4kAQHumJAPrSEj0-e3ABMZlZ1HEpJoqwOcY_kgnuJGzfXbd2Tijri66GXUtfN2MXQA=s550"
                        alt=""
                     />
                     <div className={style.infoContainer}>
                        <img
                           className="h-[2.25rem] rounded-full"
                           src="https://lh3.googleusercontent.com/qQj55gGIWmT1EnMmGQBNUpIaj0qTyg4YZSQ2ymJVvwr_mXXjuFiHJG9d3MRgj5DVgyLa69u8Tq9ijSm_stsph8YmIJlJQ1e7n6xj=s64"
                           alt=""
                        />
                        <div className={style.author}>
                           <div>Jolly</div>
                           <a
                              className="text-[#1868b7]"
                              href="https://opensea.io/assets/0x495f947276749ce646f68ac8c248420045cb7b5e/2324922113504035910649522729980423429926362207300810036887725141691069366277"
                           >
                              hola-kanola
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <Toaster position="top-center" reverseOrder={false} />
         {showModal && <WalletAddressModal close={() => updateShowModal(false)} />}
      </>
   );
};

export default Home;
