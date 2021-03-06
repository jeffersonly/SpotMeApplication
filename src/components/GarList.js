import React, { Component } from 'react';
import {
    View,
    Animated,
    Image,
    Platform
} from 'react-native';
import axios from 'axios';

import { 
    slideUp,
    slideDown
} from '../actions/slideActions'

import { connect } from 'react-redux';

import PerGarageInfo from './PerGarageInfo';
import loadingImage from '../images/loading.gif';

import styles from './Styling.style.js';

//List of garages, gets information on garages (name, parking spaces, etc)
class GarList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            parkingsName: '',
            parkingsMax: 0,
            parkingsCurrent: 0,
            status: 0, //0 = not loaded, 1 = loading, 2 = loaded
            bottom: new Animated.Value(-(styles.garList.containerStyle.height)),
        };
        this.slideUp = this.slideUp.bind(this);
        this.slideDown = this.slideDown.bind(this);
    }

    //Updates the information for a garage
    updateData(searchName) {
        console.log('Currently fetching data: ' + searchName);
        this.setState({
            status: 1
        }, () => {
            axios.post('https://project-one-203604.appspot.com/garages/garage', {
                name: searchName
            }).then(res => {

                console.log('Found Garage Data: ' + searchName);

                this.setState({
                    parkingsName: res.data.name,
                    parkingsMax: res.data.max,
                    parkingsCurrent: res.data.current,
                    status: 2
                }, function () {
                    console.log('State has changed');
                });
            });
        });
    }


    //When loading is finished, garage information is returned
    whenDoneLoading() {
        console.log('WhenDoneLoading');
        if (this.state.status == 2) {
            console.log('PerGarageInfo Loaded, Status: ' + this.state.status);
            return (
                <PerGarageInfo
                    spotsNum={this.state.parkingsCurrent}
                    garageName={this.state.parkingsName}
                    garageMax={this.state.parkingsMax}
                />
            );
        }
        else {
            return (
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: styles.garList.height
                }}>
                    <Image style={{
                        width: 50,
                        height: 50
                    }}
                        source={loadingImage} />
                </View>
            )
        }
    }

    //Upon execution of chart table
    // styling is changed for the garage information container based on platform
    slideUp() {
        if (Platform.OS === 'android') {
            Animated.timing(this.state.bottom, {
                toValue: -(styles.garList.containerStyle.height - styles.garList.height),
                duration: 100
            }).start();
        }
        else {
            this.setState({
                bottom: -(styles.garList.containerStyle.height - styles.garList.height)
            });
        }
    }

    //Upon execution of closing chart table/clicking off of it
    //Styling is changed for the garage info container based on platform
    slideDown() {
        if (Platform.OS === 'android') {
            Animated.timing(this.state.bottom, {
                toValue: -(styles.garList.containerStyle.height),
                duration: 100
            }).start();
            this.setState({
                status: 0
            });
        }
        else {
            this.setState({
                status: 0,
                bottom: -(styles.garList.containerStyle.height),
            });
        }
    }

    componentDidUpdate() {
        this.props.Up(false);
        this.props.Down(false);
    }


    //Updates the view of the garage info chart based on where user clicks
    //If user clicks off the chart then the chart is not displayed
    shouldComponentUpdate(newProps, newState) {
        if (newProps.upClicked) {
            this.slideUp();
            this.updateData(newProps.keySearch);
            return true;
        }
        if (newProps.downClicked) {
            this.slideDown();
            return true;
        }
        return true;
    }


    //Renders garage information/loads garage information upon rendering
    render() {
        return (
            <Animated.View style={[styles.garList.containerStyle, { bottom: this.state.bottom }]}>
                <View style={styles.garList.garageStyle}>
                    {this.whenDoneLoading()}
                </View>
            </Animated.View>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        keySearch: state.mapPress.key,
        upClicked: state.mapPress.upClicked,
        downClicked: state.mapPress.downClicked
    };
}


const mapDispatchToProps = (dispatch) => {
    return {
        Down: (status) => {
            
            dispatch(slideDown(status))
        },
        Up: (status) =>{
            
            dispatch(slideUp(status))
        }
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(GarList);

