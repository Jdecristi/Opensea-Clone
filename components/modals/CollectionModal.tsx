import { useState } from 'react';
import { useSDK } from '@thirdweb-dev/react';
import { successToast, errorToast } from '../../utils/toasts';
import { createCollection, updateCollection, Collection } from '../../utils/collections';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import ModalTemplate from './ModalTemplate';
import ImageUploader from '../app/ImageUploader';
import DynamicInput from '../app/DynamicInput';

interface Props {
   isNewCollection: boolean;
   name: string;
   ownerAddress: string;
   collection?: Collection;
   close: () => void;
}

const EditProfileModal: React.FC<Props> = ({ isNewCollection, name, ownerAddress, collection, close }) => {
   const SDK = useSDK();

   const [title, updateTitle] = useState<string>(collection?.title || 'Collection Title');
   const [description, updateDescription] = useState<string>(collection?.description || 'The Collection description explains what your collection is all about');
   const [floorPrice, updateFloorPrice] = useState<string>(collection?.floorPrice || '0');
   const [bannerImage, updateBannerImage] = useState<string>(collection?.bannerImage || '');
   const [logoImage, updateLogoImage] = useState<string>(collection?.logoImage || '');
   const [loading, updateLoading] = useState<boolean>(false);

   const handleSubmit = async () => {
      updateLoading(true);

      if (isNewCollection) {
         if (!bannerImage) return errorToast('Collection must have a title Banner Image');
         if (!logoImage) return errorToast('Collection must have a title Logo Image');
         if (!title) return errorToast('Collection must have a title');

         const collectionAddress = await deployNFTCollection();
         await createNewCollection(collectionAddress!);
      } else {
         await updateCurrentCollection();
      }

      close();
      updateLoading(false);
   };

   const deployNFTCollection = async () => {
      try {
         return await SDK?.deployer.deployNFTCollection({ name: title, primary_sale_recipient: ownerAddress });
      } catch (err) {
         console.error(err);
         errorToast('There was a problem your collection to the blockchain');
      }
   };

   const createNewCollection = async (address: string) => {
      try {
         await createCollection(title, address, description, floorPrice, ownerAddress, bannerImage, logoImage);
         successToast('Successfully made your new collection!');
      } catch (err) {
         console.error(err);
         errorToast('There was a problem making your collection');
      }
   };

   const updateCurrentCollection = async () => {
      try {
         await updateCollection(
            collection?.id!,
            collection?.collectionAddress!,
            description,
            collection?.items as number,
            floorPrice,
            ownerAddress,
            bannerImage !== collection?.bannerImage ? bannerImage : '',
            logoImage !== collection?.logoImage ? logoImage : ''
         );
         successToast('Successfully updated your collection!');
      } catch (err) {
         console.error(err);
         errorToast('There was a problem updating your collection');
      }
   };

   return (
      <>
         <ModalTemplate size="60vw">
            {{
               header: <h1 className={style.title}>{isNewCollection ? 'Create a Collection' : 'Edit Collection'}</h1>,
               body: (
                  <div className={style.preview}>
                     <div className={style.imageContainer}>
                        <ImageUploader
                           styles="w-full"
                           name={'Banner Image'}
                           initialValue={bannerImage || ''}
                           placeholderUrl={'https://via.placeholder.com/3000x1000'}
                           size={{ width: 3000, height: 1000 }}
                           updatedImage={(e) => updateBannerImage(e as string)}
                        />
                        <div className={style.logoImageContainer}>
                           <ImageUploader
                              styles="rounded-full text-[75%]"
                              name={'Logo Image'}
                              size={{ width: 500, height: 500 }}
                              initialValue={logoImage || ''}
                              placeholderUrl={'https://via.placeholder.com/200'}
                              updatedImage={(e) => updateLogoImage(e as string)}
                           />
                        </div>
                     </div>
                     <div className={style.infoContainer}>
                        <div className={style.collectionTitleWrapper}>
                           {isNewCollection ? (
                              <>
                                 <DynamicInput initialValue={title} change={(e) => updateTitle(e)} />
                                 <span className={style.warning}>{'WARNING! The title field cannot be changed'}</span>
                              </>
                           ) : (
                              <span className={style.collectionTitle}>{title}</span>
                           )}
                        </div>
                        <div className="my-2 ml-5 text-xl">
                           <DynamicInput initialValue={description} change={(e) => updateDescription(e)} />
                        </div>
                        <span className={style.collectionCreator}>By: {name}</span>
                        <div className={style.infoItems}>
                           <div className={style.infoItem}>
                              <span className={style.itemValue}>{collection?.items}</span>
                              <span className={style.itemLabel}>Items</span>
                           </div>
                           <div className={style.infoItem}>
                              <span className={style.itemValue}>
                                 <img src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg" alt="eth" className={style.ethLogo} />
                                 <div className="text-2xl">
                                    <DynamicInput initialValue={floorPrice} change={(e) => updateFloorPrice(e)} />
                                 </div>
                              </span>
                              <span className={style.itemLabel}>Floor Price</span>
                           </div>
                           <div className={style.infoItem}>
                              <span className={style.itemValue}>
                                 <img src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg" alt="eth" className={style.ethLogo} />
                                 <div className="text-2xl">{collection?.volumeTraded}</div>
                              </span>
                              <span className={style.itemLabel}>Total Volume</span>
                           </div>
                        </div>
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
                        Submit
                     </button>
                     <button className={style.button} onClick={() => close()}>
                        Cancel
                     </button>
                  </div>
               ),
            }}
         </ModalTemplate>
      </>
   );
};

const style = {
   title: 'mb-5 text-white font text-3xl text-center',
   subTitle: 'text-white font text-2xl text-left',
   preview: 'my-5 pb-5 w-full bg-[#222222] relative',
   imageContainer: 'w-full relative',
   logoImageContainer: 'p-2 w-32 absolute bottom-2 left-5 bg-[#222222] rounded-lg',
   collectionTitleWrapper: 'my-2 my-2 px-5 w-full text-3xl flex justify-between items-center',
   collectionTitle: 'text-white font text-2xl text-center',
   warning: 'font text-lg text-[#ff3636] text-center ',
   collectionCreator: 'my-2 ml-5 pl-2 text-[#FFFFFF]',
   infoContainer: 'flex flex-col items-start',
   infoItems: 'mt-5 px-5 flex justify-start items-center gap-5',
   infoItem: 'flex flex-col items-center',
   ethLogo: 'h-6 mr-2',
   itemValue: 'max-w-[5rem] text-2xl text-[#FFFFFF] text-center bg-transparent border-none flex justify-center items-center focus:outline-none placeholder:text-[#FFFFFF]',
   itemLabel: 'text-sm text-[#999999] text-center',
   buttons: 'mt-5 flex justify-center items-center gap-20',
   loadingSpinner: 'ml-[-0.5em] mr-1 text-white font text-2xl animate-spin',
   accentedButton: 'px-7 py-3 text-md font-semibold text-[#FFFFFF] bg-[#2181e2] rounded-lg flex items-center gap-2 hover:bg-[#42a0ff] cursor-pointer',
   button: 'px-7 py-3 text-md font-semibold bg-[#363840] border rounded-lg mr-5 text-[#e4e8ea] hover:bg-[#4c505c] cursor-pointer',
};

export default EditProfileModal;
