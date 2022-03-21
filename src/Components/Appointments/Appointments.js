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
    NavbarText} from 'reactstrap';

import Calendar from 'react-calendar';

import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'

import firebase from '../../Services/firebase';

import moment from 'moment';

import Loader from '../../Assets/Loader/Loader';
import '../../Assets/Calendar/Calendar.css';

class Appointments extends Component {
constructor(props) {
    super(props);
    this.state = {
        doctorId: this.props.match.params.handle,
        date: new Date(), 
        appointment: [],
        busyArray : [],
        slotArray: [],
        daysAvailable: [],
        isFetching: false,
        rescheduleModal : false,
        preDetailsData:[],
        appointmentsList:[],
        doctorIdList : [],
        doctorIdList1 : [],
        appointmentData : {},
        sessionExpired: false,
        emptyData: false,
        rescheduleModal: false,
     };
}

componentDidMount = async() => {
    this.setState({ isFetching: true});
    await this.setValuesFromLocalStorage();

//    let dbrefPrescription = firebase.database().ref(`/prescriptions/PRSCTN-8529469097-9767427053-150520-030000-d00`);
    let dbrefAppointment = firebase.database().ref(`appointments`);
    await dbrefAppointment.orderByChild("patientId").equalTo(this.state.userId).once("value", async(snap) => {
        //working--
        console.log("value"+snap.val());
        this.setState({ appointment : [] });
        this.setState({ doctorIdList : [] });
        if(snap.val()){
            snap.forEach(snap => {
                if(snap.val().doctorId == this.state.doctorId)
                    this.state.appointment.push(snap.val());
                    this.state.doctorIdList.push(snap.val().doctorId);
                //  console.log(this.state.prescription);
            })
            this.state.appointment.sort((ele1,ele2) => {
                let d1 = moment(ele1.date, "DD-MM-YY");
                let d2 = moment(ele2.date, "DD-MM-YY");
    
                if(d1>d2) return 1;
                if(d1<d2) return -1;
            })
            this.setState({
                appointmentsList: this.state.appointment,
                doctorIdList1 : this.state.doctorIdList,
                emptyData: false,
            })
        }
        else{
            this.setState({ emptyData: true});
        }
        
        
        //--working
        
        
    console.log("appointment",this.state.appointment);
    console.log("appointmentsList",this.state.appointmentsList);
    console.log("doctors list: "+this.state.doctorIdList1);
  });
 
  await this.fetchDoctorData();
  await this.getValueFromSessionStorage();

  this.setState({ isFetching: false });
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
        if(addedMoment.isBefore(dateNowMoment)){
            await this.setState({ sessionExpired: true});
            localStorage.removeItem('doctorId');
        }
        else{
            sessionStorage.setItem('sessionTimestamp', dateNowMoment);
        }
    }
}

fetchDoctorData = async() => {
    // let doctorIdNameMapping ={};
    let dbDoctors = firebase.database().ref(`doctors/${this.state.doctorId}/name`);

    await dbDoctors.once("value", (snap) =>{
        // console.log(snap.val());
        this.setState({ doctorName : snap.val()});
    });
    
    // console.log(doctorIdNameMapping);
    // this.setState({ doctorIdNameMapping });
}

setValuesFromLocalStorage = () => {
    const uI = localStorage.getItem('userId');
    const udn = localStorage.getItem('userDependentName');
    const udi = localStorage.getItem('userDependentId');
    const udr = localStorage.getItem('userDependentRelation');

    this.setState({userId: uI});
    this.setState({ dependentInfo: {
        name : udn,
        id: udi,
        relation: udr,
    }});

    return;
}

handleEditClick = async(appointmentObj) => {
    await this.setState({appointmentChosen: appointmentObj});
    await this.setState({isFetching: true});
    await this.fetchDoctorAppointmentData();
    this.toggleRescheduleModal();
}


