import React from 'react';
import { StyleSheet, View, TouchableHighlight, Image, Dimensions } from 'react-native';
import { StackNavigator } from 'react-navigation';
import YouTube from 'react-native-youtube';
import { videos } from './config';

import AboutPage from "./page/About.js";

import {Button} from "./component/Button.js";

const youtubeApiKey = process.env.YOUTUBE_API_KEY;
console.disableYellowBox = true;

class Player extends React.Component {
  render() {
    const navigation = this.props.navigation;
    return (
      <View>
        <YouTube
          apiKey={youtubeApiKey}
          videoId={navigation.state.params.videoId}
          play={true}
          fullscreen={true}
          showFullscreenButton={false}
          onChangeFullscreen={e => e.isFullscreen || navigation.goBack()}
          style={{ width: 0, height: 0 }}
        />
      </View>
    );
  }
}

function renderVideoWithNavigation(navigate, shouldDisableRemnant) {
  return (video) => {
    const disabled = video.isRemnant && shouldDisableRemnant;
    return (
        <Button key={video.youtubeVideoId}
                onPress={() => navigate(video)}
                style={[styles.touchableStyle, { opacity: disabled ? 0 : 1 }]}
                disabled={disabled}
                image={video.asset}
                pressAnimation="spring"
                resizeMode="contain"
                imageStyle={styles.objectImage}/>
    );
  }
}

class ObjectChooser extends React.Component {
  constructor(props) {
    super(props);
    this.state = { watchedVideos: [] };
  }
  render() {
    const navigation = this.props.navigation;
    const shouldDisableRemnant = this.state.watchedVideos.length < 2;
    const renderVideo = renderVideoWithNavigation((video) => {
      const watchedVideos = new Set(this.state.watchedVideos);
      watchedVideos.add(video.youtubeVideoId);
      this.setState({ watchedVideos: Array.from(watchedVideos) });
      navigation.navigate('Player', { videoId: video.youtubeVideoId });
    }, shouldDisableRemnant);
    return (
      <View style={{flex:1, flexDirection: 'row'}}>
        <Image source={require('./assets/BackgroundForObjectsAndHelpAbout.png')} style={styles.backgroundImage} />

        <View style={styles.objectChooser}>{videos.map(renderVideo)}</View>

        <View style={{ flex: 1.5, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <View style={{backgroundColor: '#aa99dd', height: 80, width: 160, position: 'absolute'}}></View>
          <Button image={require('./assets/AboutIcon.png')}
            pressAnimation="spring"
            style={styles.navIcon}
            navigation={navigation}
            route="About"
          />
          <Button image={require('./assets/HelpIcon.png')}
            pressAnimation="spring"
            style={styles.navIcon}
            navigation={navigation}
            route="Help" />
        </View>
      </View>
    );
  }
}

export default StackNavigator({
  Home: {
    screen: ObjectChooser,
    navigationOptions: {
      header: null,
    },
  },
  Player: { screen: Player },
  About: AboutPage.navConfig
}, {
    headerMode: "none"
});

const styles = StyleSheet.create({
    iconButtonStyle: {
        padding: 15
    },

    iconImageStyle: {
        width: 100,
        height: 100
    },

    pageContainer: {
        flex: 1,
        flexDirection: "column"
    },

    buttonContainer: {
        height: 40,
        flexDirection: "row",
        justifyContent: "space-between"
    },

  objectChooser: {
    flex: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchableStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 60,
    paddingBottom: 0,
    paddingRight: 60,
    paddingTop: 0,
    margin: 10,
  },
  objectImage: {
    height: 100,
    width: 100,
    margin: 2,
  },
  navIcon: {
    height: 100,
    width: 100,
    margin: -12,
  },
  backgroundImage: {
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
