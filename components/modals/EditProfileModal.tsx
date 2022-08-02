import Router, { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import { errorToast } from '../../utils/toasts';
import { updateUser, User } from '../../utils/users';
import ModalTemplate from './ModalTemplate';
import ImageUploader from '../app/ImageUploader';

interface Props {
   user: User;
   close: () => void;
}

const EditProfileModal: React.FC<Props> = ({ user, close }) => {
   const router = useRouter();
   const address = useAddress();

   const [name, updateName] = useState<string>(user.name || '');
   console.log(name);
   const [profileImage, updateProfileImage] = useState<string>(user.imageUrl || '');

   useEffect(() => {
      if (router.query.WalletAddress) return;

      if (router.query.WalletAddress !== address) Router.push({ pathname: '/profiles/' + router.query.WalletAddress });
   }, [router.query.WalletAddress]);

   const handleSubmit = async () => {
      if (!name) return errorToast('User must have a name');

      await updateUser(user.id, user.address, name, profileImage);
      Router.push({ pathname: '/profiles/' + router.query.WalletAddress });
      close();
   };

   return (
      <>
         <ModalTemplate>
            {{
               header: <h1 className={style.title}>Update your profile</h1>,
               body: (
                  <div className={style.inputsWrapper}>
                     <div className={style.inputWrapper}>
                        <ImageUploader
                           styles="w-full rounded-full text-[75%]"
                           name="Profile Image"
                           placeholderUrl={user.imageUrl || 'https://via.placeholder.com/400'}
                           size={{ width: 400, height: 400 }}
                           updatedImage={(e) => updateProfileImage(e as string)}
                        />
                     </div>
                     <div className={style.inputWrapper}>
                        <input type="text" value={name} className={style.input} onChange={(e) => updateName(e.target.value)} />
                     </div>
                  </div>
               ),
               footer: (
                  <div className={style.buttons}>
                     <button className={style.accentedButton} onClick={() => handleSubmit()}>
                        Submit
                     </button>
                     <button
                        className={style.button}
                        onClick={() => {
                           Router.push({ pathname: '/profiles/' + router.query.WalletAddress });
                           close();
                        }}
                     >
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
   modalBody: 'mx-auto max-w-[60%] max-h-[60vh] overflow-scroll',
   inputsWrapper: 'mx-auto w-1/4',
   inputWrapper: 'my-5 w-full flex flex-col justify-center items-center',
   input: 'my-2 text-center text-2xl text-[#FFFFFF] bg-transparent border-none cursor-pointer hover:bg-[#00000050] focus:outline-none placeholder:text-[#FFFFFF]',
   buttons: 'mt-5 flex justify-center items-center gap-20',
   accentedButton: 'px-7 py-3 text-md font-semibold text-[#FFFFFF] bg-[#2181e2] rounded-lg flex items-center gap-2 hover:bg-[#42a0ff] cursor-pointer',
   button: 'px-7 py-3 text-md font-semibold bg-[#363840] border rounded-lg mr-5 text-[#e4e8ea] hover:bg-[#4c505c] cursor-pointer',
};

export default EditProfileModal;
