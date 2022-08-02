import { collection, onSnapshot, query, where, doc, addDoc, updateDoc } from '@firebase/firestore';
import { ref, getDownloadURL, uploadString } from '@firebase/storage';
import { DB, Storage } from '../libs/firebase';
import { DocumentData } from '@firebase/firestore-types';

export interface User {
   id: string;
   address: string;
   name: string;
   imageUrl: string;
}

export const getUser = (userAddress: string): User | {} => {
   const getUsersInfo: (snapshot: any) => Promise<User> = async (snapshot) => {
      const doc = snapshot.docs[0];
      if (!doc) return {};

      const imageUrl = doc.data().imagePath ? await getDownloadURL(ref(Storage, doc.data().imagePath)) : '';

      return { id: doc.id, ...doc.data(), imageUrl };
   };

   const getMarketItemQuery = query(collection(DB, 'Users'), where('address', '==', userAddress));
   return new Promise((resolve, reject) => {
      onSnapshot(
         getMarketItemQuery,
         async (snapshot) => await resolve(getUsersInfo(snapshot)),
         async () => reject('Err fetching User')
      );
   });
};

export const getUsers: (userAddress?: string) => Promise<User[] | []> = async (userAddress) => {
   const getUsersInfo: (snapshot: any) => Promise<User[] | []> = async (snapshot) => {
      let userData = snapshot.docs.map(async (doc: DocumentData) => {
         const imageUrl = doc.data().imagePath ? await getDownloadURL(ref(Storage, doc.data().imagePath)) : '';

         return { id: doc.id, ...doc.data(), imageUrl };
      });

      //Retrun result as Users array
      return await Promise.all(userData);
   };

   //Query usersInfo
   const usersQuery = collection(DB, 'Users');

   return await new Promise((resolve, reject) => {
      onSnapshot(
         usersQuery,
         async (snapshot) => resolve(await getUsersInfo(snapshot)),
         async () => reject('Err fetching Users')
      );
   });
};

//Add a new User to
export const addUser = async (address: string) => {
   return await new Promise((resolve, reject) => {
      addDoc(collection(DB, 'Users'), { address: address, name: 'User', imagePath: '' })
         .then(() => resolve('success'))
         .catch(() => reject('Err adding User'));
   });
};

//Update a single User
export const updateUser = async (id: string, address: string, name: string, imageUrl: string) => {
   const storageRef = ref(Storage, `Users/${address}/profile_image`);
   await uploadString(storageRef, imageUrl, 'data_url');

   updateDoc(doc(DB, 'Users', id), { name: name, imagePath: `Users/${address}/profile_image` });
};
