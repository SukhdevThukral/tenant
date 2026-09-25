let _audio: HTMLAudioElement | null = null;

export function getAudio(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (!_audio) {
        _audio = new Audio("/ambient_music.mp3");
        _audio.loop = true;
        _audio.volume = 0;
    }
    return _audio;
}