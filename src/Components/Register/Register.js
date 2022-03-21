import React, { Component } from 'react';
import firebase from '../../Services/firebase';
import { Modal, Input, ModalBody, ModalHeader, ModalFooter, Button,Form, FormFeedback, FormGroup, Label, FormText, Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { Redirect,Link } from 'react-router-dom';
import Loader from '../../Assets/Loader/Loader';


class Register extends Component {
    
constructor(props) {
    super(props);
    // console.log(props.location.state.userNotFound);
   
    this.state = {
        doctorId : this.props.match.params.handle,
        toggleSwitch: false,
        toggleCondition: false,
        toggleUnderage: false,
        guardianDataFilled: false,
        userUnderage : false,
        nameError: '',
        isFetching : false,
        handleDocId: this.props.match.params.handle,
        slotPopoverOpen : false,
        communicationModeModal : false,
        userGender: 'Male',
        
        
        // userName: '',
        // userPhone: 0,
        // userWhatsapp: 0,
        // userEmail: '',
        // userIs18: false,
        // userAgree: false,
      };
      if(props.location.state){
        if(props.location.state.userNotFound){
            console.log("reached user not found")
            this.state["userNotFound"] = true;
        }
      }
      
}

componentDidMount = async() => {
    this.setState({isFetching : true});
    let dbref = firebase.database().ref(`doctors/${this.state.doctorId}`);
    await dbref.once("value", async(snap) => {
      let data = snap.val();
      this.setState({ doctorData : data});
      this.setState({ doctorName: data["name"]});
    });

    await this.fetchSlotDetails();
  
    
}

fetchSlotDetails = async() => { 
    console.log('in doctor fetcher'+ this.state.doctorId);
        console.log(this.state.doctorData);
        let dObject = this.state.doctorData["slotDetails"]["timeSlotsTemp"];
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
        this.setState({isFetching : false});
}

handleInvalidSubmit = () => {
    document.getElementById('errors-in-form').innerHTML = "Please fix errors in form";
}

handleInvalidWhatsapp = () => {
    document.getElementById('number-invalid').innerHTML = "Please enter valid data to proceed";
}

toggleUserNotFoundModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            userNotFound: !prevState.userNotFound,
        }
    });
}

toggleUnderageModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            toggleUnderage: !prevState.toggleUnderage,
        }
    });
}

saveGuardianData = async() => {
    let updates ={};
    let object = {
        "Guardian Name" : this.state.guardianName,
        "Guardian Phone" : this.state.guardianPhone,
        "Guardian Email" : this.state.guardianEmail,
        "Guardian Relationship" : this.state.guardianRelationship,
        "Guardian Address" : this.state.guardianAddress
    };
    // updates[`patients/${this.state.userPhone}/guardian/`] = object;
    // await firebase.database().ref().update(updates);
    this.setState({guardianDataObject: object});
    this.setState({guardianDataFilled: true});
}

toggleConditionModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            toggleCondition: !prevState.toggleCondition,
        }
    });
}

handleToggleArrow(){
    console.log("I reached arrow click");
    this.setState({ toggleSwitch: !this.state.toggleSwitch });
}

handleTextChange = (key) => (event) => {
    this.setState({ [key]: event.target.value});
}

handleDate = (event) => {
    console.log(event.target.value);
    this.setState({userBirthdate: event.target.value});
}

handleNameChange = (key) => (event) => {
    this.setState({ 
        [key]: event.target.value,
        nameError : event.target.validationMessage
    });
}

handleCheckboxChange = (key) => (event) => {
    // console.log(this.state.userAgree);
    if(key=="userUnderage"&& event.target.checked==true){
        this.setState({toggleUnderage: true})
    }
    this.setState({ [key]: event.target.checked});
    console.log(event.target.checked);
}

handleRegisterClick = async() =>{
    console.log("register clicked");
    var updates ={};
    
    let object = {
        "name": this.state.userName,
        "phone": this.state.userPhone,
        "gender" : this.state.userGender,
        "userUnderage": this.state.userUnderage,
        "communicationMode" : this.state.communicationMode,
        "birthdate" : this.state.userBirthdate,
    }
    if(this.state.userEmail){
        object["email"] = this.state.userEmail;
    }
    if(this.state.userUnderage){
        object["guardian"] =  this.state.guardianDataObject;
    }
    if(this.state.communicationMode == "WhatsApp"){
        object["userWhatsapp"] =  this.state.userWhatsapp;
    }
    updates[`patients/${this.state.userPhone}`] = object;
    await firebase.database().ref().update(updates);

    return this.setState({ userLoggedInFromRegister : true});
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

toggleCommunicationModeModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            communicationModeModal: !prevState.communicationModeModal,
        }
    });
}



