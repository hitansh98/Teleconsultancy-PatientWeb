import React, { Component } from 'react';
import {Redirect, Link} from 'react-router-dom';
import firebase from '../../Services/firebase';
import { Modal, Input, ModalBody, ModalHeader, ModalFooter, Button, Spinner,Form, FormGroup, Label, FormText, Popover, PopoverHeader, PopoverBody, 
  Collapse,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  NavbarText
   } from 'reactstrap';

import { AvForm, AvField } from 'availity-reactstrap-validation';
import Loader from '../../Assets/Loader/Loader';
import moment from 'moment';



class Login extends Component {
constructor(props) {
   
    super(props);
    this.state = {
        doctorId: this.props.match.params.handle,
        toggleSwitch: false,
        userDependentTitle: 'Mr.',
        dataSubmitted: false,
        userChosenId: '0',
        userDependentRelation: 'self',
        isLoading: false,
        handleDocId : this.props.match.params.handle,
        slotPopoverOpen: false,
        userDependentAgree: false,
        userNotificationModal: false,
      };
      
      
      

      if(props.location.state){
        if(props.location.state.userLoggedInFromRegister){
          // this.setState({userLoggedIn : true});
          // this.setState({userChosen : "self"});
          // this.setState({dependentsData: []});
          this.state["userLoggedInFromRegister"] = true;
        }
        
      }
}
componentDidMount = async() => {
  

  this.setState({isFetching : true});
  let dbref = firebase.database().ref(`doctors/${this.state.doctorId}`);
  await dbref.once("value", async(snap) => {
    let data = snap.val();
    this.setState({ doctorData : data });
    this.setState({ doctorName: data["name"]});
    let doctorPaymentAlternativeOnline = data["consultancyFee"]["FeeCollect_Mode_online"];
    let doctorPaymentAlternativeOffline = data["consultancyFee"]["FeeCollect_Mode_offline"];
    this.setState({doctorPaymentAlternativeOnline});
    this.setState({doctorPaymentAlternativeOffline});

    // const snapshot = firebase.database().ref()
    //   .child(`patients/8529469097/notifications`)
    //   .once('value')
    //   .then(async(snapshot) => {
    //     let number = 0;
    //     console.log("notif object: "+JSON.stringify(snapshot.val()));
    //     if(snapshot.val()){
    //         console.log(Object.keys(snapshot.val()).length);
    //         number = Object.keys(snapshot.val()).length;
    //     }

    //     console.log(number);
    //     var object = {
    //         id : number + 1,
    //         notification : `You have a new Prescription for appointment held at xyz abc. Go to Prescriptions to check it out.`,
    //         doctorId : 9890120677,
    //         isSeen : false
    //     };
    //     var updates = {};
    //     updates[
    //         'patients/' + '8529469097' + '/notifications/' + (parseInt(number)+1)
    //     ] = object;
    //     await firebase.database().ref().update(updates);
    //   });
  });

  await this.fetchSessionStorageItems();

  await this.fetchSlotDetails();


  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log("USER LOGGED IN")
    } else {
        // No user is signed in.
        console.log("USER NOT LOGGED IN")
    }
  });

}

fetchSessionStorageItems = async() => {

    let diChecker = localStorage.getItem('doctorId');

    if(this.state.handleDocId == diChecker){
      let uli = sessionStorage.getItem('userLoggedIn');
      let uc = sessionStorage.getItem('userChosen');
      let up = sessionStorage.getItem('userPhone');
      let pd = sessionStorage.getItem('patientsData');
      let udn = sessionStorage.getItem('userDependentName');
      let ucm = sessionStorage.getItem('userCommunicationMode');
      
      
      if(uli != "undefined" && uc != "undefined" && up !="undefined" && pd != "undefined" && udn!=="undefined" && ucm !=="undefined"){
        this.setState({userLoggedIn: uli});
        // this.setState({userChosen: uc});
        this.setState({userCommunicationMode: ucm});
        if(ucm == "WhatsApp"){
          let uw = sessionStorage.getItem('userWhatsapp');
          if(uw !=="undefined"){
            this.setState({userWhatsapp: uw});
          }
        }
        this.setState({userPhone: up});
        this.setState({userDependentName: udn});
        await this.setState({patientsData: JSON.parse(pd)});

        if(pd){ 
          let obj = JSON.parse(pd);
          let dependentsDataObj = obj["dependents"];
          let dependentsDataArray = [];
            if(dependentsDataObj){
              dependentsDataArray = Object.keys(dependentsDataObj).map(key => {
                return dependentsDataObj[key];
              });
            }
          this.setState({dependentsData: dependentsDataArray});
        }
        
      }
    }

    

    
}

