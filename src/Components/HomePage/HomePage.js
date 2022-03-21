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
        privacyPolicyModal : false,
        termsModal : false,
        cancellationRefundModal: false,
        goToDoctor: false,
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
  
}

togglePrivacyPolicyModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            privacyPolicyModal: !prevState.privacyPolicyModal,
        }
    });
}

toggleTermsModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            termsModal: !prevState.termsModal,
        }
    });
}

toggleCancellationRefundModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            cancellationRefundModal: !prevState.cancellationRefundModal,
        }
    });
}

toggleButton = () => {
    this.setState({goToDoctor: true});
}

render() {
  return (
    <body className="landingBody">
    <div className="wrapper">
    <div className="container-fluid">

        <div className="row" style={{alignContent:'center', height: '100vh'}}>
            <div className="col-md-6 col-sm-7 col-xs-12 landingIntro">
                <div className="landingLeftBox">
                    <div className="landingWelcome">
                        <p className="landingHeading" style={{marginLeft:'1.0rem'}}>
                            Teleconsultancy Application
                        </p>
                    </div>
                    <div>
                        <p className="landingSubheading" style={{marginLeft:'1.0rem', marginRight:'1.0rem'}}>
                            We are on a mission to make quality healthcare affordable and accessible for a billion Indians. We empower people with the information and care that they can trust to make better healthcare decisions every day.
                        </p>
                    </div>

                     <hr style={{marginTop:'2.0rem', borderColor: 'white'}}/>

                     <div className="landingInfoPage">
                        <div>
                            <p className="landingHeading" style={{fontSize:22, margin:0}}>Learn more about us</p>
                        </div>
                        <div style={{display:'flex', flexDirection:'row', width:'100%', flexWrap: 'wrap'}}>
                            <div className="col-md-6 col-sm-12 col-xs-12" style={{padding:0, paddingLeft:'1.0rem', paddingRight:'1.0rem', paddingTop:'1.6rem'}}>
                                <p className="landingSubheading" style={{textAlign:"left", margin: 0}}>
                                    <span className="links" onClick={this.togglePrivacyPolicyModal}>Privacy Policy</span>
                                </p>
                                
                                <p className="landingSubheading" style={{textAlign:"left", margin: 0}}>
                                    <span className="links" onClick={this.toggleTermsModal}>Terms {"&"} Conditions</span>
                                </p>
                                
                                <p className="landingSubheading" style={{textAlign:"left", margin: 0}}>
                                    <span className="links" onClick={this.toggleCancellationRefundModal}>Refunds and Cancellations</span>
                                </p>
                            </div>
                            <div className="col-md-6 col-sm-12 col-xs-12" style={{marginTop:'1.2rem', padding: 0, paddingLeft:'1.0rem', paddingRight:'1.0rem'}}>
                                <p className="landingSubheading" style={{textAlign:"left", fontWeight:600, fontSize:18, margin: 0}}>
                                    Contact Us:
                                </p>
                                <p className="landingSubheading" style={{textAlign:"left", margin: 0}}>
                                    sanjayathavale@mobilesurta.com
                                </p>
                                <p className="landingSubheading" style={{textAlign:"left", margin: 0}}>
                                    B-2, Patil Gardens, Kothrud, Pune
                                </p>
                            </div>
                        </div>

                        <Modal isOpen={this.state.privacyPolicyModal} toggle={this.togglePrivacyPolicyModal}>
                            <ModalHeader toggle={this.togglePrivacyPolicyModal}>Privacy Statement</ModalHeader>
                            <ModalBody>
                            <p>
                            <b>SECTION 1 - WHAT DO WE DO WITH YOUR INFORMATION?</b>
                            <p> When you purchase our services, as part of the purchasing process, we collect the personal information you give us such as your name, address and email address. When you browse our store, we also automatically receive your computer’s internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system. Email marketing (if applicable): With your permission, we may send you emails about our store, new products and other updates. </p>
                            
                            <br/>
                            <b>SECTION 2 - CONSENT</b>
                            <p>How do you get my consent? When you provide us with personal information to complete a transaction, verify your credit card, place an order, we imply that you consent to our collecting it and using it for that specific reason only. If we ask for your personal information for a secondary reason, like marketing, we will either ask you directly for your expressed consent, or provide you with an opportunity to say no.</p>
                            
                            <br/>
                            <b>How do I withdraw my consent?</b>
                            <p>If after you opt-in, you change your mind, you may withdraw your consent for us to contact you, for the continued collection, use or disclosure of your information, at anytime, by contacting us at sanjayathavale@mobilesurta.com or mailing us at: B-6, Patil Gardens, Tejas Nagar, Kothrud Pune, India 411038</p>

                            <br/>
                            <b>SECTION 3 - DISCLOSURE</b>
                            <p>We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.</p>

                            <br/>
                            <b>SECTION 4 - PAYMENT</b>
                            <p>We use Razorpay for processing payments. We/Razorpay do not store your card data on their servers. The data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) when processing payment. Your purchase transaction data is only used as long as is necessary to complete your purchase transaction. After that is complete, your purchase transaction information is not saved.</p>

                            <br/>
                            <b>SECTION 4 - PAYMENT</b>
                            <p>We use Razorpay for processing payments. We/Razorpay do not store your card data on their servers. The data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) when processing payment. Your purchase transaction data is only used as long as is necessary to complete your purchase transaction. After that is complete, your purchase transaction information is not saved. Our payment gateway adheres to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, MasterCard, American Express and Discover. PCI-DSS requirements help ensure the secure handling of credit card information by our store and its service providers. For more insight, you may also want to read terms and conditions of razorpay on https://razorpay.com/.</p>

                            <br/>

                            <b>SECTION 5 - THIRD-PARTY SERVICES</b>
                            <p>In general, the third-party providers used by us will only collect, use and disclose your information to the extent necessary to allow them to perform the services they provide to us. However, certain third-party service providers, such as payment gateways and other payment transaction processors, have their own privacy policies in respect to the information we are required to provide to them for your purchase-related transactions. For these providers, we recommend that you read their privacy policies so you can understand the manner in which your personal information will be handled by these providers. In particular, remember that certain providers may be located in or have facilities that are located a different jurisdiction than either you or us. So if you elect to proceed with a transaction that involves the services of a third-party service provider, then your information may become subject to the laws of the jurisdiction(s) in which that service provider or its facilities are located. Once you leave our store’s website or are redirected to a third-party website or application, you are no longer governed by this Privacy Policy or our website’s Terms of Service. When you click on links on our store, they may direct you away from our site. We are not responsible for the privacy practices of other sites and encourage you to read their privacy statements.</p>

                            <br/>

                            <b>SECTION 6 - SECURITY</b>
                            <p>To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered or destroyed.</p>

                            <br/>

                            <b>SECTION 7 - COOKIES</b>
                            <p>We use cookies to maintain session of your user. It is not used to personally identify you on other websites.</p>

                            <br/>

                            <b>SECTION 8 - AGE OF CONSENT</b>
                            <p>By using this site, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.</p>

                            <br/>

                            <b>SECTION 9 - CHANGES TO THIS PRIVACY POLICY</b>
                            <p>We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you here that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it. If our store is acquired or merged with another company, your information may be transferred to the new owners so that we may continue to sell our services to you.</p>

                            <br/>

                            <b>QUESTIONS AND CONTACT INFORMATION</b>
                            <p>If you would like to: access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information contact our Privacy Compliance Officer at sanjayathavale@mobilesutra.com or by mail at B-6, Patil Gardens, Tejas Nagar, Kothrud Pune, India 411038</p>
                            <p>Sanjay Athavale</p>
                            <p>B-6, Patil Gardens, Tejas Nagar, Kothrud Pune, India 411038</p>
                            
                            </p>
                            </ModalBody>
                            <ModalFooter>
                            <Button color="primary" onClick={this.togglePrivacyPolicyModal}>Okay</Button>
                            </ModalFooter>
                        </Modal>

                        <Modal isOpen={this.state.termsModal} toggle={this.toggleTermsModal}>
                            <ModalHeader toggle={this.toggleTermsModal}>Teleconsultancy Conditions</ModalHeader>
                            <ModalBody>
                            <p>I hereby agree and hence give consent that my personal health information may be shared for referral purposes as well as for Medical Insurance purposes. (reimbursement or cashless). It is understood and agreed that the medical information will not be shared with dispensing chemists or drug manufacturers, apart from working diagnosis and prescription part. I also hereby consent to use my clinical information for data collection, research, scientific publication, advertising and surveys without disclosing my identity in any manner and without breach of confidentiality. I have understood the implications of such partial or full disclosure of my information to other agencies, which is required in my own interest. While sharing the information to next caregiver or referral, the doctors have laid down the same standards of confidentiality, but in case of any breach by them, we will not hold any doctor liable in any manner. *ln case of children or insane person, consent provided by the patient's parent/guardian user. </p>
                            <p><b>Please Note:</b></p>
                            <p>
                            Online/phone consultation is not a substitute for physical/in-person consultation. Your doctors response may be delayed and is dependant on their availability. Please visit your hospital or nearest medical centre if you need immediate or urgent help. 
                            </p>
                            </ModalBody>
                            <ModalFooter>
                            <Button color="primary" onClick={this.toggleTermsModal}>Okay</Button>
                            </ModalFooter>
                        </Modal>
                        
                        <Modal isOpen={this.state.cancellationRefundModal} toggle={this.toggleCancellationRefundModal}>
                            <ModalHeader toggle={this.toggleCancellationRefundModal}>Cancellation Policy</ModalHeader>
                            <ModalBody>
                            <p>Currently, we do not provide a functionality to cancel booked appointments, but do provide a functionality to re-schedule these appointments, until before 1 day before the date of appointment, in the case of Online Appointments.</p>
                            <p>Hence, there would be strictly no refunds, in regards to the transactions undertaken in the appointment booking process.</p>
                            </ModalBody>
                            <ModalFooter>
                            <Button color="primary" onClick={this.toggleCancellationRefundModal}>Okay</Button>
                            </ModalFooter>
                        </Modal>

                        <div style={{textAlign:'center', marginTop: '2.0rem'}}>
                                <Button color="success" className="landingButton" onClick={this.toggleButton}> 
                                    Jump to Doctor
                                </Button>
                        </div>
                     </div>
                     {
                    (this.state.goToDoctor) ? (
                        <Redirect push
                            to={{
                                pathname: `/9767427053/`,
                            }} />
                    ) : (<div></div>)
                    }
                     
                
                </div>
            </div>
        </div>

    {/* {
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
                          <div className="prof
                          ile-box">
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

          
            
                  <div className="form-group">
                    {
                      (!this.state.userLoggedIn) ? (
                        
                          (!this.state.userVerified) ? 
                          ( <div>
                              <div style={{display: 'flex', justifyContent:'center'}}>
                                <input type="text" 
                                  pattern="\d*"
                                  name="phone number" 
                                  className="std-input" 
                                  placeholder="Enter Your Phone Number" 
                                  onChange={this.handleTextChange('userPhone')}/> 
                                  {
                                    (this.state.isVerifying) ? (<Spinner style={{margin: "1.3% 3%", width:"2rem", height:"2rem"}}color="dark" />) : (<div></div>)
                                  }
                              </div>
                            <p id="patient-not-found"></p> 
                          </div>) : 
                          (<div> <input type="text" 
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
                                      
                                    </div>   
                                  </div>
                                </div>
                                
                                       

                                <div className="chiller_cb long">
                                    <input id="myAgreeCheckbox" type="checkbox" onChange={this.toggleUserDependentAgree}/>
                                    <label for="myAgreeCheckbox" style={{marginRight:'1rem'}}>I agree to take responsibility of all my dependents' actions, and agree to pose as guardian to these dependents if any one (but not limited to one) is under the legal age of 18.</label>
                                    <span>   
                                       
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
            </div>
        </div>
      )
    } */}
        
       
    </div> 
    </div>
    </body>
  );
}
}

export default Login;