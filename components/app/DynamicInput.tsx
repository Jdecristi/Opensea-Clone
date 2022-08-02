import { useRef } from 'react';

interface Props {
   initialValue: string;
   change: (value: string) => void;
}

const DynamicInput: React.FC<Props> = ({ initialValue, change }) => {
   const value = useRef<string>(initialValue);

   return (
      <span className={style} role="textbox" contentEditable="true" suppressContentEditableWarning={true} onInput={(e) => change((e.target as HTMLElement).innerText)}>
         {value.current}
      </span>
   );
};

const style =
   'px-1 min-w-[1em] text-[1em] text-[#FFFFFF] text-center font-normal font-[sans-serif roboto] bg-transparent border-none rounded-sm cursor-pointer hover:bg-[#00000050] focus:outline-none placeholder:text-[#FFFFFF]';

export default DynamicInput;