fetchDoctorAppointmentData = async() => { 
    console.log('in doctor fetcher'+ this.state.doctorId);
    let dbref = firebase.database().ref(`doctors/${this.state.doctorId}/`);
    await dbref.once("value").then((snap) => {
        let data = snap.val();
        // console.log(data["days"]);
        // let dArray = Array.from(data["days"]);
        this.setState({doctorData : data});
        this.setState({doctorFeeData: data["consultancyFee"]});
        let leaveDatesObj = data["slotDetails"]["unavailableDates"];
        let dObject = data["slotDetails"]["timeSlotsTemp"];
        let dObjKeys = Object.keys(dObject);
        let dObjArray = [];
        console.log(leaveDatesObj);

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
        this.setState({ daysAvailable : dObjKeys });
        this.setState({ daysObject: dObject });
        this.setState({ dObjArray });


        if(leaveDatesObj){

            console.log(leaveDatesObj);
            console.log("entered leave dates");
            let leaveDateArray = [];

            for(let i=1;i<leaveDatesObj.length;i++){
                let startDateMoment = moment(leaveDatesObj[i].From, 'DD-MM-YY');
                let endDateMoment = moment(leaveDatesObj[i].To, 'DD-MM-YY');
                let tempMom = startDateMoment;

                while(!tempMom.isAfter(endDateMoment)){
                    console.log(tempMom.format('DD-MM-YY'));
                    leaveDateArray.push(tempMom.format('DD-MM-YY'));
                    tempMom.add(1,'d');
                }
            }

            console.log(leaveDateArray);
            this.setState({ leaveDateArray });
        }
        
        // let dfArray = [];
        // for( var i=0;i<dObjKeys.length;i++){
        //     dfArray.push(dObject[dObjKeys[i]]);
        // }
        // console.log(dfArray);
        // this.setState({slotBeginTime: data["slotDetails"]["timeSlot"]["001"]["openTime"]});
        // this.setState({slotCloseTime: data["slotDetails"]["timeSlot"]["001"]["closeTime"]});
    });
   await this.setAvailableSlots();
   
}

setAvailableSlots = () => {
    // console.log(this.state.slotBeginTime);
    // console.log(this.state.slotCloseTime);

    let daySlotArray = {};
    for(let i=0;i<this.state.daysAvailable.length;i++){
        
        let innerObject = this.state.daysObject[this.state.daysAvailable[i]];
        let innerObjectKeys = Object.keys(innerObject);
        let timeSlotArray = [];
        for(let j=0;j<innerObjectKeys.length;j++){
            let timingObject = innerObject[innerObjectKeys[j]];
            let slotBeginTime = timingObject["openTime"];
            let slotCloseTime = timingObject["closeTime"];
            let timeDuration = parseInt(timingObject["timeAlloted"].toString().substring(0,2),10);
            var timeBegin = moment(slotBeginTime, 'LT', true);
            var timeEnd = moment(slotCloseTime, 'LT', true);
            var tempDate = timeBegin;
            while(tempDate < timeEnd ){
                timeSlotArray.push(tempDate.format('LT'));
                tempDate= moment(tempDate).add(timeDuration,'m');
            }
        }
        let key = this.state.daysAvailable[i];
        daySlotArray[key] = timeSlotArray;
    }
    // console.log(timeSlotArray);
    // console.log(daySlotArray);
    this.setState({slotArray: daySlotArray});
    this.setState({isFetching : false });
    // console.log(timeBegin.format('LT')+" "+timeEnd.format('LT'));
}


onCalendarChange = async(date) => {
    let momentToday = moment(new Date()).format('DD-MM-YY');
    
    let dateTodaySelected = moment(date).format('DD-MM-YY');
    let timeTodaySelected = moment(new Date()).format('LT');

    if(dateTodaySelected == momentToday){
        this.setState({todaySelected : true});
        let dayToday = new Date().toString().substring(0,3);
        console.log(dayToday);

        let todaySlotArray ={
            [dayToday] : this.state.slotArray[dayToday]
        }; 

        let todaySlotArrayFiltered = todaySlotArray[dayToday].filter((time) => {
            return moment(time, 'LT') > moment(timeTodaySelected, 'LT');
        })
        console.log(todaySlotArrayFiltered);
        
        todaySlotArray = {
            [dayToday] : todaySlotArrayFiltered
        }

        console.log(todaySlotArray);
        console.log(this.state.slotArray);
        console.log(this.state.busyArray);
        await this.setState({todaySlotArray});
    }else{
        this.setState({todaySelected: false});
    }
    
    if(this.state.leaveDateArray){
        if(this.state.leaveDateArray.includes(dateTodaySelected)){
            console.log("detected leave day");
            this.setState({leaveSelected: true});
        }
        else{
            this.setState({leaveSelected: false});
        }
    }
    else{
        this.setState({leaveSelected: false});
    }
   

    if(date< new Date() && dateTodaySelected != momentToday){
        this.setState({ olderDateSelected: true});
    }
    else{
        this.setState({ olderDateSelected: false});
    }

    this.setState({ slotClicked: ''});
    this.setState({ date });
    this.setState({ dateSelected: true});
    this.setState({ dayOfDate : date.toString().substr(0,3)});
    await this.fetchCalendarSlots(date);
}

