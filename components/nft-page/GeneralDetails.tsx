import Link from 'next/link';
import { useState, useEffect } from 'react';
import { NFTMetadataOwner } from '@thirdweb-dev/sdk/dist/browser';
import { getCollection, Collection } from '../../utils/collections';
import { getUser, User } from '../../utils/users';

interface Props {
   collectionAddress: string;
   selectedNft: NFTMetadataOwner;
}

const GeneralDetails: React.FC<Props> = ({ selectedNft, collectionAddress }) => {
   const [collection, updateCollection] = useState<Collection>();
   const [owner, updateOwner] = useState<User>();

   useEffect(() => {
      if (!selectedNft || !collectionAddress) return;

      (async () => {
         const promises = await Promise.all([getCollection(collectionAddress), getUser(selectedNft.owner)]);
         updateCollection(promises[0] as Collection);
         updateOwner(promises[1] as User);
      })();
   }, [selectedNft, collectionAddress]);

   if (!collection || !owner)
      return (
         <div className={style.wrapper}>
            <div className={style.infoContainer}>
               <div className={style.loading + ' w-40'} />
               <div className={style.loading + ' w-32 text-3xl'} />
               <div className={style.loading + ' w-1/3 text-xl'} />
               <div className={style.loading + ' w-1/3'} />
            </div>
         </div>
      );

   return (
      <div className={style.wrapper}>
         <div className={style.infoContainer}>
            <Link href={`/explore/collections/${collectionAddress}`}>
               <span className={style.accent}>{collection.title}</span>
            </Link>
            <div className={style.nftTitle}>{selectedNft.metadata.name}</div>
            <div className={style.nftDescription}>{selectedNft.metadata.description}</div>
            <div className={style.ownedBy}>
               Owned by <span className={style.accent}>{owner.name || selectedNft.owner}</span>
            </div>
         </div>
      </div>
   );
};

const style = {
   wrapper: 'flex',
   infoContainer: 'h-36 flex flex-col flex-1 justify-between mb-6',
   loading: 'h-[1em] bg-[#ffffff10] rounded-lg animate-pulse',
   accent: 'text-[#2081e2] cursor-pointer',
   nftTitle: 'text-3xl font-extrabold',
   nftDescription: 'text-xl font-normal',
   otherInfo: 'flex',
   ownedBy: 'text-[#8a939b] mr-4',
   likes: 'flex items-center text-[#8a939b]',
   likeIcon: 'mr-1',
   actionButtonsContainer: 'w-44',
   actionButtons: 'flex container justify-between text-[1.4rem] border-2 rounded-lg',
   actionButton: 'my-2',
   divider: 'border-r-2',
};

export default GeneralDetails;
