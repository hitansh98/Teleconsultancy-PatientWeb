import React, { Component } from 'react';
import firebase from '../../Services/firebase';
import { Modal, Input, ModalBody, ModalHeader, ModalFooter, Button,Form, FormGroup, Label, FormText,
    Collapse,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink,
NavbarText } from 'reactstrap';
import { Redirect, Link } from 'react-router-dom';
import moment from 'moment';

import loadinganimation from '../../Assets/Lottie/staysafe.gif';



class ThankYou extends Component {
    
    constructor(props) {
        super(props);
        // console.log(props.location.state.userNotFound);

        this.state = {
            handleDocId : this.props.match.params.handle,
            sessionExpired: false,
        }
    }

    toggleNavbar = () => {
        this.setState(prevState=>{
          return{
              ...prevState,
              isNavbarOpen: !prevState.isNavbarOpen,
          }
        });
    }

    componentDidMount = async() => {
        let dbDoctors = firebase.database().ref(`doctors/${this.state.doctorId}/name`);

        await dbDoctors.once("value", (snap) =>{
            // console.log(snap.val());
            this.setState({ doctorName : snap.val()});
        });
        await this.getValueFromSessionStorage();
    }

    componentDidUpdate = async() => {
        await this.getValueFromSessionStorage();
    }
    
    
    getValueFromSessionStorage = async() => {
        const sT = sessionStorage.getItem('loginTimestamp');
        console.log(sT);
        console.log("i check for session expiry");
        if(!sT){
            await this.setState({ sessionExpired: true})
            localStorage.removeItem('doctorId');
        }
        else{
            let dateNowMoment = moment(new Date());
            let timestampMoment = moment(parseInt(sT));
            let addedMoment = timestampMoment.add(30, 'm');
            console.log(dateNowMoment);
            console.log(timestampMoment);
            console.log(addedMoment);
            if(addedMoment.isBefore(dateNowMoment)){
                await this.setState({ sessionExpired: true});
                localStorage.removeItem('doctorId');
            }
            else{
                sessionStorage.setItem('sessionTimestamp', dateNowMoment);
            }
        }
    }
    
    render() {
        
        return (
            <body className="body">
                <div className="wrapper">
                    <Navbar dark expand="md" style={{backgroundColor:"#4be4ac"}}>
                        <NavbarBrand href={`/${this.state.handleDocId}/`} style={{ color:'#ffffff', fontWeight:'600'}}>Teleconsultancy - Dr. {this.state.doctorName}</NavbarBrand>
                        <NavbarToggler onClick={this.toggleNavbar} />
                        <Collapse isOpen={this.state.isNavbarOpen} navbar>
                        <Nav className="mr-auto" navbar>
                            <NavItem>
                            <NavLink style={{color:'#ffffff'}} href={`/${this.state.handleDocId}/Appointments`}>My Appointments</NavLink>
                            </NavItem>
                            <NavItem>
                            <NavLink style={{color:'#ffffff'}} href={`/${this.state.handleDocId}/Prescriptions`}>My Prescriptions</NavLink>
                            </NavItem>
                            <NavItem>
                                <Link to={{pathname:`/${this.state.handleDocId}/`}}>
                                    <NavbarText style={{color:'#ffffff'}} onClick={()=>{localStorage.removeItem('doctorId')}}> Logout </NavbarText>
                                </Link>
                            </NavItem>
                        </Nav>
                        </Collapse>
                    </Navbar>
                    {
                        (this.state.sessionExpired) ? (
                            <div>
                                <Redirect push
                                to={{
                                    pathname: `/${this.state.handleDocId}/`,
                                }} />
                            </div>
                        ) : (<div></div>)
                    } 
                    
                    <div className="row">
                        <div style={{flexDirection : 'column', textAlign: 'center', justifyContent:'center', width:'100%'}}> 
                            <img src={loadinganimation} height={250} width={250}/>
                            <p>Thank you for using our website. Proceed to the home section by clicking below.</p>
                            <Link to={`/${this.state.handleDocId}/`}>
                                <button className="std-button">Back to Home</button>
                            </Link>
                        </div>
    
                    </div>
                    
    
                </div> 
                
            </body>
        );
    
    }
    }
    
    export default ThankYou;