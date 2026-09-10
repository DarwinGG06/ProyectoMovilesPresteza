import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

const VIDEO_CASA =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';

type VideoYoutubeProps = {
  inicio?: number;
  uri?: string;
};

export function VideoYoutube({ inicio = 0, uri = VIDEO_CASA }: VideoYoutubeProps) {
  const player = useVideoPlayer(uri, (instancia) => {
    instancia.loop = true;
    instancia.muted = true;
    instancia.currentTime = inicio;
    instancia.play();
  });

  return (
    <View pointerEvents="none" className="flex-1 overflow-hidden bg-black">
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        surfaceType="textureView"
      />
    </View>
  );
}
