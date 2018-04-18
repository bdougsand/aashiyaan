import React, { Component } from 'react';

import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { camera } from "../config.js";

import { Button } from "../component/Button.js";


const Camera = require("react-native-camera").RNCamera;
const FRONT = Camera.Constants.Type.front;
const BACK = Camera.Constants.Type.back;

const FLASH_ON = Camera.Constants.FlashMode.on;
const FLASH_OFF = Camera.Constants.FlashMode.off;

export class RecordVideo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            capturingAudio: true,
            facing: BACK,
            zoom: 0,
            recording: false
        };
    }

    flipDirection = () => {
        let {facing} = this.state;
        this.setState({facing: facing === FRONT ? BACK : FRONT})
    }

    incZoom = (change) => {
        let {zoom} = this.state,
            newZoom = Math.min(1, Math.max(0, zoom + change));

        if (newZoom === zoom) {
            // TODO Possibly run callbacks
        }

        this.setState({ zoom: newZoom });
    }

    beginRecording = () => {
        if (this.props.onRecordingBegan)
            this.props.onRecordingBegan();

        this.setState({ recording: true });
        return this.camera.recordAsync({
            quality: Camera.Constants.VideoQuality[camera.quality],
            maxDuration: camera.maxDuration,
            maxFileSize: camera.maxFileSize
        }).then(video => {
            this.setState({ recording: false, lastVideo: video });
            if (this.props.onRecordingComplete)
                this.props.onRecordingComplete(video.uri)
        }, err => {
            this.setState({ recording: false });
            if (this.props.onError)
                this.props.onError(err)
            else
                Alert.alert("Something went wrong", err.toString());
        });
    }

    endRecording = () => {
        if (this.props.onRecordingStopped)
            this.props.onRecordingStopped();

        this.camera.stopRecording();
    }

    muteMicrophone = () => {
        this.setState({ capturingAudio: false });
    }

    renderZoomControls = () => {
        let {zoom} = this.state;


    }

    renderButton = () => {
        let {recording, uploading} = this.state;

        return (
            <Button textStyles={recording ? styles.recording : styles.waiting}
                    onPress={recording ? this.endRecording : this.beginRecording}>
                { recording ? "Stop" : "Start" }
            </Button>
        );
    }

    render() {
        let {facing, zoom} = this.state;
        console.log("Hello")

        return (
            <View style={styles.container}>
                <Camera
                    ref={ref => {this.camera = ref;}}
                    style = {styles.preview}
                    type={BACK}
                    flashMode={FLASH_ON}
                    permissionDialogTitle={"Permission to use camera"}
                    permissionDialogMessage={camera.permissionMessage}
                />
                <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center',}}>
                    {this.renderButton()}
                </View>
            </View>
        );
    }
}

export default class RecordVideoPage extends Component {
    goToNextPage = (uri) => {
        let {navigation, navParams} = this.props,
            {nextRoute} = navigation.state.params;

        if (nextRoute) {
            navigation.navigate(nextRoute, Object.assign({video: uri},
                                                         navParams || {}))
        }
    }

    render() {
        let {navigation, ...props} = this.props;

        return (
            <RecordVideo onRecordingComplete={this.goToNextPage}
                         {...props}/>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black'
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    camera: {
        backgroundColor: "black",
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        height: 100,
        width: 200
    },
    recording: {
        backgroundColor: "red",
        color: "white"
    }
});

RecordVideoPage.navConfig = {
    screen: RecordVideoPage
}