render() {
    
    return (
        <body className="body">
            <div className="wrapper">
                <div className="container-fluid">
                <header className="header-style">
                    <Link to={{pathname:`/${this.state.handleDocId}/`}}>
                        <text className="header-title-consultancy"> Teleconsultancy - Dr. {this.state.doctorName}</text>
                    </Link>
                </header>
                <Modal isOpen={this.state.userNotFound} toggle={this.toggleUserNotFoundModal}>
                    <ModalHeader toggle={this.toggleUserNotFoundModal}>Welcome</ModalHeader>
                    <ModalBody>
                        We noticed that you do not have an account with us, please register to continue.
                    </ModalBody>
                    <ModalFooter>
                    <Button color="primary" onClick={this.toggleUserNotFoundModal}>Okay</Button>
                    </ModalFooter>
                </Modal>
                
                <div className="row">
                {
                    
                          
                        (this.state.isFetching) ? (
                          console.log(this.state.isFetching),
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
                                                                                                    console.log("entered hotzone"),
                                                                                                    obj[Object.keys(obj)[0]].map((o,i) => {
                                                                                                        return(
                                                                                                            <span>
                                                                                                                <span>{o.openTime}</span>
                                                                                                                <span>&nbsp;to&nbsp;</span>
                                                                                                                <span>{o.closeTime}</span>
                                                                                                                <span>&nbsp;&nbsp;</span>
                                                                                                            </span>
                                                                                                        )
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
                    

                    <div className={`col-sm-12 xol-xs-12 ${(!this.state.toggleSwitch) ? "col-md-5" : "col-md-12"}`}  style={{padding: 0}}>
                        <div className={"login-section text-center"}>
                            <h1 className="main-heading">
                                Patient Registration                            
                            </h1>
                            <p>
                                If you are not registered patient please fillup the form below
                            </p>
                            
                            <AvForm onValidSubmit={this.handleRegisterClick} onInvalidSubmit={this.handleInvalidSubmit}>
                                <FormGroup>
                                    <AvField name="username" className="std-input" placeholder="Enter your Full Name*" validate={{
                                        required: {value: true, errorMessage: 'Please enter a name'},
                                        pattern: {value: '^[A-Za-z\\s]+$', errorMessage: 'Names can only contain letters'}
                                    }} style={{width:'60%'}} onChange={this.handleTextChange('userName')}
                                    />
                                </FormGroup>
                                
                                
                                <FormGroup>
                                    <AvField name="mobilenumber" type="number" className="std-input" placeholder="Enter your Mobile Number*" validate={{
                                            required: {value: true, errorMessage: 'Please enter a mobile number'},
                                            pattern: {value: '^[789]{1}[0-9]{9}$', errorMessage: 'Enter valid 10 digit mobile number'}
                                        }} style={{width:'60%'}} onChange={this.handleTextChange('userPhone')}
                                        />   
                                </FormGroup>

                                {/* <FormGroup>
                                    <AvField name="whatsappnumber" className="std-input" placeholder="Enter your whatsapp number" validate={{
                                            required: {value: true, errorMessage: 'Please enter a whatsapp number'},
                                            pattern: {value: '^[789]{1}[0-9]{9}$', errorMessage: 'Enter valid 10 digit whatsapp number'},
                                        }} style={{width:'60%'}} onChange={this.handleTextChange('userWhatsapp')}/>
                                </FormGroup> */}
                                 <FormGroup>
                                    <AvField name="email-id" type="email" className="std-input" style={{width:'60%'}} placeholder="Enter your Email Id" onChange={this.handleTextChange('userEmail')}
                                    />
                                </FormGroup>
                                {/* <FormGroup>
                                    <select className="form-check2" id="exampleFormControlSelect1" style={{width:'60%'}}>
                                        <option disabled="" selected="">Select your language</option>
                                        <option>English</option>
                                        <option>Marathi</option>
                                        <option>Hindi</option>
                                    </select>
                                </FormGroup> */}
                                
                                <FormGroup>
                                    <AvField type="select" name="genderSelect" onChange={this.handleTextChange('userGender')} 
                                    className="std-input" style={{width:'60%', height: '50px', padding: '10px'}} helpMessage="Enter your gender*">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </AvField>
                                </FormGroup>

                                <FormGroup>
                                    <AvField type="date" name="dobSelect" onChange={this.handleDate} required 
                                    className="std-input" style={{width:'60%', height: '50px', padding: '10px'}} helpMessage="Enter your Date of Birth*">
                                        
                                    </AvField>
                                </FormGroup>
                                
                                <div id="followUpGroup" className="follow-up-group">
                                <div style={(this.state.userUnderage) ? ({marginBottom: "1rem"}) : ({marginBottom: "2rem"})}>
                                    <div className="chiller_cb" style={{height: "50%", float: 'left'}}>
                                        <input id="myCheckbox1" type="checkbox" onChange={this.handleCheckboxChange('userUnderage')}/>
                                            <label for="myCheckbox1"> I am under age of 18. </label> 
                                            <span>
                                                {/* ::before
                                                ::after */}
                                            </span>
                                            <Modal isOpen={this.state.toggleUnderage} toggle={this.toggleUnderageModal}>
                                                <AvForm>
                                                <ModalHeader toggle={this.toggleUnderageModal}>User Underage Modal</ModalHeader>
                                                <ModalBody>
                                                
                                                    
                                                        {/* <Input type="text" name="gname" id="gname" placeholder="Enter Name" className="modal-inputs" onChange={this.handleTextChange('guardianName')}/> */}
                                                        
                                                            <AvField name="gname" className="modal-inputs" placeholder="Enter Name" validate={{
                                                                required: {value: true, errorMessage: 'Please enter a name'},
                                                                pattern: {value: '^[A-Za-z\\s]+$', errorMessage: 'Names can only contain letters'}
                                                            }} onChange={this.handleTextChange('guardianName')}/>
                                                        
                                                    
                                                        {/* <Input type="number" name="gphone" id="gphone" placeholder="Enter phone number" className="modal-inputs" onChange={this.handleTextChange('guardianPhone')}/> */}
                                                        
                                                            <AvField name="mobilenumber" type="number" className="modal-inputs" placeholder="Enter phone number" validate={{
                                                                    required: {value: true, errorMessage: 'Please enter a mobile number'},
                                                                    pattern: {value: '^[789]{1}[0-9]{9}$', errorMessage: 'Enter valid 10 digit mobile number'}
                                                                }} onChange={this.handleTextChange('guardianPhone')}/>   
                                                        
                                                    
                                                        {/* <Input type="text" name="grelation" id="grelation" placeholder="Relationship with you" className="modal-inputs" onChange={this.handleTextChange('guardianRelationship')}/> */}
                                                        
                                                            <AvField name="grelation" className="modal-inputs" placeholder="Relationship with you" validate={{
                                                                required: {value: true, errorMessage: 'Please enter a name'}
                                                            }} onChange={this.handleTextChange('guardianRelationship')}/>
                                                        
                                                    
                                                        {/* <Input type="email" name="gemail" id="gemail" placeholder="Enter E-mail" className="modal-inputs" onChange={this.handleTextChange('guardianEmail')}/> */}
                                                        
                                                            <AvField name="gemail" type="email" className="modal-inputs" placeholder="Enter E-mail" onChange={this.handleTextChange('guardianEmail')}/>
                                                        
                                                    
                                                        {/* <Input type="textarea" name="gaddress" id="gaddress" placeholder="Enter Address" className="modal-inputs" style={{display:'inline', width: '90%'}} onChange={this.handleTextChange('guardianAddress')}/> */}
                                                        
                                                            <AvField name="gaddress" type="textarea" className="modal-inputs" placeholder="Enter Address" style={{width: '90%'}} onChange={this.handleTextChange('guardianAddress')}/>
                                                        
                                                   
                                                    
                                                    
                                                </ModalBody>
                                                <ModalFooter>
                                                <Button type="submit" color="primary" onClick={this.toggleUnderageModal, this.saveGuardianData} disabled={!(this.state.guardianName && this.state.guardianPhone && this.state.guardianRelationship && this.state.guardianEmail && this.state.guardianAddress)}>Submit Guardian Data</Button>{' '}
                                                <Button color="secondary" onClick={this.toggleUnderageModal}>Cancel</Button>
                                                </ModalFooter>
                                                </AvForm>
                                        </Modal>
                                    </div>
                                </div>
                                {
                                    (this.state.userUnderage) ? 
                                    ((!this.state.guardianDataFilled) ? (<p onClick={this.toggleUnderageModal} style={{textDecoration: 'underline', color:'blue', float: 'right', marginTop: "1rem", cursor: 'pointer'}}>Please finish entering guardian data.</p>) :
                                    (<p onClick={this.toggleUnderageModal} style={{textDecoration: 'underline', color:'green', float: 'right', marginTop: "1rem", cursor: 'pointer'}}>To edit guardian data, click here.</p>)
                                    ) 
                                    : (<p></p>)
                                }
                                
                                <FormGroup>
                                    <div className="chiller_cb long" style={{height: '50%', float: 'left'}}>
                                        <input id="myCheckbox2" type="checkbox" onChange={this.handleCheckboxChange('userAgree')}/>
                                        <label for="myCheckbox2">I agree with all </label>
                                        
                                        <span>
                                                     
                                                {/* ::before
                                                ::after */}
                                            </span>
                                    </div>
                                            <span onClick={this.toggleConditionModal}>
                                                <span> &nbsp; </span>
                                                <label for="myCheckbox2" style={{cursor : 'pointer', textDecoration:'underline', color: 'blue'}}> telemedicine conditions</label>
                                            </span> 
                                                
                                            <Modal isOpen={this.state.toggleCondition} toggle={this.toggleConditionModal}>
                                                <ModalHeader toggle={this.toggleConditionModal}>Teleconsultancy Conditions</ModalHeader>
                                                <ModalBody>
                                                <p>I hereby agree and hence give consent that my personal health information may be shared for referral purposes as well as for Medical Insurance purposes. (reimbursement or cashless). It is understood and agreed that the medical information will not be shared with dispensing chemists or drug manufacturers, apart from working diagnosis and prescription part. I also hereby consent to use my clinical information for data collection, research, scientific publication, advertising and surveys without disclosing my identity in any manner and without breach of confidentiality. I have understood the implications of such partial or full disclosure of my information to other agencies, which is required in my own interest. While sharing the information to next caregiver or referral, Dr. {this.state.doctorName} has laid down the same standards of confidentiality, but in case of any breach by them, we will not hold Dr. {this.state.doctorName} liable in any manner. *ln case of children or insane person, consent provided by Dr. {this.state.doctorName} parent/guardian user. </p>
                                                <p><b>Please Note:</b></p>
                                                <p>
                                                Online/phone consultation is not a substitute for physical/in-person consultation. Your doctors response may be delayed and is dependant on their availability. Please visit your hospital or nearest medical centre if you need immediate or urgent help. 
                                                </p>
                                                </ModalBody>
                                                <ModalFooter>
                                                <Button color="primary" onClick={this.toggleConditionModal}>Okay</Button>
                                                </ModalFooter>
                                            </Modal>
                                </FormGroup>
                                </div>

                                <div style={{paddingBottom: '1vh'}}>
                                {
                                    (!this.state.communicationMode) ? (<p onClick={this.toggleCommunicationModeModal} style={{textDecoration: 'underline', color:'blue', marginTop: "1rem", cursor: 'pointer'}}>Please configure your mode of communication{' '}<sup style={{color:'red'}}>(required)</sup></p>) :
                                    (<p onClick={this.toggleCommunicationModeModal} style={{textDecoration: 'underline', color:'green', marginTop: "1rem", cursor: 'pointer'}}>Click to edit your mode of communication</p>)
                                }
                                    
                                </div>
                                
                                <FormGroup style={{paddingBottom: '1vh'}}>
                                    <Button 
                                        className={`${(this.state.userName && this.state.userPhone && this.state.userGender && this.state.userBirthdate && this.state.userAgree && this.state.communicationMode && !(this.state.communicationMode=="WhatsApp" && !this.state.userWhatsapp) && !(this.state.userUnderage && !(this.state.guardianDataFilled))) ? "std-button" : "std-button-disabled"}`}
                                        disabled={!(this.state.userName && this.state.userPhone && this.state.userGender && this.state.userBirthdate && this.state.userAgree && this.state.communicationMode && !(this.state.communicationMode=="WhatsApp" && !this.state.userWhatsapp) && !(this.state.userUnderage && !(this.state.guardianDataFilled)))}
                                    > 
                                        Register 
                                    </Button>
                                    
                                </FormGroup>
                                <div id="errors-in-form"></div>
                                </AvForm>
                                <hr/>
                                <p>
                                    If you are already registered patient, please click on the Login for consultation
                                </p>
                                <div className="form-group">
                                    <Link to={`/${this.state.handleDocId}/`}>
                                        <button className="std-button">
                                            Login
                                        </button>
                                    </Link>
                                </div>
                            
                            <span className={`${(!this.state.toggleSwitch) ? "toggle-button-regi" : "toggle-button-rotate"}`} onClick={this.handleToggleArrow.bind(this)}>
                            
                            </span>
                        </div>
                    </div>

                </div>
                {
                    (this.state.userLoggedInFromRegister) ? (
                        <Redirect push to={{
                            pathname : `/${this.state.handleDocId}/`,
                            state : {
                                userLoggedInFromRegister : this.state.userLoggedInFromRegister,
                            }
                        }}/>
                    ) : (<div></div>)
                }
            </div>
            </div> 
            <Modal isOpen={this.state.communicationModeModal} toggle={this.toggleCommunicationModeModal}>
                <AvForm onValidSubmit={this.toggleCommunicationModeModal} onInvalidSubmit ={this.handleInvalidWhatsapp}>
                <ModalHeader toggle={this.toggleCommunicationModeModal}>Mode of Communication</ModalHeader>
                    <ModalBody>
                        <div>
                            <p style={{fontWeight: 'bold'}}>Please select your mode of communication.</p>
                            <p>How do you want the doctor to interact with you? (By selecting any of the following options, you consent to a verified doctor communicating with you by the respective mode of communication during Offline teleconsultations, in order to better understand your medical ailments, or to give you general teleconsultancy cycle updates or medical advice.)</p>
                            <div style={{display: 'flex', justifyContent:'center', marginTop: '4vh'}}>
                                <div class="chiller_cb">
                                    <input id={`modeOfCommCheckbox1`} type="radio" name={`modeOfComm`} value={"SMS"} onChange={this.handleTextChange(`communicationMode`)}/>
                                    <label for={`modeOfCommCheckbox1`}>SMS</label>
                                    <span></span>
                                </div>
                            
                                <div class="chiller_cb">
                                    <input id={`modeOfCommCheckbox2`} type="radio" name={`modeOfComm`} value={"WhatsApp"} onChange={this.handleTextChange(`communicationMode`)}/>
                                    <label for={`modeOfCommCheckbox2`}>WhatsApp</label>
                                    <span></span>
                                </div>
                                
                            </div>
                            <div style={{display: 'flex', justifyContent:'center', marginTop: '4vh'}}>
                                {
                                    (this.state.communicationMode == "WhatsApp") ? (
                                        
                                        <div style={{width:'100%', textAlign:'center'}}>
                                            <FormGroup>
                                                <AvField name="whatsappnumber" className="std-input" placeholder="Enter your whatsapp number" validate={{
                                                    required: {value: true, errorMessage: 'Please enter a whatsapp number'},
                                                    pattern: {value: '^[789]{1}[0-9]{9}$', errorMessage: 'Enter valid 10 digit whatsapp number'},
                                                }} style={{width:'70%'}} onChange={this.handleTextChange('userWhatsapp')}/>
                                            </FormGroup>                            
                                            <p style={{marginTop:'1vh'}} id="number-invalid"></p>                   
                                        </div>

                                    ) : (<div></div>)
                                }
                            </div>
                        </div>
                    </ModalBody>
                <ModalFooter>
                    <FormGroup>
                        <Button color="primary">Okay</Button>
                    </FormGroup>
                </ModalFooter>
                </AvForm>
            </Modal>
            
        </body>
    );

}
}

export default Register;