import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { useMarketplace } from '@thirdweb-dev/react';
import { DirectListing } from '@thirdweb-dev/sdk/dist/browser';
import { getCollections, Collection } from '../../utils/collections';
import CollectionCard from '../../components/cards/CollectionCard';
import NFTCard from '../../components/cards/NFTCard';

const Collections: NextPage = () => {
   const [collections, updateCollections] = useState<Collection[]>([]);
   const [listings, updateListings] = useState<DirectListing[]>([]);
   const [selectedLink, updateSelectedLink] = useState<string>('collections');
   const marketplace = useMarketplace(process.env.NEXT_PUBLIC_NFT_MARKETPLACE);

   const initialLoad = useRef<boolean>(true);

   useEffect(() => {
      (async () => {
         if (initialLoad.current) {
            initialLoad.current = false;
            await getCollections(); // must be called twice to get all records
            setTimeout(async () => updateCollections(await getCollections()), 250);
         }

         if (marketplace) updateListings((await marketplace.getAllListings()) as DirectListing[]);
      })();
   }, [marketplace]);

   return (
      <>
         <Head>
            <title>Collections | OpenSea Clone</title>
            <link rel="icon" href="/images/opensea.png" />
         </Head>
         <div className={style.selectionHeader}>
            <button className={selectedLink === 'collections' ? style.selectedLink : style.selectionLink} onClick={() => updateSelectedLink('collections')}>
               Collections
            </button>
            <button className={selectedLink === 'listings' ? style.selectedLink : style.selectionLink} onClick={() => updateSelectedLink('listings')}>
               Listings
            </button>
         </div>
         {selectedLink === 'collections' ? (
            <div className={style.collections}>
               {collections?.map((collection, index) => (
                  <CollectionCard
                     key={index}
                     collectionAddress={collection.collectionAddress}
                     title={collection.title}
                     bannerImageUrl={collection.bannerImage}
                     imageUrl={collection.logoImage}
                  />
               ))}
            </div>
         ) : (
            <div className={style.listings}>
               {listings?.map((listing, index) => (
                  <NFTCard
                     key={index}
                     id={listing.asset.id._hex}
                     name={listing.asset.name!}
                     image={listing.asset.image!}
                     collectionAddress={listing.assetContractAddress}
                     isListed={true}
                     price={listing.buyoutCurrencyValuePerToken.displayValue || undefined}
                  />
               ))}
            </div>
         )}
      </>
   );
};

const style = {
   selectionHeader: 'py-10 w-screen flex justify-center items-center gap-20',
   selectedLink: 'pb-[10px] text-3xl text-white',
   selectionLink: 'pb-[12px] text-3xl text-[#999999] hover:text-white tab-index-0 hover:pb-[10px] hover:border-b-2 hover:border-white focus:text-white',
   collections: 'grid grid-cols-3 mx-20',
   listings: 'grid grid-cols-4 mx-20',
};

export default Collections;
