const getCookie = (req, name) => {
    const cookies = req.get('cookie') || '';
    const cookie = cookies
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
};

module.exports = {
    getCookie
};
