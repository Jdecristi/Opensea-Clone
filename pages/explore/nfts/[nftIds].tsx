import { NextPage } from 'next';
import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNFTCollection, useMarketplace } from '@thirdweb-dev/react';
import { NFTMetadataOwner, DirectListing } from '@thirdweb-dev/sdk/dist/browser';
import { IoMdSnow } from 'react-icons/io';
import { AiOutlineHeart } from 'react-icons/ai';
import GeneralDetails from '../../../components/nft-page/GeneralDetails';
import Purchase from '../../../components/nft-page/Purchase';

const NFT: NextPage = () => {
   const router = useRouter();
   const nftCollection = useNFTCollection(router.query.collection_address as string);
   const marketplace = useMarketplace(process.env.NEXT_PUBLIC_NFT_MARKETPLACE);

   const [nft, updateNft] = useState<NFTMetadataOwner>();
   const [listing, updateListing] = useState<DirectListing>();

   const initailLoad = useRef<boolean>(true);

   useEffect(() => {
      if (!router || !nftCollection || !marketplace) return;

      if (initailLoad.current) {
         initailLoad.current = false;
         getListingAndNFT();
      }
   }, [router, nftCollection, marketplace]);

   const getListingAndNFT = async () => {
      const [allNFTs, listings] = await Promise.all([nftCollection!.getAll(), marketplace!.getAllListings()]);

      const listing = listings.find((listing) => listing.asset.id._hex === router.query.nftIds);
      const nft = allNFTs.find((nft) => nft.metadata.id._hex === router.query.nftIds);

      updateListing(listing as DirectListing);
      updateNft(nft);
   };

   return (
      <>
         <Head>
            <title>NFTs | OpenSea Clone</title>
            <link rel="icon" href="/images/opensea.png" />
         </Head>
         <div className={style.wrapper}>
            <div className={style.container}>
               <div className={style.topContent}>
                  <div className={style.nftImgContainer}>
                     <div className={style.imageCard}>
                        <div className={style.topBar}>
                           <div className={style.topBarContent}>
                              <IoMdSnow />
                              <div className={style.likesCounter}>
                                 <AiOutlineHeart />
                                 2.3K
                              </div>
                           </div>
                        </div>
                        <div className={style.image}>
                           {nft?.metadata.image ? <img src={nft?.metadata.image} className={style.image} /> : <div className={style.imagePlaceholder} />}
                        </div>
                     </div>
                  </div>
                  <div className={style.detailsContainer}>
                     <GeneralDetails collectionAddress={router.query.collection_address as string} selectedNft={nft as NFTMetadataOwner} />
                     <Purchase isListed={listing ? true : false} selectedNft={nft!} currentListing={listing!} market={marketplace!} updateNFT={getListingAndNFT} />
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

const style = {
   wrapper: 'flex flex-col items-center container-lg text-[#e5e8eb]',
   container: 'container p-6',
   topContent: 'flex',
   nftImgContainer: 'flex-1 mr-4',
   imageCard: 'bg-[#303339] p-2 rounded-lg border-[#151c22] border',
   topBar: 'p-2',
   topBarContent: 'flex items-center',
   likesCounter: 'flex-1 flex items-center justify-end gap-2',
   image: 'block w-full aspect-square rounded-xl',
   imagePlaceholder: 'block w-full aspect-square bg-[#ffffff10] rounded-xl animate-pulse',
   detailsContainer: 'flex-[2] ml-4',
};

export default NFT;
