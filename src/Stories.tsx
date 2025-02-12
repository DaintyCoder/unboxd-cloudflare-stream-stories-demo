import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Flex, Spinner, Text, Avatar, Progress, VStack, HStack, IconButton } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

// Types
interface User {
  name: string;
  avatar: string;
}

interface MediaItem {
  type: "image" | "video";
  url?: string;
  streamId?: string;
  thumbnail?: string;
  duration?: number;
}

interface Story {
  id: string;
  user: User;
  media: MediaItem[];
}

interface StoriesPlayerProps {
  stories: Story[];
  onClose?: () => void;
  accountId: string;
}

const MotionBox = motion(Box);

declare global {
  interface Window {
    Hls: any;
  }
}

const StoriesPlayer = ({ stories, onClose, accountId }: StoriesPlayerProps) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const longPressRef = useRef<number | null>(null);
  const hlsRef = useRef<any>(null);

  const currentStory = stories[currentStoryIndex];
  const currentMedia = currentStory?.media[currentMediaIndex];

  // Utility Functions
  const resetProgress = useCallback(() => {
    setProgress(0);
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const cleanupHls = useCallback(() => {
    if (hlsRef.current) {
      try {
        hlsRef.current.stopLoad();
        hlsRef.current.destroy();
      } catch (error) {
        console.error('Error cleaning up HLS:', error);
      }
      hlsRef.current = null;
    }
  }, []);

  // Navigation Functions
  const goToNextMedia = useCallback(() => {
    resetProgress();
    cleanupHls();
    setHasPlaybackError(false);
    if (!currentStory) return;
    if (currentMediaIndex < currentStory.media.length - 1) {
      setCurrentMediaIndex((prev) => prev + 1);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setCurrentMediaIndex(0);
    } else {
      onClose?.();
    }
  }, [currentMediaIndex, currentStory, currentStoryIndex, stories.length, onClose, resetProgress, cleanupHls]);

  const goToPrevMedia = useCallback(() => {
    resetProgress();
    cleanupHls();
    setHasPlaybackError(false);
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setCurrentMediaIndex(stories[currentStoryIndex - 1].media.length - 1);
    }
  }, [currentMediaIndex, currentStoryIndex, stories, resetProgress, cleanupHls]);

  // Progress Management
  const startProgress = useCallback(() => {
    resetProgress();
    if (!currentMedia || hasPlaybackError) return;
    const duration = currentMedia.type === "video" ? (videoRef.current?.duration || 5) * 1000 : currentMedia.duration || 5000;
    progressTimerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const increment = (100 / duration) * 100;
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          goToNextMedia();
          return 0;
        }
        return newProgress;
      });
    }, 100);
  }, [currentMedia, hasPlaybackError, resetProgress, goToNextMedia]);

  // HLS Implementation
  const initHls = useCallback(async (video: HTMLVideoElement, streamUrl: string) => {
    if (!window.Hls) {
      throw new Error('HLS.js is not loaded');
    }
    const hls = new window.Hls({
      maxBufferLength: 10,
      maxMaxBufferLength: 20,
      enableWorker: true,
      autoStartLoad: true,
      startPosition: -1,
      debug: false,
      fragLoadingTimeOut: 20000,
      manifestLoadingTimeOut: 20000,
      levelLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 6,
      manifestLoadingMaxRetry: 6,
      levelLoadingMaxRetry: 6,
    });
    hlsRef.current = hls;
    return new Promise((resolve, reject) => {
      let hasResolved = false;
      const timeoutId = setTimeout(() => {
        if (!hasResolved) {
          console.error('HLS initialization timeout - cleaning up');
          hls.destroy();
          reject(new Error('HLS initialization timeout'));
        }
      }, 60000);
      const cleanup = () => {
        clearTimeout(timeoutId);
        hls.off(window.Hls.Events.MEDIA_ATTACHED);
        hls.off(window.Hls.Events.MANIFEST_PARSED);
        hls.off(window.Hls.Events.ERROR);
      };
      hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
        console.log('HLS: Media attached');
      });
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS: Manifest parsed');
        video.play().then(() => {
          hasResolved = true;
          cleanup();
          resolve(hls);
        }).catch((error) => {
          console.error('Failed to play video after manifest parsed:', error);
          cleanup();
          reject(error);
        });
      });
      hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case window.Hls.ErrorTypes.NETWORK_ERROR:
              console.log('HLS: Fatal network error... trying to recover');
              hls.startLoad();
              break;
            case window.Hls.ErrorTypes.MEDIA_ERROR:
              console.log('HLS: Fatal media error... trying to recover');
              hls.recoverMediaError();
              break;
            default:
              console.error('HLS: Fatal error... cannot recover');
              cleanup();
              hls.destroy();
              reject(new Error(`HLS fatal error: ${data.type}`));
              break;
          }
        }
      });
      try {
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }, []);

  // Video Loading and Management
  useEffect(() => {
    if (!currentMedia || currentMedia.type !== "video" || !videoRef.current) return;
    setIsLoading(true);
    setHasPlaybackError(false);
    const loadVideo = async () => {
      try {
        if (currentMedia.streamId && window.Hls && window.Hls.isSupported()) {
          console.log('Starting HLS video load:', currentMedia.streamId);
          await initHls(videoRef.current!, currentMedia.streamId);
          setIsLoading(false);
        } else if (videoRef.current!.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current!.src = currentMedia.streamId!;
          await videoRef.current!.play();
          setIsLoading(false);
        } else {
          throw new Error('Neither HLS.js nor native HLS is supported');
        }
      } catch (error) {
        console.error('Video playback error:', error);
        setIsLoading(false);
        setHasPlaybackError(true);
        setTimeout(() => {
          goToNextMedia();
        }, 1500);
      }
    };
    loadVideo();
    return () => {
      cleanupHls();
    };
  }, [currentMedia, initHls, cleanupHls, goToNextMedia]);

  // Progress Management
  useEffect(() => {
    if (!isPaused && !isLoading && !isScrubbing && !hasPlaybackError) {
      startProgress();
    }
    return resetProgress;
  }, [currentMedia, isPaused, isLoading, isScrubbing, hasPlaybackError, startProgress, resetProgress]);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsPaused(true);
    longPressRef.current = window.setTimeout(() => {
      setIsScrubbing(true);
    }, 200);
  };

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    if (!isScrubbing) {
      const touch = e.changedTouches[0];
      const screenWidth = window.innerWidth;
      if (touch.clientX < screenWidth / 3) {
        goToPrevMedia();
      } else if (touch.clientX > (screenWidth * 2) / 3) {
        goToNextMedia();
      }
    }
    setIsPaused(false);
    setIsScrubbing(false);
  }, [isScrubbing, goToPrevMedia, goToNextMedia]);

  // Media Loading Handler
  const handleMediaLoaded = useCallback(() => {
    setIsLoading(false);
    if (currentMedia?.type === "video" && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, [currentMedia]);

  // Mute/Unmute Handler
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressRef.current) {
        window.clearTimeout(longPressRef.current);
      }
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
      cleanupHls();
    };
  }, [cleanupHls]);

  if (!currentStory || !currentMedia) {
    return null;
  }

  return (
    <Flex direction="column" align="center" justify="center" position="relative" height="100vh" width="100vw">
      {/* Progress Bars */}
      <HStack spacing={1} position="absolute" top={0} width="100%" padding={2} zIndex={10}>
        {currentStory.media.map((_, index) => (
          <Progress
            key={index}
            value={index < currentMediaIndex ? 100 : index === currentMediaIndex ? progress : 0}
            size="xs"
            flex={1}
            colorScheme="teal"
            sx={{ div: { transition: 'width 0.1s linear' } }}
          />
        ))}
      </HStack>

      {/* User Info and Mute/Unmute Button */}
      <HStack position="absolute" top={2} left={2} zIndex={20}>
        <Avatar name={currentStory.user.name} src={currentStory.user.avatar} />
        <Text color="white" fontWeight="bold">{currentStory.user.name}</Text>
        {currentMedia.type === "video" && (
          <IconButton
            aria-label={isMuted ? "Unmute" : "Mute"}
            icon={isMuted ? <VolumeX /> : <Volume2 />}
            colorScheme="whiteAlpha"
            variant="ghost"
            _hover={{ bg: 'whiteAlpha.200' }}
            onClick={toggleMute}
          />
        )}
      </HStack>

      {/* Media Container */}
      <Box
        as={MotionBox}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        position="relative"
        width="100%"
        height="100%"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && (
          <Spinner size="xl" color="white" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" />
        )}
        {currentMedia.type === "video" ? (
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onLoadedData={handleMediaLoaded}
            controls={false}
            playsInline
            muted={isMuted}
          />
        ) : (
          <img
            src={currentMedia.url}
            alt="Story"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onLoad={handleMediaLoaded}
          />
        )}
      </Box>
    </Flex>
  );
};

export default StoriesPlayer;