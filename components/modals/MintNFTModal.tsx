import { useState } from 'react';
import { useSDK, useMarketplace, useAddress } from '@thirdweb-dev/react';
import { successToast, errorToast } from '../../utils/toasts';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BsCheck } from 'react-icons/bs';
import ModalTemplate from './ModalTemplate';
import ImageUploader from '../app/ImageUploader';

interface Props {
   collectionAddress: string;
   close: (success?: boolean) => void;
}

const MintNFTModal: React.FC<Props> = ({ collectionAddress, close }) => {
   const SDK = useSDK();
   const address = useAddress();
   const market = useMarketplace(process.env.NEXT_PUBLIC_NFT_MARKETPLACE);
   const collection = SDK?.getNFTCollection(collectionAddress);

   const [image, updateProfileImage] = useState<string>();
   const [name, updateName] = useState<string>();
   const [description, updateDescription] = useState<string>();
   const [listOnMint, updateListOnMint] = useState<boolean>(false);
   const [price, updatePrice] = useState<string>('');
   const [duration, updateDuration] = useState<number>(0);
   const [loading, updateLoading] = useState<boolean>(false);

   const handleSubmit = async () => {
      if (!name) return errorToast('Collection must have a name');
      if (!description) return errorToast('Collection must have a description');
      if (!image) return errorToast('Collection must have a title image');

      updateLoading(true);

      try {
         let txn;
         txn = await collection?.mintTo(address!, { name: name, description: description, image: image });
         successToast('Successfully Minted NFT');

         if (listOnMint) await listToMarket(txn?.id);
      } catch (err) {
         console.error(err);
         errorToast('Problem Minting NFT');

         updateLoading(false);
         close();
      }

      updateLoading(false);
      close(true);
   };

   const listToMarket = async (tokenId: any) => {
      if (!market || !address) return errorToast('Problem Creating New Listing');
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

         updateLoading(false);
         close();
      }
   };

   return (
      <ModalTemplate>
         {{
            header: <h1 className={style.title}>Mint a New NFT</h1>,
            body: (
               <div className={style.preview}>
                  <div className={style.image}>
                     <ImageUploader
                        styles="rounded-lg"
                        name={'NFT Image'}
                        size={{ width: 1000, height: 1000 }}
                        placeholderUrl="https://via.placeholder.com/1000"
                        updatedImage={(e) => updateProfileImage(e as string)}
                     />
                  </div>
                  <div className={style.infoContainer}>
                     <div className={style.inputWrapper}>
                        <input type="text" className={style.input} placeholder="Name" onChange={(e) => updateName(e.target.value)} />
                        <span className={style.inputDescription}>The name of your NFT</span>
                     </div>
                     <div className={style.inputWrapper}>
                        <textarea className={style.textArea} placeholder="Description..." onChange={(e) => updateDescription(e.target.value)} />
                        <span className={style.inputDescription}>The description of your NFT</span>
                     </div>
                  </div>
                  <div className={style.lister}>
                     <span className="text-white cursor-pointer flex items-center" onClick={() => updateListOnMint(!listOnMint)}>
                        {listOnMint ? <BsCheck className={style.checkBox + ' bg-[#2181e2]'} /> : <i className={style.checkBox + ' bg-white'} />}
                        List to Marketplace when minted
                     </span>
                  </div>
                  {listOnMint && (
                     <div className={style.listerInputWrapper}>
                        <div className={style.inputWrapper}>
                           <input type="text" className={style.input} placeholder="Price per ETH" onChange={(e) => updatePrice(e.target.value)} />
                           <span className={style.inputDescription}>The price you are selling the NFT</span>
                        </div>
                        <div className={style.inputWrapper}>
                           <input type="text" className={style.input} placeholder="Duration (Days)" onChange={(e) => updateDuration(parseFloat(e.target.value))} />
                           <span className={style.inputDescription}>The number of days that the NFT will be listed</span>
                        </div>
                     </div>
                  )}
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
                     Mint
                  </button>
                  <button className={style.button} onClick={() => close()}>
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
   preview: 'pb-5 w-full grid grid-cols-5 gap-10',
   image: 'w-full col-span-2 aspect-[1/1]',
   infoContainer: 'w-full text-[#CCCCCC] col-span-3 flex flex-col items-start gap-10',
   inputWrapper: 'w-full flex flex-col justify-start',
   input: 'p-2 w-full text-[#CCCCCC] bg-[#ffffff10] rounded-lg outline outline-white outline-0 hover:outline-1 focus:outline-1',
   textArea: 'p-2 w-full h-[175px] bg-[#ffffff10] rounded-lg outline outline-white outline-0 hover:outline-1 focus:outline-1',
   inputDescription: 'mt-1 ml-1 text-sm text-[#999999]',
   lister: 'text-2xl col-span-5 flex justify-center',
   checkBox: 'py-0 mr-5 w-[1em] h-[1em] rounded-[5px] text-white inline-block',
   listerInputWrapper: 'col-span-5 flex justify-center items-center gap-10',
   buttons: 'mt-5 flex justify-center items-center gap-20',
   loadingSpinner: 'ml-[-0.5em] mr-1 text-white font text-2xl animate-spin',
   accentedButton: 'px-7 py-3 text-md font-semibold text-[#FFFFFF] bg-[#2181e2] rounded-lg flex items-center gap-2 hover:bg-[#42a0ff] cursor-pointer',
   button: 'px-7 py-3 text-md font-semibold bg-[#363840] border rounded-lg mr-5 text-[#e4e8ea] hover:bg-[#4c505c] cursor-pointer',
};

export default MintNFTModal;