fetchSlotDetails = async() => { 
  console.log('in doctor fetcher'+ this.state.doctorId);
      console.log(this.state.doctorData);
      let dObject = this.state.doctorData["slotDetails"]["timeSlotsTemp"];
      console.log(dObject);
      if(dObject){
        let dObjKeys = Object.keys(dObject);
        let dObjArray = [];

        for(let i=0;i<dObjKeys.length;i++){
            // dObjTemp.push(dObject[dObjKeys[i]]);
            let temp = Object.keys(dObject[dObjKeys[i]]);
            let dObjTemp = [];
            for(let j=0;j<temp.length;j++){
                dObjTemp.push(dObject[dObjKeys[i]][temp[j]]);
            }
            let key = dObjKeys[i];
            let obj={};
            obj[key] = dObjTemp;
            dObjArray.push(obj);
        }

        const sorter = {
            // "sunday": 0, // << if sunday is first day of week
            "Mon": 1,
            "Tue": 2,
            "Wed": 3,
            "Thu": 4,
            "Fri": 5,
            "Sat": 6,
            "Sun": 7
          }

          dObjArray.sort(function sortByDay(a, b) {
            //console.log(a);
            let day1 = Object.keys(a)[0];
            let day2 = Object.keys(b)[0];
            return sorter[day1] - sorter[day2];
          });


        console.log(dObjArray);
        this.setState({ dObjArray });
      }
      
      this.setState({isFetching : false});
}

handleToggleArrow(){
  // console.log("I reached arrow click");
  this.setState({ toggleSwitch: !this.state.toggleSwitch });
}

handleTextChange = (key) => (event) => {
  // console.log(this.state.userName);
  this.setState({ [key]: event.target.value});
}

handleSubmit = async() =>{
  // console.log("entered handle submit");
  if(this.state.userChosen=="self"){
    await this.setState({
      userDependentTitle: (this.state.userDependentGender=="Male") ? "Mr." : "Mrs.",
    });
  }  
  if(this.state.userChosen=="other"){
    console.log(this.state.userDependentAgree+" "+this.state.userDependentNameEntry+" "+this.state.userDependentRelationEntry+" "+this.state.userDependentGenderEntry+" "+this.state.userDependentBirthdateEntry);
    if(this.state.userDependentAgree) {
      if(this.state.userDependentNameEntry && this.state.userDependentRelationEntry && this.state.userDependentGenderEntry && this.state.userDependentBirthdateEntry){
        var updates = {};
        await this.setState({
          userDependentBirthdate: this.state.userDependentBirthdateEntry,
          userDependentName: this.state.userDependentNameEntry,
          userDependentRelation: this.state.userDependentRelationEntry,
          userDependentGender: this.state.userDependentGenderEntry,
        });

        let dName = this.state.userDependentNameEntry;
        let num = 0;
        if(this.state.patientsData['dependents']){
          num = Object.keys(this.state.patientsData['dependents']).length;
        }
        num++;
        
        let dObject = {
          name:  this.state.userDependentName,
          relation: this.state.userDependentRelation,
          title: this.state.userDependentTitle,
          gender: this.state.userDependentGender,
          birthdate: this.state.userDependentBirthdate,
        }
  
        let keyStringDep = "d"+num;
        await this.setState(prevState => ({
          patientsData: {
            ...prevState.patientsData,
            dependents : {
              ...prevState.patientsData.dependents,
              [keyStringDep] : dObject
            }
          }
        })
        );
  
        updates[`patients/${this.state.userPhone}/dependents/d${num}`] = dObject;
        await firebase.database().ref().update(updates);
        sessionStorage.setItem('patientsData', JSON.stringify(this.state.patientsData));
  
      }else{
        document.getElementById('data-not-found').innerHTML="Please enter required data";
        return;
      }
    }
    else{
      document.getElementById('data-not-found').innerHTML="Please agree to the aforementioned conditions";
      return;
    }
    
  }

  // state: {
      //   doctorId: this.state.doctorId,
      //   dependentInfo : {
      //     name : this.state.userDependentTitle+" "+this.state.userDependentName,
      //     id : this.state.userChosenId,
      //     relation: this.state.userDependentRelation
      //   },
      //   userId: this.state.userPhone
      // }

      
      localStorage.setItem('userDependentName', this.state.userDependentTitle+" "+this.state.userDependentName);
      localStorage.setItem('userDependentId', this.state.userChosenId);
      localStorage.setItem('userDependentRelation', this.state.userDependentRelation);
      localStorage.setItem('userDependentGender', this.state.userDependentGender);
      localStorage.setItem('userDependentBirthdate', this.state.userDependentBirthdate);
      localStorage.setItem('userId', this.state.userPhone);
      localStorage.setItem('doctorPaymentAlternativeOnline', this.state.doctorPaymentAlternativeOnline);
      localStorage.setItem('doctorPaymentAlternativeOffline', this.state.doctorPaymentAlternativeOffline);
      
  
  this.setState({dataSubmitted: true});
  
}

