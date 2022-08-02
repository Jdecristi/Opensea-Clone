import { useState } from 'react';
import { Marketplace } from '@thirdweb-dev/sdk/dist/browser';
import { successToast, errorToast } from '../../utils/toasts';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import ModalTemplate from '../modals/ModalTemplate';

interface Props {
   market: Marketplace;
   collectionAddress: string;
   tokenId: any;
   close: (successful?: boolean) => void;
}

const NewListingModal: React.FC<Props> = ({ market, collectionAddress, tokenId, close }) => {
   const [price, updatePrice] = useState<string>('');
   const [duration, updateDuration] = useState<number>(0);
   const [loading, updateLoading] = useState<boolean>(false);

   const handleSubmit = async () => {
      updateLoading(true);
      await createListing();
      updateLoading(false);
      close(true);
   };

   const createListing = async () => {
      const listing = {
         assetContractAddress: collectionAddress,
         tokenId: tokenId,
         startTimestamp: new Date(),
         listingDurationInSeconds: duration * 86400,
         quantity: 1,
         currencyContractAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
         buyoutPricePerToken: price,
      };

      try {
         await market.direct.createListing(listing);
         successToast('Successfully Listed New NFT');
      } catch (err) {
         console.error(err);
         errorToast('Problem Creating New Listing');
         close();
      }
   };

   return (
      <ModalTemplate size="30vw">
         {{
            header: <h1 className={style.title}>Create New Listing</h1>,
            body: (
               <div className={style.infoContainer}>
                  <div className={style.inputWrapper}>
                     <input type="text" className={style.input} placeholder="Price per ETH" onChange={(e) => updatePrice(e.target.value)} />
                     <span className={style.inputDescription}>The price you are selling the NFT</span>
                  </div>
                  <div className={style.inputWrapper}>
                     <input type="text" className={style.input} placeholder="Duration" onChange={(e) => updateDuration(parseFloat(e.target.value))} />
                     <span className={style.inputDescription}>The number of days that the NFT will be listed</span>
                  </div>
               </div>
            ),
            footer: (
               <div className={style.buttons}>
                  <button className={style.accentedButton} onClick={() => (loading ? null : handleSubmit())}>
                     {loading && (
                        <div className={style.loadingSpinner}>
                           <AiOutlineLoading3Quarters />
                        </div>
                     )}
                     Create New Listing
                  </button>
                  <button className={style.button} onClick={() => close(false)}>
                     Cancel
                  </button>
               </div>
            ),
         }}
      </ModalTemplate>
   );
};

const style = {
   title: 'mb-5 text-white font text-3xl text-center',
   preview: 'pb-5 w-full flex gap-10',
   image: 'w-2/5 aspect-[1/1]',
   infoContainer: 'my-10 w-full text-[#CCCCCC] flex flex-col items-start gap-10',
   inputWrapper: 'w-full flex flex-col justify-start',
   input: 'p-2 w-full text-[#CCCCCC] bg-[#ffffff10] rounded-lg outline outline-white outline-0 hover:outline-1 focus:outline-1',
   inputDescription: 'mt-1 ml-1 text-sm text-[#999999]',
   buttons: 'mt-5 flex justify-center items-center gap-20',
   loadingSpinner: 'ml-[-0.5em] mr-1 text-white font text-2xl animate-spin',
   accentedButton: 'px-7 py-3 text-md font-semibold text-[#FFFFFF] bg-[#2181e2] rounded-lg flex items-center gap-2 hover:bg-[#42a0ff] cursor-pointer',
   button: 'px-7 py-3 text-md font-semibold bg-[#363840] border rounded-lg mr-5 text-[#e4e8ea] hover:bg-[#4c505c] cursor-pointer',
};

export default NewListingModal;
