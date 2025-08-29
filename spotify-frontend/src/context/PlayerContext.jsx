import React, { createContext, useEffect, useRef, useState } from 'react'
import axios from 'axios';

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const url = 'https://spotify-app-back.onrender.com';

    const [songsData, setSongsData] = useState([]);
    const [albumsData, setAlbumsData] = useState([]);
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
    });

    const play = () => {
        audioRef.current.play();
        setPlayStatus(true);
    };

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false);
    };

    const playWithId = (id) => {
        const song = songsData.find((item) => item._id === id);
        if (song) {
            setTrack(song);
        }
    };

    const previous = () => {
        const index = songsData.findIndex((item) => item._id === track?._id);
        if (index > 0) {
            setTrack(songsData[index - 1]);
        }
    };

    const next = () => {
        const index = songsData.findIndex((item) => item._id === track?._id);
        if (index >= 0 && index < songsData.length - 1) {
            setTrack(songsData[index + 1]);
        }
    };

    const seekSong = (e) => {
        audioRef.current.currentTime =
            (e.nativeEvent.offsetX / seekBg.current.offsetWidth) *
            audioRef.current.duration;
    };

    const getSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);
            setSongsData(response.data.songs);
            setTrack(response.data.songs[0]);
        } catch (error) {
            console.log(error);
        }
    };

    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            setAlbumsData(response.data.albums);
        } catch (error) {
            console.log(error);
        }
    };

    // ⏱ Update time & seek bar
    useEffect(() => {
        if (!audioRef.current) return;

        audioRef.current.ontimeupdate = () => {
            seekBar.current.style.width =
                Math.floor((audioRef.current.currentTime / audioRef.current.duration) * 100) + "%";

            setTime({
                currentTime: {
                    second: Math.floor(audioRef.current.currentTime % 60),
                    minute: Math.floor(audioRef.current.currentTime / 60)
                },
                totalTime: {
                    second: Math.floor(audioRef.current.duration % 60),
                    minute: Math.floor(audioRef.current.duration / 60)
                }
            });
        };
    }, []);

    // 🎵 Fetch data once on mount
    useEffect(() => {
        getSongsData();
        getAlbumsData();
    }, []);

    // 🎶 Play when track changes (prevents AbortError)
    useEffect(() => {
        if (track && audioRef.current) {
            audioRef.current.onloadeddata = async () => {
                try {
                    await audioRef.current.play();
                    setPlayStatus(true);
                } catch (err) {
                    console.error("Play failed:", err);
                }
            };
        }
    }, [track]);

    const contextValue = {
        audioRef,
        seekBg,
        seekBar,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId,
        next, previous,
        seekSong,
        songsData,
        albumsData
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
