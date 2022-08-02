import Router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import { NFTMetadataOwner, Marketplace, DirectListing } from '@thirdweb-dev/sdk/dist/browser';
import { successToast, errorToast } from '../../utils/toasts';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import NewListingModal from './NewListingModal';

interface Props {
   isListed: boolean;
   selectedNft: NFTMetadataOwner;
   currentListing: DirectListing;
   market: Marketplace;
   updateNFT: () => void;
}

const Purchase: React.FC<Props> = ({ isListed, selectedNft, currentListing, market, updateNFT }) => {
   const router = useRouter();
   const address = useAddress();

   const [isCurrentOwner, updateIsCurrentOwner] = useState<boolean>(false);
   const [showNewListingModal, updateShowNewListingModal] = useState<boolean>(false);
   const [loading, updateLoading] = useState<boolean>(false);

   useEffect(() => {
      if (!router.query || !selectedNft) return;

      if (selectedNft.owner === address) {
         updateIsCurrentOwner(true);

         router.query.create_new_listing ? updateShowNewListingModal(true) : updateShowNewListingModal(false);
      } else {
         updateIsCurrentOwner(false);
         updateShowNewListingModal(false);

         if (router.query.create_new_listing) {
            Router.replace({
               pathname: `/explore/nfts/${router.query.nftIds}`,
               query: { is_listed: isListed, collection_address: router.query.collection_address, create_new_listing: true },
            });
         }
      }
   }, [router.query, selectedNft, currentListing, isListed, address]);

   const buyItem = async (quantityDesired = 1) => {
      updateLoading(true);
      try {
         await market.buyoutListing(currentListing.id, quantityDesired);
         successToast('Purchase successful!');
         updateNFT();
      } catch (err) {
         console.error(err);
         errorToast('Problem purchasing NFT');
      }
      updateLoading(false);
   };

   if (!selectedNft) return <div className="p-10 bg-[#ffffff10] rounded-lg animate-pulse" />;
   return (
      <div className="px-10 py-5 flex w-full items-center rounded-lg border border-[#151c22] bg-[#303339] px-12">
         {isCurrentOwner ? (
            <>
               {isListed ? (
                  <span>This item is already listed.</span>
               ) : (
                  <>
                     <button
                        className={`${style.button} bg-[#2081e2] hover:bg-[#42a0ff]`}
                        onClick={() => {
                           Router.replace({
                              pathname: `/explore/nfts/${router.query.nftIds}`,
                              query: { is_listed: isListed, collection_address: router.query.collection_address, create_new_listing: true },
                           });
                        }}
                     >
                        <span className={style.buttonText + ' ml-auto'}>List Item</span>
                     </button>
                     {showNewListingModal && (
                        <NewListingModal
                           market={market!}
                           collectionAddress={router.query.collection_address as string}
                           tokenId={selectedNft?.metadata.id}
                           close={(successful: boolean | undefined) => {
                              if (successful) updateNFT();
                              Router.replace({
                                 pathname: `/explore/nfts/${router.query.nftIds}`,
                                 query: { is_listed: successful, collection_address: router.query.collection_address },
                              });
                           }}
                        />
                     )}
                  </>
               )}
            </>
         ) : (
            <>
               {isListed && currentListing ? (
                  <div className="w-full flex justify-between items-center">
                     <span className="text-xl">{`Price: ${(currentListing?.buyoutPrice as unknown as number) / 10 ** 18}ETH`}</span>
                     <div className={`${style.button} bg-[#2081e2] hover:bg-[#42a0ff]`} onClick={() => (loading ? null : buyItem())}>
                        {loading && (
                           <div className={style.loadingSpinner}>
                              <AiOutlineLoading3Quarters />
                           </div>
                        )}
                        <span className={style.buttonText}>Buy Now</span>
                     </div>
                  </div>
               ) : (
                  <span>This item is currently not for sale.</span>
               )}
            </>
         )}
      </div>
   );
};

const style = {
   button: 'mr-8 flex items-center py-2 px-12 rounded-lg cursor-pointer',
   loadingSpinner: 'ml-[-0.5em] mr-1 text-white font text-2xl animate-spin',
   buttonText: 'ml-2 text-lg font-semibold',
};

export default Purchase;
