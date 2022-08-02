import { collection, onSnapshot, query, where, doc, addDoc, updateDoc } from '@firebase/firestore';
import { ref, getDownloadURL, uploadString } from '@firebase/storage';
import { DB, Storage } from '../libs/firebase';
import { getUsers } from './users';
import { DocumentData } from '@firebase/firestore-types';

export interface Collection {
   id: string;
   title: string;
   bannerImage: string;
   logoImage: string;
   collectionAddress: string;
   ownerAddress: string;
   ownerName: string;
   description: string;
   items: number;
   floorPrice: string;
   volumeTraded: string;
}

export interface CollectionData {
   id: string;
   title: string;
   collectionAddress: string;
   ownerAddress: string;
   description: string;
   items: number;
   floorPrice: string;
   volumeTraded: string;
   imagesPath: string;
}

export interface CollectionStorage {
   logoImage: string;
   bannerImage: string;
   collectionAddress: string;
}

interface Owner {
   address: string;
   name: string;
}

//Get a Single Collection
export const getCollection: (collectionAddress: string) => Collection | {} = async (collectionAddress) => {
   const getCollectionInfo: (snapshot: any) => Promise<Collection> = async (snapshot) => {
      const doc = snapshot.docs[0];
      if (!doc) return {};

      const collectionData = { id: doc.id, ...doc.data() };

      //Query collection owner
      const getOwnerQuery = query(collection(DB, 'Users'), where('address', '==', doc.data().ownerAddress));
      const owner = await new Promise((resolve) =>
         onSnapshot(getOwnerQuery, (snapshot) => {
            return resolve(snapshot.docs[0].data().name || '');
         })
      );

      //Query collection storage
      const bannerImage = collectionData.imagesPath ? await getDownloadURL(ref(Storage, `${collectionData.imagesPath}/banner_image`)) : '';
      const logoImage = collectionData.imagesPath ? await getDownloadURL(ref(Storage, `${collectionData.imagesPath}/logo_image`)) : '';

      //Retrun result as Collection
      return { ...collectionData, ownerName: owner, bannerImage, logoImage };
   };

   //Query collection
   const collectionQuery = query(collection(DB, 'Collections'), where('collectionAddress', '==', collectionAddress));
   return await new Promise((resolve, reject) => {
      onSnapshot(
         collectionQuery,
         async (snapshot) => await resolve(getCollectionInfo(snapshot)),
         async () => reject('Err fetching collection')
      );
   });
};

//Get all Collections for a single user or all users
export const getCollections: (userAddress?: string) => Promise<Collection[] | []> = async (userAddress) => {
   const getCollectionInfo: (snapshot: any) => Promise<Collection[]> = async (snapshot) => {
      let collectionsData: CollectionData[] = [];
      let collectionsInfo: Promise<Collection | null>[] | Collection[] = [];
      snapshot.docs.forEach((doc: DocumentData) => {
         collectionsData.push({ id: doc.id, ...doc.data() });
      });

      //Filter by selected Owner
      if (userAddress) collectionsData = collectionsData.filter((collection) => collection.ownerAddress == userAddress);

      collectionsInfo = collectionsData.map(async (collectionData: CollectionData) => {
         //Match owners to each collection
         const owners = await getUsers();
         const owner = owners.find((o) => o.address == collectionData.ownerAddress) as Owner;
         if (!owner) return null;

         //Get storage for each collection
         const bannerImage = collectionData.imagesPath ? await getDownloadURL(ref(Storage, `${collectionData.imagesPath}/banner_image`)) : '';
         const logoImage = collectionData.imagesPath ? await getDownloadURL(ref(Storage, `${collectionData.imagesPath}/logo_image`)) : '';

         return { ...collectionData, ownerName: owner.name, logoImage, bannerImage } as Collection;
      });
      //Remove all null values
      const filteredCollections = Promise.all(collectionsInfo).then((res) => {
         return res.filter((col) => col !== null) as Collection[];
      });
      return filteredCollections;
   };

   //Collections query
   return await new Promise((resolve, reject) => {
      onSnapshot(
         collection(DB, 'Collections'),
         async (snapshot) => await resolve(getCollectionInfo(snapshot)),
         async () => reject('Err fetching collection')
      );
   });
};

//Create a collection
export const createCollection = async (
   title: string,
   collectionAddress: string,
   description: string,
   floorPrice: string,
   ownerAddress: string,
   bannerImage: string,
   logoImage: string
) => {
   const bannerImageRef = ref(Storage, `Collections/${collectionAddress}/banner_image`);
   await uploadString(bannerImageRef, bannerImage, 'data_url');

   const imageRef = ref(Storage, `Collections/${collectionAddress}/logo_image`);
   await uploadString(imageRef, logoImage, 'data_url');

   addDoc(collection(DB, 'Collections'), {
      title,
      collectionAddress: collectionAddress,
      description,
      floorPrice,
      ownerAddress,
      items: 0,
      volumeTraded: '0',
      imagesPath: `Collections/${collectionAddress}`,
   });
};

//update a collection
export const updateCollection = async (
   collectionId: string,
   collectionAddress: string,
   description: string,
   items: number,
   floorPrice: string,
   ownerAddress: string,
   bannerImage?: string,
   logoImage?: string
) => {
   if (bannerImage) {
      const bannerImageRef = ref(Storage, `Collections/${collectionAddress}/banner_image`);

      try {
         await uploadString(bannerImageRef, bannerImage, 'data_url');
      } catch (err) {
         console.error(err);
      }
   }
   if (logoImage) {
      const imageRef = ref(Storage, `Collections/${collectionAddress}/logo_image`);

      try {
         await uploadString(imageRef, logoImage, 'data_url');
      } catch (err) {
         console.error(err);
      }
   }

   updateDoc(doc(DB, 'Collections', collectionId), { description, floorPrice, ownerAddress, items });
};
