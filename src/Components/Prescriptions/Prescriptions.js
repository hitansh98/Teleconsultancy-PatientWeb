import React, { Component } from 'react';
import {Redirect, Link} from 'react-router-dom';
import { Modal, Input, ModalBody, ModalHeader, ModalFooter, Button,Form, FormGroup, Label, FormText,
    Collapse,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink,
    NavbarText,
    UncontrolledDropdown, 
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Badge } from 'reactstrap';

import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'

import firebase from '../../Services/firebase';
import moment from 'moment';

import Loader from '../../Assets/Loader/Loader';

import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;     

class Prescription extends Component {
constructor(props) {
    super(props);
    this.state = {
        doctorId: this.props.match.params.handle, 
        prescription: [],
        isFetching: false,
        paymentModalOpen : false,
        pdfPaymentOpenModal: false,
        pdfNonPaymentOpenModal: false,
        preDetailsData:[],
        prescriptionList:[],
        prescriptionTrue:[],
        prescriptionFalse:[],
        prescriptionListTrue:[],
        prescriptionListFalse:[],
        appointmentData : {},
        numPages : null,
        pageNumber : 1,
        sessionExpired: false,
        emptyData: false,
        privacyPolicyModal : false,
        termsModal : false,
        cancellationRefundModal: false,
        receiptOpenModal: false,
     };
}

componentDidMount = async() => {
    this.setState({ isFetching: true});

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);

    await this.setValuesFromLocalStorage();
    await this.getValueFromSessionStorage();

    let dbDoctors = firebase.database().ref(`doctors/${this.state.doctorId}/name`);

    await dbDoctors.once("value", (snap) =>{
        // console.log(snap.val());
        this.setState({ doctorName : snap.val()});
    });

//    let dbrefPrescription = firebase.database().ref(`/prescriptions/PRSCTN-8529469097-9767427053-150520-030000-d00`);
    let dbrefPrescription = firebase.database().ref(`prescriptions`);
    dbrefPrescription.orderByChild("patientId").equalTo(this.state.userId).on("value", async(snap) => {
        //working--
        console.log(snap.val());
        if(snap.val()!=null){
            console.log(snap.val());
            this.setState({ prescription : [] });
            snap.forEach(snap => {
                if(snap.val().doctorId == this.state.doctorId){
                    this.state.prescription.push(snap.val())   
                }
                console.log(this.state.prescription);
            })
            this.setState({
                prescriptionList: this.state.prescription
            })
            
            await this.setState({ emptyData: false});
        }
        else{
            console.log("entered alterer");
            await this.setState({ emptyData: true});
        }
        
        //--working
        
        
        
    console.log("prescription",this.state.prescription);
    console.log("prescriptionList",this.state.prescriptionList);
  });

    let dbRefAppoint = firebase.database().ref(`appointments`);
    await dbRefAppoint.orderByChild("patientId").equalTo(this.state.userId).on("value", async(s) => {
        let data = s.val();    
        console.log(data);
        if(data){
            let disKeys = Object.keys(data);
            let appointmentObj = {};
            for(let i=0;i<disKeys.length;i++){
                if(data[disKeys[i]]["doctorId"] == this.state.doctorId){
                    appointmentObj[disKeys[i]] = data[disKeys[i]];
                }
            }
            console.log(appointmentObj);
            await this.setState({ appointmentObj });
            await this.setState({ emptyData: false});
            await this.setState({ isFetching: false });
        }
        else{
            await this.setState({ emptyData: true});
            await this.setState({ isFetching: false });
        }
        
    });



}

componentDidUpdate = async() => {
    await this.getValueFromSessionStorage();
}


getValueFromSessionStorage = async() => {
    const sT = sessionStorage.getItem('loginTimestamp');
    // console.log(sT);
    // console.log("i check for session expiry");
    if(!sT){
        await this.setState({ sessionExpired: true})
        localStorage.removeItem('doctorId');
    }
    else{
        let dateNowMoment = moment(new Date());
        let timestampMoment = moment(parseInt(sT));
        let addedMoment = timestampMoment.add(30, 'm');
        // console.log(dateNowMoment);
        // console.log(timestampMoment);
        // console.log(addedMoment);
        if(addedMoment.isBefore(dateNowMoment)){
            await this.setState({ sessionExpired: true});
            localStorage.removeItem('doctorId');
        }
        else{
            sessionStorage.setItem('sessionTimestamp', dateNowMoment);
        }
    }
}

