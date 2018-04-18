import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity
} from "react-native";


function makePressHandler({navigation, route, navParams, onPress}) {
    if (navigation && route)
        return () => navigation.navigate(route, navParams);

    return onPress;
}

export const TextButton = ({navigation, route, navParams, onPress, children, style, ...props}) => (
    <TouchableHighlight onPress={makePressHandler({navigation, route, navParams, onPress})}
                        underlayColor="rgba(255, 255, 255, 0.5)">
        <Text style={[styles.textButton, style]} {...props}>
            {children}
        </Text>
    </TouchableHighlight>
);

export class Button extends Component {
    constructor(props) {
        super(props);
        this.state = { active: false };
    }

    onPressIn = () => {
        this.setState({ depressed: true });
    }

    render() {
        let {textStyles, activeTextStyles, children, ...props} = this.props,
            {active} = this.state;

        return (
            <TouchableOpacity
                onPressIn={() => this.setState({ active: true })}
                onPressOut={() => this.setState({ active: false })}
                style = {styles.capture}
                {...props}
            >
                <Text style={[styles.button, textStyles, active && activeTextStyles]}>
                    {children}
                </Text>
            </TouchableOpacity>
        );
    }
}


const styles = StyleSheet.create({
    textButton: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        padding: 10,
    },

    button: {
        /* flex: 0, */
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20
    }
});
