import Router from 'next/router';
import { NFTMetadataOwner, DirectListing } from '@thirdweb-dev/sdk/dist/browser';

interface Props {
   id: string;
   name: string;
   image: string;
   collectionAddress: string;
   isListed: boolean;
   price?: string;
}

const NFTCard: React.FC<Props> = ({ id, name, image, collectionAddress, isListed, price }) => {
   return (
      <div
         className={style.wrapper}
         onClick={() => {
            Router.push({
               pathname: `/explore/nfts/${id}`,
               query: { collection_address: collectionAddress },
            });
         }}
      >
         <div className={style.imgContainer}>
            <img src={image} alt={name} className={style.nftImg} />
         </div>
         <div className={style.info}>
            <div className={style.assetName}>{name}</div>
            {isListed && (
               <div className={style.price}>
                  <div className={style.priceTag}>Price</div>
                  <div className={style.priceValue}>
                     <img src="https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg" alt="eth" className={style.ethLogo} />
                     {price}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

const style = {
   wrapper: 'bg-[#303339] p-1 flex-auto w-[14rem] my-10 mx-auto rounded-2xl overflow-hidden cursor-pointer ease-in-out duration-200 hover:scale-105',
   imgContainer: 'w-full max-h-3/4 aspect-[1/1] overflow-hidden flex justify-center items-center',
   nftImg: 'w-full h-full object-cover rounded-xl overflow-hidden',
   info: 'p-3 h-16 w-full flex justify-between items-center',
   assetName: 'font-bold text-lg text-[#CCCCCC] mt-2',
   price: 'flex flex-col items-end',
   priceTag: 'font-semibold text-xs text-[#8a939b]',
   ethLogo: 'mr-2 h-5 text-xs',
   priceValue: 'text-[#CCCCCC] flex items-center text-xs font-bold',
};

export default NFTCard;
