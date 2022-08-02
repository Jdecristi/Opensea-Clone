import toast from 'react-hot-toast';

export const successToast = (message: string) => {
   toast.success(`${message}`, {
      style: { background: '#04111d', color: '#ffffff', maxWidth: '50rem' },
   });
};

export const errorToast = (message: string) => {
   toast.error(`${message}`, {
      style: {
         background: '#04111d',
         color: '#ffffff',
         maxWidth: '50rem',
      },
   });
};
