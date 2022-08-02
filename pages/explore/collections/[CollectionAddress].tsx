import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import { useNFTCollection, useMarketplace } from '@thirdweb-dev/react';
import { NFTMetadataOwner, DirectListing } from '@thirdweb-dev/sdk/dist/browser';
import { MdAdd } from 'react-icons/md';
import { Toaster } from 'react-hot-toast';
import { getCollection, updateCollection, Collection } from '../../../utils/collections';
import NFTCard from '../../../components/cards/NFTCard';
import MintNFTModal from '../../../components/modals/MintNFTModal';
import CollectionModal from '../../../components/modals/CollectionModal';

const CollectionAddress: NextPage = () => {
   const router = useRouter();
   const address = useAddress();
   const nftCollection = useNFTCollection(router.query.CollectionAddress as string);
   const marketplace = useMarketplace(process.env.NEXT_PUBLIC_NFT_MARKETPLACE);

   const [pageTitle, updatePageTitle] = useState<string>('OpenSea Clone');
   const [currentCollection, updateCurrentCollection] = useState<Collection>();
   const [NFTs, updateNFTs] = useState<NFTMetadataOwner[]>();
   const [listings, updateListings] = useState<DirectListing[]>([]);
   const [isCurrentUser, updateIsCurrentUser] = useState<boolean>(false);
   const [showMintNFTModal, updateShowMintNFTModal] = useState<boolean>(false);
   const [showCollectionsModal, updateShowCollectionsModal] = useState<boolean>(false);
   const [isLoading, updateIsLoading] = useState<boolean>(true);

   const initialLoad = useRef<boolean>(true);

   useEffect(() => {
      if (!router.query.CollectionAddress || !nftCollection || !marketplace) return;

      if (initialLoad.current) {
         initialLoad.current = false;
         getCollectionData();
      }

      if (currentCollection) {
         if (currentCollection.ownerAddress === address) {
            updateIsCurrentUser(true);
            router.query.mint_nft ? updateShowMintNFTModal(true) : updateShowMintNFTModal(false);
            router.query.edit_collection ? updateShowCollectionsModal(true) : updateShowCollectionsModal(false);
         } else {
            updateIsCurrentUser(false);
            if (router.query.mint_nft) Router.replace({ pathname: '/explore/collections/' + currentCollection.collectionAddress });
            if (router.query.edit_collection) Router.replace({ pathname: '/explore/collections/' + currentCollection.collectionAddress });
         }

         updatePageTitle(`${currentCollection?.title}  |  OpenSea Clone`);
      }

      if (currentCollection && NFTs) {
         if (NFTs?.length !== currentCollection?.items) updateCollectionItems(NFTs?.length as number);
      }
   }, [nftCollection, marketplace, router.query.CollectionAddress, address, currentCollection, NFTs]);

   const getCollectionData = async () => {
      if (!nftCollection || !marketplace) return;

      updateCurrentCollection((await getCollection(router.query.CollectionAddress as string)) as Collection);

      const promises = [nftCollection.getAll(), marketplace.getAllListings()];
      const blockChainData = await Promise.all(promises);

      updateNFTs(blockChainData[0] as NFTMetadataOwner[]);
      updateListings(blockChainData[1] as DirectListing[]);
      updateIsLoading(false);
   };

   const updateCollectionItems = async (newItemCount: number) => {
      updateCollection(
         currentCollection?.id!,
         currentCollection?.collectionAddress!,
         currentCollection?.description!,
         newItemCount,
         currentCollection?.floorPrice!,
         currentCollection?.ownerAddress!
      );
   };

   return (
      <>
         <Head>
            <title>{pageTitle}</title>
            <link rel="icon" href="/images/opensea.png" />
         </Head>
         <div className="overflow-hidden">
            <div className={style.imageContainer}>
               {isLoading ? <div className={style.loading + ' w-full aspect-[3/1]'} /> : <img className={style.bannerImage} src={currentCollection?.bannerImage} alt="banner" />}
               <div className={style.logoContainer}>
                  {isLoading ? (
                     <div className={style.loading + ' w-full aspect-square rounded-full'} />
                  ) : (
                     <img className={style.profileImg} src={currentCollection?.logoImage} alt="profile image" />
                  )}
               </div>
            </div>
            <div className={style.infoContainer}>
               {isLoading ? <div className={style.loading + ' my-2 ml-5 w-60 h-[2.25rem] rounded-lg'} /> : <span className={style.title}>{currentCollection?.title}</span>}
               {isLoading ? (
                  <div className={style.loading + ' my-2 ml-5 w-1/2 h-[1.75rem] rounded-lg'} />
               ) : (
                  <span className={style.description}>{currentCollection?.description}</span>
               )}
               {isLoading ? (
                  <div className={style.loading + ' my-2 ml-5 w-40 h-[1rem] rounded-lg'} />
               ) : (
                  <span className={style.creator}>
                     By:{' '}
                     <Link href={`/${currentCollection?.ownerAddress}`}>
                        <span className="cursor-pointer hover:border-b-2">{currentCollection?.ownerName}</span>
                     </Link>
                  </span>
               )}
               {isLoading ? (
                  <div className="flex gap-10">
                     <div className={style.loading + ' my-2 ml-5 w-20 h-[2rem] rounded-lg'} />
                     <div className={style.loading + ' my-2 ml-5 w-20 h-[2rem] rounded-lg'} />
                     <div className={style.loading + ' my-2 ml-5 w-20 h-[2rem] rounded-lg'} />
                  </div>
               ) : (
                  <div className={style.infoItems}>
                     <div className={style.infoItem}>
                        <span className={style.itemValue}>{NFTs?.length ?? currentCollection?.items}</span>
                        <span className={style.itemLabel}>Items</span>
                     </div>
                     <div className={style.infoItem}>
                        <span className={style.itemValue}>
                           <img src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg" alt="eth" className={style.ethLogo} />
                           <span className={style.itemValue}>{currentCollection?.floorPrice}</span>
                        </span>
                        <span className={style.itemLabel}>Floor Price</span>
                     </div>
                     <div className={style.infoItem}>
                        <span className={style.itemValue}>
                           <img src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg" alt="eth" className={style.ethLogo} />
                           <span className={style.itemValue}>{currentCollection?.volumeTraded}</span>
                        </span>
                        <span className={style.itemLabel}>Total Volume</span>
                     </div>
                     {isCurrentUser && (
                        <div className={style.buttonWrapper}>
                           <button
                              className={style.accentedButton}
                              onClick={() => Router.replace({ pathname: '/explore/collections/' + currentCollection!.collectionAddress, query: { mint_nft: true } })}
                           >
                              <MdAdd className="ml-[-2px]" /> Mint
                           </button>
                           {showMintNFTModal && (
                              <MintNFTModal
                                 collectionAddress={currentCollection!.collectionAddress}
                                 close={(success: boolean | undefined) => {
                                    if (success) {
                                       updateCollectionItems(currentCollection?.items! + 1);
                                       getCollectionData();
                                    }
                                    Router.replace({ pathname: '/explore/collections/' + currentCollection!.collectionAddress });
                                 }}
                              />
                           )}

                           <button
                              className={style.button}
                              onClick={() => Router.replace({ pathname: '/explore/collections/' + currentCollection!.collectionAddress, query: { edit_collection: true } })}
                           >
                              Edit Collection
                           </button>
                           {showCollectionsModal && (
                              <CollectionModal
                                 isNewCollection={false}
                                 name={currentCollection!.ownerName}
                                 ownerAddress={currentCollection!.ownerAddress}
                                 collection={currentCollection}
                                 close={async () => {
                                    Router.replace({ pathname: '/explore/collections/' + currentCollection!.collectionAddress });
                                    updateCurrentCollection((await getCollection(router.query.CollectionAddress as string)) as Collection);
                                 }}
                              />
                           )}
                        </div>
                     )}
                  </div>
               )}
            </div>
            {!NFTs?.length && <span className={style.noListings}>There are no listings with this collection yet.</span>}
            <div className="grid grid-cols-4 mx-20">
               {NFTs?.map((nftItem, index) => {
                  const currentListing = listings.find((listing) => listing.asset.id._hex === nftItem.metadata.id._hex);
                  return (
                     <NFTCard
                        key={index}
                        id={nftItem.metadata.id._hex}
                        name={nftItem.metadata.name!}
                        image={nftItem.metadata.image!}
                        collectionAddress={router.query.CollectionAddress as string}
                        isListed={currentListing ? true : false}
                        price={currentListing?.buyoutCurrencyValuePerToken.displayValue || undefined}
                     />
                  );
               })}
            </div>
         </div>
         <Toaster position="top-center" reverseOrder={false} />
      </>
   );
};

