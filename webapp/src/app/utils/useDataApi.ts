import { useState, useEffect } from 'react';

const useDataApi = (initialUrl, initialData) => {
    const [data, setData] = useState(initialData);
    const [url, setUrl] = useState(initialUrl);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const makeAPICall = async () => {
            const ls = localStorage.getItem(url);
            if (ls) {
                setData(JSON.parse(ls));
            } else {
                setIsLoading(true);
                try {
                    const res = await fetch(url);
                    const json = await res.json();
                    console.log('DEBUG useDataApi - useEffect - json', json);
                    setData([json]);
                    localStorage.setItem(url, JSON.stringify([json]));
                } catch (err) {
                    console.error('ERROR useDataApi - useEffect - err', err)
                }
            }
            setIsLoading(false);
        };
        makeAPICall();
    }, [url]);

    return [{ data, isLoading }, setUrl];
};

export default useDataApi;
