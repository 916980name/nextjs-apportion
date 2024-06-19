import { useState } from "react";
import Locale from "../app/locales";
import { Button } from "./ui/button";

export default function ClipboardCopy({ copyText, className }: 
    {copyText: string, className?: string}) {
    const [isCopied, setIsCopied] = useState(false);

    // This is the function we wrote earlier
    async function copyTextToClipboard(text: string) {
        if ('clipboard' in navigator) {
            return await navigator.clipboard.writeText(text);
        } else {
            return document.execCommand('copy', true, text);
        }
    }

    // onClick handler function for the copy button
    const handleCopyClick = () => {
        // Asynchronously call copyTextToClipboard
        copyTextToClipboard(copyText)
            .then(() => {
                // If successful, update the isCopied state value
                setIsCopied(true);
                setTimeout(() => {
                    setIsCopied(false);
                }, 1500);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <Button variant="outline" onClick={handleCopyClick} size={'sm'} className={className}>
            {isCopied ? Locale.Activity.CopiedShare : Locale.Activity.Share}
        </Button>
    );
}

//https://juejin.cn/post/7067112117974859790