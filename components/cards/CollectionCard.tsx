import Router from 'next/router';

interface Props {
   collectionAddress: string;
   title: string;
   bannerImageUrl: string;
   imageUrl: string;
}

const CollectionCard: React.FC<Props> = ({ collectionAddress, title, bannerImageUrl, imageUrl }) => (
   <div className={style.wrapper} onClick={() => Router.push({ pathname: `/explore/collections/${collectionAddress}` })}>
      <div className={style.bannerContainer}>
         <img src={bannerImageUrl || 'https://via.placeholder.com/2500x1000'} alt={title} className={style.bannerImage} />
      </div>
      <div className={style.details}>
         <div className={style.info}>
            <img src={imageUrl || 'https://via.placeholder.com/200'} alt={title} className={style.logoImage} />
            <div className={style.assetName}>{title}</div>
         </div>
      </div>
   </div>
);

const style = {
   wrapper: 'bg-[#303339] flex-auto my-10 mx-5 rounded-2xl overflow-hidden cursor-pointer ease-in-out duration-100 hover:scale-105',
   bannerContainer: 'max-h-3/4 w-full aspect-[3/1] roundedt-2xl overflow-hidden flex justify-center items-center relative',
   bannerImage: 'w-full object-cover',
   logoContainer: 'p-1 w-20 absolute bottom-2 left-5 bg-[#363840] rounded-lg',
   logoImage: 'w-16 rounded-full object-cover',
   details: 'p-3',
   info: 'flex justify-start items-center gap-4',
   assetName: 'font-bold text-2xl text-[#cccccc]',
};

export default CollectionCard;