fetchCalendarSlots = async(date) => {

    let dateSelect = date;
    var options = {year: '2-digit', month: '2-digit', day: '2-digit' };

    let formatDate = dateSelect.toLocaleDateString("en-GB", options);
    formatDate = formatDate.replace(/\//g,"");
    // console.log(formatDate);
    this.setState({ isFetching : true });
    let dbref = firebase.database().ref(`doctors/${this.state.doctorId}/slotDetails/busySlots/${formatDate}`);
    await dbref.once("value").then((snap) => {
        let data = snap.val();
        if(data){
            let disKeys = Object.keys(data);
            let busyArray = [];
            let tempObject= {};
            for(var i=0; i<disKeys.length;i++){
                tempObject[i] = data[disKeys[i]];
            }
            let disKeys2 = Object.keys(tempObject);
            for(var i=0;i<disKeys2.length;i++){
                var time = moment(tempObject[i]["timeBegin"], 'LT');
                // console.log("req time becomes: "+ time.format('LT'));
                busyArray.push(time.format('LT'));
                // console.log(busyArray);
            }
            // console.log(busyArray);
            this.setState({ busyArray });
        }
        else{
            this.setState({ busyArray: []});
        }
        this.setState({ isFetching : false });
    });
}

changeSlotSelect = (slot) => {
    // console.log(slot);
    var t = moment(slot, 'LT');
    this.setState({ slotClicked : t.format('LT')});
}


toggleNavbar = () => {
    this.setState(prevState=>{
      return{
          ...prevState,
          isNavbarOpen: !prevState.isNavbarOpen,
      }
    });
  }

toggleRescheduleModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            rescheduleModal: !prevState.rescheduleModal,
        }
    });
}