handleSelectChange = (key) => async(event) =>{
  if(key=="title"){
    this.setState({ userDependentTitle: event.target.value});
  }
  if(key=="gender"){
    await this.setState({ userDependentGenderEntry: event.target.value});
  }
}

handleDate = (event) => {
  console.log(event.target.value);
  this.setState({userDependentBirthdateEntry : event.target.value});
}

handleLogout = () => {
  localStorage.removeItem('doctorId');
  window.location.reload();
}

choosePerson = (event) => {
  // console.log(event.target.value);
  console.log(this.state.patientsData["name"])
  
  
  this.setState({userChosen: event.target.value});
  if(event.target.value == "self"){
    this.setState({ userChosenId: '0'});
    this.setState({ userDependentName: this.state.patientsData["name"]});
    this.setState({ userDependentGender: this.state.patientsData["gender"]});
    this.setState({ userDependentBirthdate: this.state.patientsData["birthdate"]});
    this.setState({ userDependentRelation: 'self'});
    this.setState({ userDependentId: '0'});
  }
  else if(event.target.value == "other"){
    let num=0;
    if(this.state.patientsData['dependents']){
      num = Object.keys(this.state.patientsData['dependents']).length;
    }
    num++;
    this.setState({ userChosenId: num.toString()});
    this.setState({ userDependentId: num.toString()});
  }else{
    let str = event.target.value.toString().substring(6);
    // let num = parseInt(str, 10);
    let id = "d"+str;
    let dObj = this.state.patientsData['dependents'][id];
    this.setState({ userChosenId: str});
    this.setState({ userDependentId: str});
    this.setState({ userDependentName: dObj.name});
    this.setState({ userDependentTitle: dObj.title});
    this.setState({ userDependentRelation: dObj.relation});
    this.setState({ userDependentGender: dObj.gender});
  }

}

verifyOtp = async() => {
    console.log(this.state.patientsData);
    let dependentsDataObj = this.state.patientsData["dependents"];
    let dependentsDataArray = [];
    if(dependentsDataObj){
      dependentsDataArray = Object.keys(dependentsDataObj).map(key => {
        return dependentsDataObj[key];
      });
    }
    this.setState({dependentsData: dependentsDataArray});
    console.log("about to enter spnac");
    this.submitPhoneNumberAuthCode();
}



verifyUser = () =>{
  // console.log(this.state.patientsData);
  this.setState({userVerified: true});
}

