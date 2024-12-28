import React, { useState, useEffect, useRef } from 'react';

const VideoPlayer = ({ url }) => {
    const [videoType, setVideoType] = useState(null);
    const [error, setError] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        const determineVideoType = () => {
            if (!url) {
                setError(true);
                return;
            }

            setError(false);

            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                setVideoType('youtube');
            } else if (url.includes('rutube.ru')) {
                setVideoType('rutube');
            } else if (url.includes('vkvideo.ru')) {
                setVideoType('vkvideo');
            } else if (url.includes('ok.ru/video')) {
                setVideoType('ok');
            } else if (url.includes('yandex.ru/video')) {
                setVideoType('yandex');
            } else if (/\.(mp4|webm|ogg)$/i.test(url)) {
                setVideoType('file');
            } else {
                setError(true);
            }
        };

        determineVideoType();
    }, [url]);

    const renderPlayer = () => {
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full bg-neutral-200 dark:bg-neutral-700">
                    <i className="fas fa-exclamation-triangle text-4xl text-red-600"></i>
                    <p className="text-neutral-600 dark:text-neutral-300 mt-2">
                        Указанный URL не поддерживается или недействителен.
                    </p>
                </div>
            );
        }

        switch (videoType) {
            case 'file': {
                return (
                    <div className="relative bg-black">
                        <video
                            ref={videoRef}
                            className="w-full h-full"
                            controls
                            src={url}
                            onError={() => setError(true)}
                        >
                            Ваш браузер не поддерживает воспроизведение этого формата.
                        </video>
                    </div>
                );
            }
            case 'youtube': {
                const videoId = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
                return videoId ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : null;
            }
            case 'rutube': {
                const videoId = url.split('/video/')[1]?.split('?')[0];
                return videoId ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://rutube.ru/play/embed/${videoId}`}
                        title="RuTube Video"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : null;
            }
            case 'vkvideo': {
                const videoMatch = url.match(/video([-0-9]+)_(\d+)/);
                if (!videoMatch) {
                    return null;
                }

                const [_, oid, id] = videoMatch;
                return (
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://vk.com/video_ext.php?oid=${oid}&id=${id}&hd=1&autoplay=1`}
                        title="VK Video"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                        allowFullScreen
                    ></iframe>
                );
            }

            case 'ok': {
                const videoId = url.split('/video/')[1];
                return videoId ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://ok.ru/videoembed/${videoId}`}
                        title="OK Video"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : null;
            }
            case 'yandex': {
                return (
                    <iframe
                        width="100%"
                        height="100%"
                        src={url}
                        title="Yandex Video"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                );
            }

            default:
                return null;
        }
    };

    return <div className="w-full h-full bg-black">{renderPlayer()}</div>;
};

export default VideoPlayer;