setValuesFromLocalStorage = () => {
    const uI = localStorage.getItem('userId');
    const udn = localStorage.getItem('userDependentName');
    const udi = localStorage.getItem('userDependentId');
    const udr = localStorage.getItem('userDependentRelation');
    const dpan = localStorage.getItem('doctorPaymentAlternativeOnline');
    const dpaf = localStorage.getItem('doctorPaymentAlternativeOffline');

    this.setState({userId: uI});
    this.setState({ dependentInfo: {
        name : udn,
        id: udi,
        relation: udr,
    }});

    this.setState({doctorPaymentAlternativeOnline : dpan});
    this.setState({doctorPaymentAlternativeOffline : dpaf});
    return;
}

fetchAppointmentDetails = async(aId) => {
    this.setState({ isFetching : true });
    let dbref= firebase.database().ref(`appointments/${aId}`);
    await dbref.once("value", (snap) => {
        let data= snap.val();
        console.log(data);
        this.setState({ appointmentData : data });
        this.setState({ isFetching: false });
        this.togglePaymentModal();
    });
}

fetchReceiptDetails = async(aId, pObj) => {
    this.setState({ isFetching : true });
    let dbref= firebase.database().ref(`appointments/${aId}`);
    await dbref.once("value", (snap) => {
        let data= snap.val();
        console.log(data);
        this.setState({ appointmentData : data });
        if(pObj.reciepturl){
            this.setState({ receiptUrl: pObj.reciepturl });
        }
        this.setState({ hasPaid : data.hasPaid })
        this.setState({ isFetching: false });
        if(data.hasPaid){
            this.toggleReceiptOpenModal();
        }
    });
}

fetchAppointmentDetails2 = async(aId, pObj) => {
    this.setState({ isFetching : true });
    let dbref= firebase.database().ref(`appointments/${aId}`);
    await dbref.once("value", (snap) => {
        let data= snap.val();
        console.log(data);
        this.setState({ appointmentData : data });
        if(pObj.reciepturl){
            this.setState({ receiptUrl: pObj.reciepturl });
        }
        this.setState({ pdfLink : pObj.printableFile });
        this.setState({ hasPaid : data.hasPaid })
        this.setState({ isFetching: false });
        if(data.hasPaid){
            this.togglePdfNonPaymentOpenModal();
        }
        else{
            this.togglePdfPaymentOpenModal();
        }
    });
}


handlePaymentClick = async() => {
    const dateNow = new Date();

    var options = {year: '2-digit', month: '2-digit', day: '2-digit' };

    ////////////////////////////////////////

    let formatNowDate = dateNow.toLocaleDateString("en-GB", options);
    let formatNowDate1 = formatNowDate.replace(/\//g,"");
    let formatNowDate2 = formatNowDate.replace(/\//g,".");

    let formatNowTime = dateNow.toLocaleTimeString('en-US');
    let momNowTime = moment(dateNow);
    let momNowTimeFormat = momNowTime.format('LT');
    let formatNowTime1 = momNowTimeFormat.replace(/\s/g ,"");
    let formatNowTime2 = momNowTimeFormat.replace(/\s/g ," ");

    let paymentStr = "PYMT-"+this.state.userId+"-"+this.state.doctorId+"-"+formatNowDate1+"-"+formatNowTime1;
    let prescriptionStr = "PRSCTN-"+this.state.appointmentData["id"].substring(6);

    let appmtStr = this.state.appointmentData["id"];

    var updates = {};

    var options = {
        "key": "", // Enter the Key ID generated from the Dashboard
        "amount": parseInt(this.state.appointmentData["fee"])*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": this.state.doctorName,
        "description": "Payment for Prescription",
        "image": "data:image/png;base64,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",
        // "order_id": `${this.state.paymentStr}`, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": async(response) => {
            let updates={};
            updates[`payments/${paymentStr}/paymentIdRP`] = response.razorpay_payment_id;
            updates[`prescriptions/${prescriptionStr}/hasPaid`] = true;
            updates[`prescriptions/${prescriptionStr}/recieptId`] = paymentStr;
            updates[`appointments/${appmtStr}/hasPaid`] = true;
            await firebase.database().ref().update(updates);
            this.setState({ razorPayResp : response.razorpay_payment_id });
            this.setState({hasPaid: true});
            this.togglePaymentModal();
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#4be4ac"
        }
    };

    let paymentObj = {
        "amount" : this.state.appointmentData["fee"],
        "appointmentId" : this.state.appointmentData["id"],
        "date" : formatNowDate2,
        "doctorId" : this.state.doctorId,
        "dependentInfo" : this.state.dependentInfo,
        "id" : paymentStr,
        "patientId" : this.state.userId,
        "time" : formatNowTime2,
        "type" : "Prescription Payment"
    }

    updates[`payments/${paymentStr}`] = paymentObj;
    
    var rzp1 = new window.Razorpay(options);
    await rzp1.open();
}

togglePaymentModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            paymentModalOpen: !prevState.paymentModalOpen,
        }
    });
}

togglePdfPaymentOpenModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            pdfPaymentOpenModal: !prevState.pdfPaymentOpenModal,
        }
    });
}

togglePdfNonPaymentOpenModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            pdfNonPaymentOpenModal: !prevState.pdfNonPaymentOpenModal,
        }
    });  
}

toggleReceiptOpenModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            receiptOpenModal: !prevState.receiptOpenModal,
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




render() {

    
    let preDetailsData = this.state.prescriptionList.map((prescriptionListElement,index) => {
        
            return (
            <Tr key={prescriptionListElement.id}>
                <Td className="td">{prescriptionListElement.date}</Td>
                <Td className="td">{prescriptionListElement.dependentInfo.name}</Td>
                <Td className="td">{prescriptionListElement.mode}</Td>
                
                {
                    (this.state.appointmentObj) ? (
                        
                        <Td className="td">
                            {this.state.appointmentObj[prescriptionListElement.appointmentId]["visitType"]}
                            {console.log(this.state.appointmentObj)}
                            {console.log(prescriptionListElement.appointmentId)}
                            {console.log(this.state.appointmentObj[prescriptionListElement.appointmentId])}
                            {console.log(this.state.appointmentObj[prescriptionListElement.appointmentId]["visitType"])}
                        </Td>
                    ) : (
                        <Td className="td"></Td>
                    )
                }

                {
                    (this.state.appointmentObj) ? (
                        
                        <Td className="td">
                            {this.state.appointmentObj[prescriptionListElement.appointmentId]["fee"]}
                        </Td>
                    ) : (
                        <Td className="td"></Td>
                    )
                }
                
                

                <Td className="td">
                    <button className="std-button" style={{height: 30}} onClick={this.fetchAppointmentDetails2.bind(this, prescriptionListElement.appointmentId, prescriptionListElement)}>
                        View
                    </button>
                </Td>
                {/* <td className="td">{
                     (prescriptionListElement.hasPaid) ? (
                        <a href={prescriptionListElement.printableFile} target="_blank">Download</a>
                     ) : (
                        <button className="std-button" style={{height: 30}} onClick={this.fetchAppointmentDetails2.bind(this, prescriptionListElement.appointmentId, prescriptionListElement)}>
                            Pay to Download
                        </button>
                     )
                     }
                </td> */}
                {
                    (this.state.receiptUrl) ? (
                        <Td>
                            <button className="std-button" style={{height: 30}} onClick={this.fetchReceiptDetails.bind(this, prescriptionListElement.appointmentId, prescriptionListElement)}>
                                View
                            </button>
                        </Td>
                    ) : (
                        <Td>
                            <p>N/A</p>
                        </Td>
                    )

                }
            </Tr> 
            )
    });
      


    return (
      
       <body className="body">
            <div className="wrapper">
             <div className="container-fluid">
                 <Navbar dark expand="md" style={{backgroundColor:"#4be4ac"}}>
                    <NavbarBrand href={`/${this.state.doctorId}/`} style={{ color:'#ffffff', fontWeight:'600'}}>Teleconsultancy - Dr. {this.state.doctorName}</NavbarBrand>
                    <NavbarToggler onClick={this.toggleNavbar} />
                    <Collapse isOpen={this.state.isNavbarOpen} navbar>
                    <Nav className="mr-auto" navbar>
                        <NavItem>
                        <NavLink style={{color:'#ffffff'}} href={`/${this.state.doctorId}/Appointments`}>My Appointments</NavLink>
                        </NavItem>
                        <NavItem>
                        <NavLink style={{color:'#ffffff'}} href={`/${this.state.doctorId}/Prescriptions`}>My Prescriptions</NavLink>
                        </NavItem>
                        <UncontrolledDropdown nav inNavbar>
                            <DropdownToggle color="success" style={{color:'#ffffff'}} nav caret>
                                Important Info <Badge color="danger">3</Badge>
                            </DropdownToggle>
                            <DropdownMenu className="bg-nav" right>
                                <DropdownItem className="bg-nav-option" style={{color:'#fff'}} onClick={this.togglePrivacyPolicyModal}> 
                                    Privacy Policy
                                </DropdownItem>
                                <DropdownItem className="bg-nav-option" style={{color:'#fff'}} onClick={this.toggleTermsModal}>
                                    Terms and Conditions
                                </DropdownItem>
                                <DropdownItem className="bg-nav-option" style={{color:'#fff'}} onClick={this.toggleCancellationRefundModal}>
                                    Refund Policy
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                        <NavItem>
                            <Link to={{pathname:`/${this.state.doctorId}/`}}>
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
                                pathname: `/${this.state.doctorId}/`,
                            }} />
                        </div>
                    ) : (<div></div>)
                }  
                <div className="row">

                        {
                            (this.state.isFetching) ? (<Loader loading={this.state.isFetching}/>) : (
                                <div className=" col-md-12 col-sm-12 col-xs-12 Consultancy-box margin-box-table">
                                    <text className="Prescription-heading-title">
                                        Prescription Received
                                    </text>
                                    <br/>
                                    <br/>
                                    {
                                        
                                        (this.state.emptyData) ? (
                                            
                                            <div style={{display:'flex', flexDirection:'row', width:'100%', height:'100%', alignContent:'center', justifyContent:'center'}}>
                                                {console.log(this.state.emptyData)}
                                                <text style={{fontWeight:'300', fontSize:24, textAlign:'center'}}>You do not currently have any prescriptions!</text>
                                            </div>
                                        ) : (
                                            <Table className="table">
                                                {console.log(this.state.emptyData)}
                                        <Thead className="Prescription-heading">
                                            <Tr>
                                                <Th className="th" scope="col"> Date </Th>
                                                <Th className="th" scope="col"> Patient Name </Th>
                                                <Th className="th" scope="col"> Mode </Th>
                                                <Th className="th" scope="col"> Type </Th>
                                                <Th className="th" scope="col"> Fee </Th>
                                                <Th className="th" scope="col"> Prescription </Th>
                                                <Th className="th" scope="col"> Receipt </Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {preDetailsData}
                                        </Tbody>
                                    </Table>
                                        )
                                    }
                                    
                                </div>
                            )
                        }

                    
                </div>
                        <Modal isOpen={this.state.paymentModalOpen} toggle={this.togglePaymentModal}>
                            <ModalHeader toggle={this.togglePaymentModal}>Online Consultancy Payment</ModalHeader>
                            <ModalBody>
                                {
                                    (this.state.appointmentData) ? (
                                        <div>
                                            <p>
                                                {
                                                    (this.state.appointmentData["dependentInfo"]) ? (
                                                        <div>
                                                            <b> Patient Name: </b> <span>{this.state.appointmentData["dependentInfo"]["name"]}</span>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <b> Patient Name: </b> <span>{this.state.appointmentData["name"]}</span>
                                                        </div>
                                                    )
                                                }
                                                
                                            </p>
                                            <hr/>
                                            <p>
                                                <b> Appointment Mode: </b> {this.state.appointmentData["mode"]}
                                            </p>
                                            <hr/>
                                            <p>
                                                <b> Appointment Details: </b> {this.state.appointmentData["date"]+" "+this.state.appointmentData["timeBegin"]}
                                            </p>
                                            <hr/>
                                            <p>
                                                <b> Appointment Fees: </b> {this.state.appointmentData["fee"]}
                                            </p>
                                        </div>
                                    ) : (<div></div>)
                                }
                                
                            </ModalBody>
                            <ModalFooter>
                                <Button color="secondary" onClick={this.togglePaymentModal}>Cancel</Button>
                                <Button color="primary" onClick={this.handlePaymentClick}>Pay Now</Button>
                            </ModalFooter>
                        </Modal>   

                        <Modal isOpen={this.state.pdfPaymentOpenModal} toggle={this.togglePdfPaymentOpenModal}>
                            <div style={{display:'flex'}}>
                                <div style={{}} class={`${(this.state.hasPaid) ? "hideButton" : "showPrescriptionButton"}`}>
                                    <button style={{border: '0.75px solid black'}} className="std-button" onClick={this.togglePaymentModal}>
                                        Pay to View
                                    </button>
                                </div>
                                <div style={{display:'flex', position: 'absolute', textAlign: 'center', width:"100%", alignSelf:'flex-end', justifyContent:'center', paddingBottom:'2vh'}} className={`showButton`}>
                                    <Button style={{border: '0.75px solid black', alignSelf:'flex-end'}} color="danger" onClick={this.togglePdfPaymentOpenModal}>
                                        Close
                                    </Button>
                                </div>
                                <div style={{height: '80vh', width:'100%'}} className={` ${this.state.hasPaid ? '' : 'blurEffectCalendar'}`}>
                                    {console.log(this.state.pdfLink)}
                                    <iframe style={{width:'100%', height:'100%'}} src={this.state.pdfLink} />
                                </div>
                            </div>
                        </Modal>
                        <Modal isOpen={this.state.pdfNonPaymentOpenModal} toggle={this.togglePdfNonPaymentOpenModal}>
                            <div style={{display:'flex'}}>
                                <div style={{display:'flex', position: 'absolute', textAlign: 'center', width:"100%", alignSelf:'flex-end', justifyContent:'center', paddingBottom:'2vh'}} className={`showButton`}>
                                    <Button style={{border: '0.75px solid black', alignSelf:'flex-end'}} color="danger" onClick={this.togglePdfNonPaymentOpenModal}>
                                        Close
                                    </Button>
                                </div>
                                <div style={{height: '80vh', width:'100%'}} className={` ${this.state.hasPaid ? '' : 'blurEffectCalendar'}`}>
                                    {console.log(this.state.pdfLink)}
                                    <iframe style={{width:'100%', height:'100%'}} src={this.state.pdfLink} />
                                </div>
                            </div>
                        </Modal>

                        <Modal isOpen={this.state.receiptOpenModal} toggle={this.toggleReceiptOpenModal}>
                            <div style={{display:'flex'}}>
                                <div style={{display:'flex', position: 'absolute', textAlign: 'center', width:"100%", alignSelf:'flex-end', justifyContent:'center', paddingBottom:'2vh'}} className={`showButton`}>
                                    <Button style={{border: '0.75px solid black', alignSelf:'flex-end'}} color="danger" onClick={this.toggleReceiptOpenModal}>
                                        Close
                                    </Button>
                                </div>
                                <div style={{height: '80vh', width:'100%'}} className={` ${this.state.hasPaid ? '' : 'blurEffectCalendar'}`}>
                                    {console.log(this.state.pdfLink)}
                                    <iframe style={{width:'100%', height:'100%'}} src={this.state.pdfLink} />
                                </div>
                            </div>
                        </Modal>

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
            </div>
            </div>
        </body>
    );
}
}

export default Prescription;

{/* <Document
                                file={{url : this.state.pdfLink}}
                                onLoadSuccess={this.onDocumentLoadSuccess}
                            >
                                <Page pageNumber={this.state.pageNumber} />
                            </Document>
                            <p>Page {this.state.pageNumber} of {this.state.numPages}</p> */}