sendOtp = async() => {
  this.setState({isVerifying: true});
  await firebase.database().ref(`/patients/${this.state.userPhone}`).once("value").then(async(snap)=>{
    const data = snap.val();
    if(!data){
      this.setState({ userNotFound: true});
      // document.getElementById("patient-not-found").innerHTML='User not found. Please register first.';
      this.setState({isVerifying: false});
      return;
    }
    await this.submitPhoneNumberAuth();
    this.setState({ patientsData: data});
    let notifArray = data["notifications"];
    if(notifArray){
      let notifArrayFil = notifArray.filter((ele) => {
        return ele !=null && ele.doctorId==this.state.handleDocId && ele.isSeen==false;
      });
      console.log(notifArrayFil);
      this.setState({ notificationData: notifArrayFil});
    }
   
    this.setState({ userDependentName: data["name"]});
    this.setState({isVerifying: false});
    this.verifyUser();
    console.log("finished in sendOtp");
    return;
  });
}


// This function runs when the 'sign-in-button' is clicked
// Takes the value from the 'phoneNumber' input and sends SMS to that phone number  
submitPhoneNumberAuth = () => {
    // We are using the test phone numbers we created before
    // var phoneNumber = document.getElementById("phoneNumber").value;
    this.setState({isLoading: true});
    console.log("entered reqd fn");
    var phoneNumber = '+91'+this.state.userPhone;
    var appVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: function(response) {
          this.submitPhoneNumberAuth();
        }
      }
    );
    firebase
    .auth()
    .signInWithPhoneNumber(phoneNumber, appVerifier)
    .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        this.setState({ isLoading : false});
        console.log(window.confirmationResult);
        this.setState({confResult : window.confirmationResult});
    })
    .catch((error) => {
        console.log("i am the spna error :"+error);
    });
}

// This function runs when the 'confirm-code' button is clicked
// Takes the value from the 'code' input and submits the code to verify the phone number
// Return a user object if the authentication was successful, and auth is complete
submitPhoneNumberAuthCode = () => {
  // We are using the test code we created before
    // var code = document.getElementById("code").value;
    var code = this.state.userOtp;
    if(this.state.confResult){
      this.state.confResult
      .confirm(code)
      .then((result) => {
          var user = result.user;
          console.log(user);
          document.getElementById("patient-not-found").innerHTML='';
          this.setState({userLoggedIn: true});
          console.log(this.state.notificationData);
          if(this.state.notificationData){
            if(this.state.notificationData.length>0){
              this.setState({userNotificationModal: true});
            }
          }
          
          // this.setState({userChosen: "self"});
          localStorage.setItem('doctorId', this.state.doctorId);
          sessionStorage.setItem('userLoggedIn', true);
          sessionStorage.setItem('userChosen', "self");
          sessionStorage.setItem('userDependentName', this.state.userDependentName);
          
          sessionStorage.setItem('userCommunicationMode', this.state.patientsData["communicationMode"]);
          if(this.state.patientsData["communicationMode"]=="WhatsApp"){
            sessionStorage.setItem('userWhatsapp', this.state.patientsData["userWhatsapp"])
          }
          sessionStorage.setItem('userPhone', this.state.userPhone);
          sessionStorage.setItem('patientsData', JSON.stringify(this.state.patientsData));
          sessionStorage.setItem('loginTimestamp', moment(new Date()).valueOf());

      }).then(console.log(this.state.userLoggedIn),
              console.log(this.state.userChosen),)
      .catch((error) => {
          console.log("i am the spnac error :"+error);
          document.getElementById("patient-not-found").innerHTML='Incorrect OTP. Please try again.';
      });
    }
    
}

setNotificationsSeen = () => {
   let notifArray = this.state.notificationData;
   let idArray = [];
   var updates = {};
   for(let i=0;i<notifArray.length;i++){
    //  idArray.push(notifArray[i].id);
     updates[`patients/${this.state.userPhone}/notifications/${notifArray[i].id}/isSeen`] = true;
   }
   firebase.database().ref().update(updates);
}

