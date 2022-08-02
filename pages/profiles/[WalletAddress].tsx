import { NextPage } from 'next';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useAddress, useDisconnect } from '@thirdweb-dev/react';
import { Toaster } from 'react-hot-toast';
import { getUser, User } from '../../utils/users';
import { getCollections, Collection } from '../../utils/collections';
import { MdAdd } from 'react-icons/md';
import CollectionCard from '../../components/cards/CollectionCard';
import EditProfileModal from '../../components/modals/EditProfileModal';
import CollectionModal from '../../components/modals/CollectionModal';

const Profile: NextPage = () => {
   const router = useRouter();
   const address = useAddress();
   const disconnect = useDisconnect();

   const [pageTitle, updatePageTitle] = useState<string>('OpenSea Clone');
   const [user, updateUser] = useState<User>();
   const [collections, updateCollections] = useState<Collection[]>([]);
   const [showProfileModal, updateShowProfileModal] = useState<boolean>(false);
   const [showCollectionsModal, updateShowCollectionsModal] = useState<boolean>(false);
   const [isCurrentUser, updateIsCurrentUser] = useState<boolean>(false);

   const urlAddress = useRef<string>(router.query.WalletAddress as string);
   const initialLoad = useRef<boolean>(true);

   useEffect(() => {
      if (!router.query.WalletAddress) return;
      if (urlAddress.current !== router.query.WalletAddress) {
         urlAddress.current = router.query.WalletAddress as string;
         initialLoad.current = true;
      }

      if (initialLoad.current) {
         (async () => {
            updateUser((await getUser(urlAddress.current as string)) as User);
            updateCollections((await getCollections(urlAddress.current as string)) as Collection[] | []);
         })();
         initialLoad.current = false;
      }

      if (!user) return;
      updatePageTitle(`${user?.name}  |  OpenSea Clone`);

      if (urlAddress.current === address) {
         updateIsCurrentUser(true);
         router.query.edit_profile ? updateShowProfileModal(true) : updateShowProfileModal(false);
         router.query.create_collection ? updateShowCollectionsModal(true) : updateShowCollectionsModal(false);
      } else {
         updateIsCurrentUser(false);
         if (router.query.edit_profile) Router.replace({ pathname: '/profiles/' + urlAddress.current });
         if (router.query.create_collection) Router.replace({ pathname: '/profiles/' + urlAddress.current });
      }
   }, [router.query, address, user]);

   return (
      <>
         <Head>
            <title>{pageTitle}</title>
            <link rel="icon" href="/images/opensea.png" />
         </Head>
         <div className="overflow-hidden">
            <div className={style.infoContainer}>
               <img className={style.profileImg} src={user?.imageUrl || 'https://via.placeholder.com/200'} alt="profile image" />
               <h1 className={style.title}>{user?.name}</h1>
            </div>
            {isCurrentUser && (
               <div className={style.buttonWrapper}>
                  <button className={style.button} onClick={() => Router.replace({ pathname: '/profiles/' + address, query: { edit_profile: true } })}>
                     Edit Profile
                  </button>
                  <button className={style.button} onClick={disconnect}>
                     Disconnect wallet
                  </button>
               </div>
            )}
            <div className="mt-10 px-20 w-screen flex justify-between items-center">
               <div className={style.collectionsTitle}>Collections</div>
               {isCurrentUser ? (
                  <button className={style.accentedButton} onClick={() => Router.replace({ pathname: '/profiles/' + address, query: { create_collection: true } })}>
                     <MdAdd className="ml-[-5px] mr-2" /> Create Collection
                  </button>
               ) : (
                  <div />
               )}
            </div>
            {!collections.length && <span className={style.noCollections}>There are no collections with this account yet.</span>}
            <div className={style.collections}>
               {collections.map((collection, index) => (
                  <CollectionCard
                     key={index}
                     collectionAddress={collection.collectionAddress}
                     title={collection.title}
                     bannerImageUrl={collection.bannerImage}
                     imageUrl={collection.logoImage}
                  />
               ))}
            </div>
         </div>

         {showProfileModal && (
            <EditProfileModal
               user={user!}
               close={async () => {
                  updateUser((await getUser(urlAddress.current as string)) as User);
               }}
            />
         )}
         {showCollectionsModal && (
            <CollectionModal
               isNewCollection={true}
               name={user!.name}
               ownerAddress={user!.address}
               close={async () => {
                  Router.push({ pathname: '/profiles/' + urlAddress.current });
                  updateCollections((await getCollections(urlAddress.current as string)) as Collection[] | []);
               }}
            />
         )}
         <Toaster position="top-center" reverseOrder={false} />
      </>
   );
};

const style = {
   infoContainer: 'p-10 w-screen flex flex-col items-center',
   profileImg: 'w-40 h-40 object-cover rounded-full border-2 border-[#202225]',
   title: 'my-5 text-white text-3xl text-left',
   buttonWrapper: 'flex fixed top-20 right-10',
   button: 'mr-5 px-5 py-2 font-semibold bg-[#363840] rounded-lg text-[#e4e8ea] hover:bg-[#4c505c] cursor-pointer',
   accentedButton: 'px-5 py-2 mr-5 font-semibold text-sm bg-[#2181e2] rounded-lg flex items-center text-white hover:bg-[#42a0ff] cursor-pointer',
   collectionsTitle: 'my-5 text-white text-3xl text-left',
   noCollections: 'my-20 mx-auto text-white text-xl text-center text-[#999999] block',
   collections: 'grid grid-cols-3 mx-20',
};

export default Profile;