const style = {
   imageContainer: 'w-screen relative',
   loading: 'bg-[#ffffff10] animate-pulse',
   bannerImage: 'w-full aspect-[3/1] object-cover',
   logoContainer: 'p-2 w-48 absolute bottom-5 left-10 bg-[#222222] rounded-lg',
   profileImg: 'w-full object-cover rounded-full',
   infoContainer: 'ml-5 flex flex-col items-start relative',
   title: 'my-2 ml-5 text-4xl font-bold text-[#FFFFFF] bg-transparent border-none',
   description: 'my-2 ml-5 w-1/2 text-lg text-[#cccccc] bg-transparent border-none',
   creator: 'my-2 ml-5 text-[#FFFFFF]',
   infoItems: 'mt-5 mb-10 px-5 w-screen flex justify-start items-center gap-10',
   infoItem: 'flex flex-col justify-end items-center',
   ethLogo: 'h-6 mr-2',
   itemValue: 'max-w-[5rem] text-2xl text-[#FFFFFF] text-center bg-transparent border-none flex justify-center items-center focus:outline-none placeholder:text-[#FFFFFF]',
   itemLabel: 'text-sm text-[#999999] text-center',
   buttonWrapper: 'mr-10 ml-auto flex items-center gap-10',
   button: 'px-5 py-2 text-md font-semibold text-[#FFFFFF] bg-[#363840] border rounded-lg hover:bg-[#4c505c] cursor-pointer',
   accentedButton: 'px-5 py-2 text-md font-semibold text-[#FFFFFF] bg-[#2181e2] rounded-lg flex items-center gap-2 hover:bg-[#42a0ff] cursor-pointer',
   noListings: 'my-20 mx-auto text-white text-xl text-center text-[#999999] block',
};

export default CollectionAddress;
