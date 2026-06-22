import { useRef, useState } from 'react';

import { readImageFile } from '../utils/image.js';

// The hidden-file-input pattern shared by the register and account pages: a
// preview value, a ref to open the native picker, and validated reads. The
// pages keep their own markup; only the behaviour lives here.
export const useImagePicker = (initialValue = null) => {
    const [imageData, setImageData] = useState(initialValue);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const open = () => inputRef.current?.click();

    const onChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            setImageData(await readImageFile(file));
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const remove = () => {
        setImageData(null);
        setError('');
        if (inputRef.current) inputRef.current.value = '';
    };

    return { imageData, setImageData, error, inputRef, open, onChange, remove };
};
