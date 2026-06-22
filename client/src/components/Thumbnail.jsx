import { useState } from 'react';

// Shows an image, falling back to the first initial of `name` when there is no
// image or it fails to load. The caller styles the wrapper; the image is matched
// by the wrapper's descendant CSS, and the fallback takes `fallbackClassName`.
const Thumbnail = ({ src, name, fallbackClassName, lazy = false }) => {
    const [failed, setFailed] = useState(false);

    if (src && !failed) {
        return (
            <img
                src={src}
                alt=""
                loading={lazy ? 'lazy' : undefined}
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <span className={fallbackClassName} aria-hidden="true">
            {name?.slice(0, 1).toUpperCase()}
        </span>
    );
};

export default Thumbnail;
