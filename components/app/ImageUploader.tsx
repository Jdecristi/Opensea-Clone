import { useState, useRef, useEffect } from 'react';

interface Props {
   styles?: string;
   name: string;
   initialValue?: string;
   placeholderUrl: string;
   size: { width: number; height: number };
   type?: 'File' | 'Blob' | 'DataURL';
   updatedImage: (updatedImageUrl: string | Blob | File) => void;
}

const ImageUploader: React.FC<Props> = ({ styles = '', name, initialValue = '', placeholderUrl, size, type = 'DataURL', updatedImage }) => {
   const [imageUrl, updateImageUrl] = useState<string>(initialValue || placeholderUrl);
   const [imageUploaded, updateImageUploaded] = useState<boolean>(initialValue ? true : false);
   const [inputText, updateInputText] = useState<string>((initialValue ? 'Remove ' : 'Upload ') + name);

   const loading = useRef<boolean>(false);
   const inputRef = useRef<HTMLInputElement>(null);
   const imgRef = useRef<HTMLImageElement>(null);

   useEffect(() => {
      if (!loading.current) {
         loading.current = true;
         const input = inputRef.current as HTMLInputElement;
         input.addEventListener('change', (e) => handleImage(e.target as HTMLInputElement));

         return () => input.removeEventListener('change', (e) => handleImage(e.target as HTMLInputElement));
      }
   }, [inputRef]);

   const handleImage = (input: HTMLInputElement) => {
      const file = input.files![0];

      if (file) {
         const reader = new FileReader();
         reader.onload = () => {
            const image = reader.result as string;
            const imageElement = document.createElement('img');

            imageElement.src = image;
            imageElement.onload = () => compressImage(imageElement);
         };
         reader.readAsDataURL(file);
      } else {
         updateImage(placeholderUrl, false);
      }
   };

   const compressImage = (src: CanvasImageSource) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      //Find src image aspect ratio compared to desired image aspect ratio
      const currentSize = { width: src.width as number, height: src.height as number };
      const currentRatio = currentSize.width / currentSize.height;
      const sizeRatio = size.width / size.height;

      const relativeAspectRatio = currentRatio === sizeRatio ? 'isCorrent' : currentRatio > sizeRatio ? 'isWide' : 'isTall';

      //Compress Image
      if (relativeAspectRatio === 'isWide') {
         const scale = size.height / currentSize.height;

         canvas.width = scale * currentSize.width;
         canvas.height = size.height;
      } else {
         const scale = size.width / currentSize.width;

         canvas.width = size.width;
         canvas.height = scale * currentSize.height;
      }

      ctx?.drawImage(src, 0, 0, canvas.width, canvas.height);

      const compressedImgSrc = ctx?.canvas.toDataURL('image/jpeg') as string;

      //Crop Image if nessesary
      if (relativeAspectRatio !== 'isCorrent') return cropImage(compressedImgSrc, relativeAspectRatio, canvas.width, canvas.height);

      updateImage(compressedImgSrc, true);
   };

   const cropImage = (compressedImageSource: string, aspectRatio: string, width: number, height: number) => {
      const compressedImage = document.createElement('img');
      compressedImage.src = compressedImageSource;

      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext('2d');

      if (aspectRatio === 'isWide') {
         const cropX = (width - size.width) / 2;

         ctx?.drawImage(compressedImage, cropX, 0, size.width, size.height, 0, 0, size.width, size.height);
      } else {
         const cropY = (height - size.height) / 2;

         ctx?.drawImage(compressedImage, 0, cropY, size.width, size.height, 0, 0, size.width, size.height);
      }

      //Allow time for croppedImgSRC to be populated
      setTimeout(() => {
         const croppedImgSrc = ctx?.canvas.toDataURL('image/jpeg') as string;

         updateImage(croppedImgSrc, true);
      }, 0);
   };

   const updateImage = (imageSource: string, hasImage: boolean) => {
      loading.current = false;
      updateImageUrl(imageSource);
      updateImageUploaded(imageUploaded);
      updateInputText((hasImage ? 'Remove ' : 'Upload ') + name);
      updateImageUploaded(hasImage);
      uploadImage(hasImage ? imageSource : '');
   };

   const uploadImage = async (imageSource: string) => {
      let imageAsType: string | Blob | File = '';

      if (imageSource != '') {
         switch (type) {
            case 'DataURL':
               imageAsType = imageSource;
               break;

            case 'Blob':
               imageAsType = await (await fetch(imageSource)).blob();
               break;

            case 'File':
               const blob = await (await fetch(imageSource)).blob();
               imageAsType = new File([blob], `${name}.jpeg`);
               break;
         }
      }

      updatedImage(imageAsType);
   };

   const handleClick = () => {
      if (!imageUploaded) {
         inputRef.current?.click();
      } else {
         updateImage(placeholderUrl, false);
      }
   };
   const style = {
      inputWrapper: `m-0 p-0 w-full relative ${styles}`,
      image: `m-0 p-0 relative w-full aspect-[${size.width}/${size.height}] ${styles}`,
      cover: `text-transparent flex justify-center items-center absolute top-0 right-0 bottom-0 left-0 cursor-pointer hover:text-[#ffffff] hover:bg-[#00000075] ${styles}`,
   };

   return (
      <div className={style.inputWrapper}>
         <img className={style.image} src={imageUrl} alt={name} ref={imgRef} />
         <div className={style.cover} onClick={handleClick}>
            {inputText}
         </div>
         <input type="file" accept="image/png image/jepg image/jpg" hidden={true} ref={inputRef} />
      </div>
   );
};

export default ImageUploader;