render() {

    
    let preDetailsData = this.state.appointmentsList.map((appointmentsListElement,index) => {
        
            return (
            <Tr key={appointmentsListElement.id}>
                <Td className="td">{appointmentsListElement.date}</Td>
                <Td className="td">{appointmentsListElement.timeBegin}</Td>
                <Td className="td">{appointmentsListElement.dependentInfo.name}</Td>
                {/* <Td className="td">{
                    (this.state.doctorIdNameMapping) ? (
                        this.state.doctorIdNameMapping[appointmentsListElement.doctorId]
                    ) : (
                        <p>Rekt</p>
                    )
                }</Td> */}
                <Td className="td">{appointmentsListElement.mode}</Td>
                <Td className="td">{appointmentsListElement.visitType}</Td>
                <Td className="td">
                    <button className="std-button" style={{height: 30}} onClick={this.handleEditClick.bind(this,appointmentsListElement)}>
                        Edit
                    </button>
                </Td>
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
                                    <div style={{width: '100%', display:'flex', justifyContent:'space-between'}}>
                                        <text className="Prescription-heading-title" style={{fontSize:22}}>
                                            My Appointments
                                        </text>
                                        <text className="Prescription-heading-title" style={{fontSize:17, alignSelf:'center', marginLeft: '3%', marginRight:'3%', fontWeight: 400, textAlign: 'right'}}>
                                            Doctor Name: Dr. {this.state.doctorName}
                                        </text>
                                    </div>
                                    
                                    <br/>
                                    <br/>
                                    {
                                        (this.state.emptyData) ? (
                                            <div style={{display:'flex', flexDirection:'row', width:'100%', height:'100%', alignContent:'center', justifyContent:'center'}}>
                                                <text  style={{fontWeight:'300', fontSize:24, textAlign:'center'}}>You do not currently have any appointments!</text>
                                            </div>
                                        ) : (
                                            <Table class="table">
                                                <Thead className="Prescription-heading">
                                                    <Tr>
                                            
                                                        <Th className="th" scope="col"> Date </Th>
                                                        <Th className="th" scope="col"> Time </Th>
                                                        <Th className="th" scope="col"> Patient Name </Th>
                                                        {/* <Th className="th" scope="col"> Doctor Name </Th> */}
                                                        <Th className="th" scope="col"> Mode </Th>
                                                        <Th className="th" scope="col"> Type </Th>
                                                        <Th className="th" scope="col"> Action </Th>

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

                <Modal isOpen={this.state.rescheduleModal} toggle={this.toggleRescheduleModal}>
                    <ModalHeader toggle={this.toggleRescheduleModal}>Online Consultancy Payment</ModalHeader>
                    <ModalBody>
                        {
                            (this.state.appointmentChosen) ? (
                                <div>
                                    <div>
                                        <p>
                                        <Calendar 
                                            onChange={this.onCalendarChange}
                                            value={this.state.date}
                                        />
                                        </p>
                                    </div>
                                    <div style={{textAlign: 'center', margin:'1.5vh 0vh'}}>
                                        <button className="std-button" onClick={this.toggleDocSlotsModal}>
                                            View Doctor's Slots
                                        </button>
                                    </div>
                            
                            
                                <div className="slot-info">
                                    <div className="row">
                                    
                                        <div className="row">
                                            <div className="slots-margins">
                                                <span className="slots selected-slot">
                                                </span>
                                                Selected
                                            </div>
                                            <div>
                                                <span className="slots booked-slot">
                                                </span>
                                                Booked
                                            </div>
                                            <div>
                                                <span className="slots open-slot">
                                                </span>
                                                Available
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="slots-row">
                                
                                {
                                    (this.state.isLoading) ? (
                                        <Loader loading={this.state.isLoading} />
                                    ) : (
                                        (this.state.olderDateSelected) ? (<p>Sorry, you must select a date after today, to book an appointment.</p>) : (
                                            (!this.state.daysAvailable.includes(this.state.dayOfDate) && this.state.dayOfDate) ? (
                                                <p>Sorry, you must select a day when the doctor is available, to book an appointment.</p>
                                            ) : (this.state.leaveSelected) ? (<p>Sorry, the doctor is on a leave on this date, select another date to continue.</p>)
                                             : (
                                                ((this.state.todaySelected) ? (
                                                    (this.state.todaySlotArray) ? (
                                                        (this.state.todaySlotArray[this.state.dayOfDate]) ? (
                                                            (this.state.busyArray.length>0) ? (this.state.todaySlotArray[this.state.dayOfDate].map((slot, index) => {
                                                                if(this.state.busyArray.includes(slot))
                                                                {
                                                                    return(
                                                                        <div className="slot-present">
                                                                            <button className="booked-slot_time" style={{cursor: 'default'}}>
                                                                                <span>
                                                                                    {slot.toString()}
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                }
                                                                else{
                                                                    return(
                                                                        <div className="slot-present">
                                                                            <button className={(this.state.slotClicked != slot) ? `open-slot_time` : `selected-slot_time`} onClick={this.changeSlotSelect.bind(this,slot)}>
                                                                                <span>
                                                                                    {slot.toString()}
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                }
                                                            })) : (
                                                               
                                                                (this.state.dateSelected) ? (
                                                                    this.state.todaySlotArray[this.state.dayOfDate].map((slot, index) => {
                                                                       
                                                                        return(
                                                                            <div className="slot-present">
                                                                                <button className={(this.state.slotClicked != slot) ? `open-slot_time` : `selected-slot_time`} onClick={this.changeSlotSelect.bind(this,slot)}>
                                                                                    <span>
                                                                                        {slot.toString()}
                                                                                    </span>
                                                                                </button>
                                                                            </div>
                                                                        )
                                                                       
                                                                    })
                                                                ) : (<div></div>)
                                                            )
                                                        ) : (<div></div>)
                                                        
        
                                                        
                                                    ) : (<div></div>)
                                                ) : (
                                                    (this.state.slotArray) ? (
                                                        (this.state.slotArray[this.state.dayOfDate]) ? (
                                                            (this.state.busyArray.length>0) ? (this.state.slotArray[this.state.dayOfDate].map((slot, index) => {
                                                                if(this.state.busyArray.includes(slot))
                                                                {
                                                                    return(
                                                                        <div className="slot-present">
                                                                            <button className="booked-slot_time" style={{cursor: 'default'}}>
                                                                                <span>
                                                                                    {slot.toString()}
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                }
                                                                else{
                                                                    return(
                                                                        <div className="slot-present">
                                                                            <button className={(this.state.slotClicked != slot) ? `open-slot_time` : `selected-slot_time`} onClick={this.changeSlotSelect.bind(this,slot)}>
                                                                                <span>
                                                                                    {slot.toString()}
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                }
                                                            })) : (
                                                               
                                                                (this.state.dateSelected) ? (
                                                                    this.state.slotArray[this.state.dayOfDate].map((slot, index) => {
                                                                       
                                                                        return(
                                                                            <div className="slot-present">
                                                                                <button className={(this.state.slotClicked != slot) ? `open-slot_time` : `selected-slot_time`} onClick={this.changeSlotSelect.bind(this,slot)}>
                                                                                    <span>
                                                                                        {slot.toString()}
                                                                                    </span>
                                                                                </button>
                                                                            </div>
                                                                        )
                                                                       
                                                                    })
                                                                ) : (<div></div>)
                                                            )
                                                        ) : (<div></div>)
                                                        
        
                                                        
                                                    ) : (<div></div>)
                                                )
                                                
                                                )
                                             )
                                            
                                            
                                        )
                                    )
                                    
                                }
                            
                                
                               
                            </div>
                            </div>
                            ) : (
                                <div></div>
                            )
                             
                        }
                        
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handlePaymentClick}>Reschedule</Button>
                    </ModalFooter>
                </Modal>   
                       
            </div>
            </div>
        </body>
    );
}
}

export default Appointments;