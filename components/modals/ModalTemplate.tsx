import { useEffect } from 'react';

interface Props {
   children: {
      header?: React.ReactNode;
      body?: React.ReactNode;
      footer?: React.ReactNode;
   };
   size?: string;
}

const ModalTemplate: React.FC<Props> = ({ children, size }) => {
   useEffect(() => {
      document.body.style.position = 'fixed';

      return () => {
         document.body.style.position = '';
      };
   }, []);

   return (
      <div className={style.backdrop}>
         <div className={style.modal} style={{ width: size ? size : '50vw' }}>
            <div className={style.modalHheader}>{children.header}</div>
            <div className={style.modalBody}>{children.body}</div>
            <div className={style.modalFooter}>{children.footer}</div>
         </div>
      </div>
   );
};

const style = {
   backdrop: 'bg-[#00000099] fixed top-0 right-0 bottom-0 left-0 flex justify-center items-center z-50',
   modal: 'p-10 max-h-[80vh] bg-[#363840] rounded-xl absolute top-[50vh] left-[50vw] translate-x-[-50%] translate-y-[-50%] overflow-y-scroll',
   modalHheader: 'w-full',
   modalBody: 'w-full',
   modalFooter: 'w-full',
};

export default ModalTemplate;
