import Link from 'next/link';
import Router from 'next/router';
import { useEffect } from 'react';
import { useAddress, useMetamask } from '@thirdweb-dev/react';
import { DB } from '../../libs/firebase';
import { collection, onSnapshot, query, where, addDoc } from '@firebase/firestore';
import { addUser } from '../../utils/users';
import ModalTemplate from './ModalTemplate';

interface Props {
   close: () => void;
}

const WalletAddressModal: React.FC<Props> = ({ close }) => {
   const connectWithMetamask = useMetamask();
   const address = useAddress();

   useEffect(() => {
      if (!address) return;

      const currentUser = query(collection(DB, 'Users'), where('address', '==', address));
      onSnapshot(currentUser, (snapshot) => {
         if (!snapshot.docs.length) {
            (async () => {
               await addUser(address);
               Router.push({ pathname: '/' + address, query: { editProfile: true } });
            })();
         }
      });

      close();
   }, [address]);

   return (
      <ModalTemplate>
         {{
            header: (
               <>
                  <h1 className={style.title}>Connect your MetaMask wallet?</h1>
                  <h2 className={style.subTitle}>In order to compleate any purchases or make a collection you must sign in with MetaMask</h2>
               </>
            ),
            body: (
               <div className={style.buttons}>
                  <button className={style.accentedButton} onClick={connectWithMetamask}>
                     Connect with MetaMask
                  </button>
                  <button className={style.button} onClick={() => close()}>
                     Continue without connecting
                  </button>
               </div>
            ),
            footer: (
               <>
                  <p className={style.disclaimer}>
                     This site only uses <b>Goerli</b> test network please make sure to have a <b>Goerli</b> wallet and sufficient <b>Test</b> ETH
                  </p>
                  <h2 className={style.paragraph}>
                     Dont have a MetaMask? Learn how to get one{' '}
                     <Link href="https://metamask.io/download/" passHref>
                        <a className="border-[#cccccc] hover:border-b-2" target="_blank">
                           <b>Here</b>
                        </a>
                     </Link>
                  </h2>
               </>
            ),
         }}
      </ModalTemplate>
   );
};

const style = {
   title: 'mb-10 text-white font text-3xl text-center',
   subTitle: 'mb-10 text-[#cccccc] font text-lg text-center',
   paragraph: 'mt-10 text-[#cccccc] font text-lg text-center',
   buttons: 'flex justify-around items-center',
   accentedButton: 'relative text-lg font-semibold px-9 py-4 text-sm bg-[#2181e2] rounded-lg mr-5 text-white hover:bg-[#42a0ff] cursor-pointer',
   button: ' relative text-lg font-semibold px-9 py-4 text-sm bg-[#363840] border rounded-lg mr-5 text-[#e4e8ea] hover:bg-[#4c505c] cursor-pointer',
   disclaimer: 'mt-10 text-[#999999] font text-sm text-center',
};

export default WalletAddressModal;