handleUserNotificationButton = async() => {
  await this.toggleUserNotificationModal();
  await this.setState({goToPrescriptions: true});
}

toggleUserLoggedInFromRegisterModal = () => {
  this.setState(prevState=>{
      return{
          ...prevState,
          userLoggedInFromRegister: !prevState.userLoggedInFromRegister,
      }
  });
}

toggleSlotPopover = () => {
  this.setState(prevState=>{
    return{
        ...prevState,
        slotPopoverOpen: !prevState.slotPopoverOpen,
    }
  });
}

toggleNavbar = () => {
  this.setState(prevState=>{
    return{
        ...prevState,
        isNavbarOpen: !prevState.isNavbarOpen,
    }
  });
}

toggleUserDependentAgree = () => {
  this.setState(prevState=>{
    return{
        ...prevState,
        userDependentAgree: !prevState.userDependentAgree,
    }
  });
}

toggleUserNotificationModal = () =>{
  this.setState(prevState=>{
    if(prevState.userNotificationModal==true){
      this.setNotificationsSeen();
    }
    return{
        ...prevState,
        userNotificationModal: !prevState.userNotificationModal,
    }
  });
}


render() {
  return (
    <body className="body">
    <div className="wrapper">
    <div className="container-fluid">
    <Navbar dark light expand="md" style={{backgroundColor:"#4be4ac"}}>
        <NavbarBrand href={`/${this.state.handleDocId}/`} style={{ color:'#ffffff', fontWeight:'600'}}>Teleconsultancy - Dr. {this.state.doctorName}</NavbarBrand>
        {
          (this.state.userLoggedIn) ? (
            <NavbarToggler onClick={this.toggleNavbar} />
          ) : (
            <div></div>
          )
        }
        
        {
          (this.state.userLoggedIn) ? (
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
                            <NavbarText style={{color:'#ffffff'}} onClick={this.handleLogout}> Logout </NavbarText>
                        </Link>
                    </NavItem>
                  </Nav>
                </Collapse>
          ) : (
            <div>

            </div>
          )
        }
        
      </Navbar>  
    
     <Modal isOpen={this.state.userLoggedInFromRegister} toggle={this.toggleUserLoggedInFromRegisterModal}>
        <ModalHeader toggle={this.toggleUserLoggedInFromRegisterModal}>Welcome, Hello there!</ModalHeader>
        <ModalBody>
            Alright, so now that you have registered, let's log you in to your account!
        </ModalBody>
        <ModalFooter>
        <Button color="primary" onClick={this.toggleUserLoggedInFromRegisterModal}>Let's go!</Button>
        </ModalFooter>
    </Modal>

    <Modal isOpen={this.state.userNotificationModal} toggle={this.toggleUserNotificationModal}>
        <ModalHeader toggle={this.toggleUserNotificationModal}>New Updates Found!</ModalHeader>
        <ModalBody>
            You have the following new notifications:
            {
              (this.state.notificationData) ? (
                this.state.notificationData.map((element, index) => {
                  return(
                    <div>
                      <p><b>{index+1}.</b>{element.notification}</p>
                    </div>
                  )
                })
              ) : (
                <div></div>
              )
            }
        </ModalBody>
        <ModalFooter>
        <Button color="primary" onClick={this.handleUserNotificationButton}>Go to My Prescriptions.</Button>
        </ModalFooter>
    </Modal>

    {
      (this.state.isLoading) ? (<Loader loading={this.state.isLoading}/>) : (
        <div className="row">
        {         
        (this.state.isFetching) ? (
          <Loader loading={this.state.isFetching}/>
            ) :
           ( (this.state.doctorData) ? ((!this.state.toggleSwitch) ? (<div className="col-md-7 col-sm-12 col-xs-12 profile-box">
                          <div className="left-box">                                        
                          <div className="welcome-box profile-box">
                              <p className="heading">
                              Welcome to the 
                              <span className="bold">{" Dr. " +this.state.doctorData.name}'s consultancy</span>
                              </p>
                              <p>
                              {this.state.doctorData.description.doctorIntro}
                              </p>
                          </div>
                          <div className="profile-box">
                              <div className="profile-section">
                              <div className="img-box">
                                  <img className="img-box"
                                  src={this.state.doctorData.avatar} 
                                  />
                              </div>
                              <div className="timings" id="SlotPopover" style={{cursor: 'pointer'}}>
                                <div style={{display: 'flex', flexDirection:'column', textAlign: 'right', justifyContent:'center', marginRight:'3vmin'}}> 
                                  <div className="small-img-box-pull-left" >
                                    <img className="grey-clock-style"
                                        src={require('../../Assets/Images/gray-clock.svg')} 
                                    />
                                  </div>
                                  <p style={{paddingTop: '1vh'}}>Timings</p>
                                </div>

                                  <Popover isOpen={this.state.slotPopoverOpen} target="SlotPopover" trigger="legacy" placement="left" toggle={this.toggleSlotPopover}>
                                    
                                        <PopoverBody>
                                            <div>
                                                <p>
                                                    <b> The doctor operates on the following days: </b>
                                                </p>
                                                <p>
                                                    {
                                                        (this.state.dObjArray) ? (
                                                            this.state.dObjArray.map((obj, index) => {
                                                                return(
                                                                    <div>
                                                                        <span><b>{Object.keys(obj)[0]}:</b>&emsp;</span>
                                                                            {
                                                                                console.log(obj[Object.keys(obj)[0]]),
                                                                                (obj[Object.keys(obj)[0]]) ? (
                                                                                    obj[Object.keys(obj)[0]].map((o,i) => {
                                                                                      if(obj[Object.keys(obj)[0]].length<2){
                                                                                        // console.log("in single timeslot");
                                                                                        return(
                                                                                          <span>
                                                                                              <span>{o.openTime}</span>
                                                                                              <span>&nbsp;to&nbsp;</span>
                                                                                              <span>{o.closeTime}</span>
                                                                                          </span>
                                                                                        )
                                                                                      }
                                                                                      else{
                                                                                        if(i!=obj[Object.keys(obj)[0]].length-1){
                                                                                          // console.log(i);
                                                                                          // console.log(obj[Object.keys(obj)[0]].length-1);
                                                                                          // console.log("in multiple timeslot intermediate stage");
                                                                                          return(
                                                                                            <span>
                                                                                                <span>{o.openTime}</span>
                                                                                                <span>&nbsp;to&nbsp;</span>
                                                                                                <span>{o.closeTime}</span>
                                                                                                <span>,&nbsp;</span>
                                                                                            </span>
                                                                                          )
                                                                                        }
                                                                                        else{
                                                                                          // console.log("in multiple timeslot final stage");
                                                                                          return(
                                                                                            <span>
                                                                                                <span>{o.openTime}</span>
                                                                                                <span>&nbsp;to&nbsp;</span>
                                                                                                <span>{o.closeTime}</span>
                                                                                            </span>
                                                                                          )
                                                                                        }
                                                                                      }
                                                                                        
                                                                                    })
                                                                                ) : (<div></div>)
                                                                            }
                                                                        <hr/>
                                                                    </div>
                                                                    
                                                                )
                                                            })
                                                        ) : (<div></div>)
                                                        
                                                    }
                                                    
                                                </p>
                                            </div>
                                        </PopoverBody>
                                    </Popover>
                              </div>
                              <div className="pro-description">
                                  <p>
                                  <span className="bold"> 
                                      {"Dr. "+this.state.doctorData.name}
                                  </span>
                                  <br/>
                                  {this.state.doctorData.description.hospitalName}
                                  </p>
                              </div>
                              
                              </div>
                          </div>
                            {console.log(this.state.patientsData)}
                          <div className="profile-box">
                              <div className="pro-description">
                              <p>
                                  <span className="bold">
                                  Education and experience
                                  </span>
                                  <br/>
                                  {this.state.doctorData.description.education}
                              </p>
                              </div>
                          </div>

                          
                          </div>
                      </div>) : (<div> </div>)) : (<div></div>)) 
        
        
                     
                }

          
            <div className={`col-sm-12 xol-xs-12 ${(!this.state.toggleSwitch) ? "col-md-5" : "col-md-12"}`} style={{padding: 0}}>
              <div  className="login-section text-center">
                <h1 className="main-heading">Patient Login</h1>
                {
                  !(this.state.userLoggedIn) ? 
                  (<p>If you are already registered patient login with your register mobile number</p>) :
                  (<p>I want to consult the doctor for</p>)
                }
                
                {/* <form> */}
                  <div className="form-group">
                    {
                      (!this.state.userLoggedIn) ? (
                        
                          (!this.state.userVerified) ? 
                          ( <div>
                              <div style={{display: 'flex', justifyContent:'center'}}>
                                <input type="number" 
                                  pattern="\d*"
                                  inputMode="numeric" 
                                  className="std-input" 
                                  placeholder="Enter Your Phone Number" 
                                  onChange={this.handleTextChange('userPhone')}/> 
                                  {
                                    (this.state.isVerifying) ? (<Spinner style={{margin: "1.3% 3%", width:"2rem", height:"2rem"}}color="dark" />) : (<div></div>)
                                  }
                              </div>
                            <p id="patient-not-found"></p> 
                          </div>) : 
                          (<div> <input type="number" 
                          pattern="\d*"
                          name="phone number" 
                          className="std-input" 
                          placeholder="Enter the OTP" 
                          onChange={this.handleTextChange('userOtp')}/> 
                          <p id="patient-not-found"></p> </div> )
                        
                      ) : (
                        <div class="patient-dependents"> 
                        <div class="patient-box">
                          <div class="chiller_cb">
                            <input id="myCheckbox1" type="radio" name="for-radio" value="self" onInput={this.choosePerson}/>
                            <label for="myCheckbox1">For Me</label>
                            <span></span>
                          </div>
                          {console.log("after the fetches: "+this.state.dependentsData)}
                            {
                              (this.state.dependentsData) ? (
                                this.state.dependentsData.map((dep, index) => (
                                  <div class="chiller_cb">
                                  <input id={`myCheckbox${index+2}`} type="radio" name="for-radio" value={`person${index+1}`} onInput={this.choosePerson}/>
                                  <label for={`myCheckbox${index+2}`}>{`For ${dep.title} ${dep.name}`}</label>
                                  <span></span>
                                  </div>
                                ))
                              ) : (
                                <div></div>
                              )
                            }
                          
                          
                          <div class="chiller_cb">
                            <input id="myCheckboxOther" type="radio" name="for-radio" value="other" onInput={this.choosePerson}/>
                            <label for="myCheckboxOther">For Other</label>
                            <span></span>
                          </div>
                        </div>

                        {
                          (this.state.userChosen == "other") ? (
                            <div class="detail-box">
                              <h3>Enter other details</h3>
                              <div>
                              <div class="row">

                                <div class="col-md-3 col-sm-3 col-xs-12">
                                  <div class="form-group">
                                    <select class="form-control" id="exampleFormControlSelect1" onChange={this.handleSelectChange('title')}>
                                      <option value="Mr.">Mr.</option>
                                      <option value="Mrs.">Mrs.</option>
                                      <option value="Miss.">Miss.</option>
                                      <option value="Mst.">Mst.</option>
                                      
                                    </select>
                                  </div>
                                </div>

                                <div class="col-md-4 col-sm-4 col-xs-12">
                                  <div class="form-group">
                                    <input type="text" name="dependent-name" class="std-input" placeholder="Name" onChange={this.handleTextChange('userDependentNameEntry')}/>
                                  </div>
                                </div>

                                <div class="col-md-5 col-sm-5 col-xs-12">
                                  <div class="form-group">
                                    <input type="text" name="dependent-relation" class="std-input" placeholder="Relation with person" onChange={this.handleTextChange('userDependentRelationEntry')}/>
                                  </div>
                                </div>

                                <div class="col-md-5 col-sm-5 col-xs-12">
                                  <div class="form-group">
                                    <select class="form-control" id="exampleFormControlSelect1" onChange={this.handleSelectChange("gender")}>
                                      <option>Select your gender</option>
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                    </select>                                  
                                  </div>
                                </div>

                                <div class="col-md-5 col-sm-5 col-xs-12">
                                  <div class="form-group">
                                    <div style={{display:'flex', flexDirection:'column'}}>
                                      <label for="dependent-dob" style={{display: 'flex', margin: 0, color: '#909090', fontSize:12}}>Enter your Birth Date</label>
                                      <input type="date" id="dependent-dob" name="dependent-dob" onChange={this.handleDate} className="std-input" placeholder="Enter Date of Birth"/>
                                      {/* <AvField type="date" name="dobSelect" onChange={this.handleDate} required className="std-input" helpMessage="Enter your Date of Birth" /> */}
                                    </div>   
                                  </div>
                                </div>
                                
                                       

                                <div className="chiller_cb long">
                                    <input id="myAgreeCheckbox" type="checkbox" onChange={this.toggleUserDependentAgree}/>
                                    <label for="myAgreeCheckbox" style={{marginRight:'1rem'}}>I agree to take responsibility of all my dependents' actions, and agree to pose as guardian to these dependents if any one (but not limited to one) is under the legal age of 18.</label>
                                    <span>   
                                        {/* ::before
                                        ::after */}
                                    </span>
                                </div>

                              </div>
                              </div>
                              
                            </div>
                          ) : (<div></div>)
                        }
                        <p id="data-not-found"></p> 
                        </div>
                      )
                    }
                    
                    
                  </div>
                  <div className="form-group">
                    
                  
                  {
                    (!this.state.userLoggedIn) ? (
                      (!this.state.userVerified) ? (<button className="std-button" onClick={this.sendOtp}>
                          Get OTP
                        </button>) : (<button className="std-button" onClick={this.verifyOtp}>
                          Submit OTP
                        </button>)
                    ) : (<button className={`${(this.state.userChosen) ? 'std-button' : 'std-button-disabled'}`} onClick={this.handleSubmit} 
                    disabled={!this.state.userChosen}> 
                    Submit
                  </button>)
                    
                  }      
                    
                  </div>
                {/* </form> */}
                {
                  (!this.state.userLoggedIn) ? (
                    <div>
                      <hr/>
                      <p>If you are not registered patient, please click on the 
                        &nbsp;
                        <b>Register</b>
                        &nbsp;
                        to register your number
                      </p>
                      <div className="form-group">
                        <Link to={`/${this.state.handleDocId}/Register`}>
                          <button className="std-button">Register</button>
                        </Link>
                      </div>
                      <span className={`${(!this.state.toggleSwitch) ? "toggle-button-regi" : "toggle-button-rotate"}`} onClick={this.handleToggleArrow.bind(this)}>
                      </span>
                    </div>) : (<div></div>)
                }
                
              </div>
              {
                (this.state.dataSubmitted) ? 
                (<Redirect push
                      to={{ pathname: `/${this.state.handleDocId}/Consultancy`,
                      }}/> ) : (<div></div>)
              }
              {
                (this.state.goToPrescriptions) ? 
                (<Redirect push
                      to={{ pathname: `/${this.state.handleDocId}/Prescriptions`,
                      }}/> ) : (<div></div>)
              }
            </div>

          {/* <script type="text/javascript">
            (document).ready(function(){
              ("span.toggle-button").click(function()
              {
                (".profile-box").hide(1000);
                (".login-box").addClass("col-md-12");
                ("span.arrow-box.toggle-button").removeClass("toggle-button");
                ("span.arrow-box").addClass("toggle-button-rotate");
              })
            })
          </script> */}
        </div>
      )
    }
        
        <div id="recaptcha-container"></div>
        {
          (this.state.userNotFound) ? (
            <Redirect push to={{
              pathname : `/${this.state.handleDocId}/Register`,
              state : {
                userNotFound : this.state.userNotFound
              }
            }}/>
          ) : (<div></div>)
        }
    </div> 
    </div>
    </body>
  );
}
}

export default Login;