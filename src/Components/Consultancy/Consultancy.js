import React, { Component } from 'react';
import Calendar from 'react-calendar';
import {Redirect, Link} from 'react-router-dom';

import { Modal, Input, ModalBody, ModalHeader, ModalFooter, Button,Form, FormGroup, Label, FormText, Tooltip,
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
    Badge} from 'reactstrap';

import firebase from '../../Services/firebase';
import moment from "moment";

import Loader from '../../Assets/Loader/Loader';
 
import '../../Assets/Calendar/Calendar.css';

class Consultancy extends Component {
constructor(props) {
    super(props);
    this.state = {
        isLoading : false,
        date : new Date(),
        appointmentType: 'First Time',
        busyArray : [],
        doctorData : {},
        payClick: false,
        payOfflineClick: false,
        payOnlineClick: false,
        daysAvailable: [],
        viewDocSlotsModal: false,
        handleDocId : this.props.match.params.handle,
        guideModalOpen : true,
        notFollowup : false,
        notFollowupModal: false,
        sessionExpired: false,
        privacyPolicyModal : false,
        termsModal : false,
        cancellationRefundModal: false,
    };
    this.calendarRef = React.createRef();
    this.buttonsRef = React.createRef();
}


componentDidMount = async() => {
    this.setState({ isLoading : true });

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.crossOrigin = true;

    document.body.appendChild(script);

    await this.getValuesFromLocalStorage();
    this.fetchDoctorData();

    await this.getStaticValueFromSessionStorage();
    await this.getDynamicValueFromSessionStorage();
    // this.interval = setInterval(() => this.getValueFromSessionStorage(), 1000);
}

componentDidUpdate = async() => {
    await this.getDynamicValueFromSessionStorage();
}

getStaticValueFromSessionStorage = async() => {
    let ucm = sessionStorage.getItem('userCommunicationMode');
    if(ucm!=="undefined"){
        this.setState({userCommunicationMode : ucm});
        if(ucm == "WhatsApp"){
            let uw = sessionStorage.getItem('userWhatsapp');
            if(uw!=="undefined"){
                this.setState({userWhatsapp: uw});
            }
        }
    }
}

getDynamicValueFromSessionStorage = async() => {
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

getValuesFromLocalStorage = () => {

    const dI = localStorage.getItem('doctorId');
    const udn = localStorage.getItem('userDependentName');
    const udi = localStorage.getItem('userDependentId');
    const udr = localStorage.getItem('userDependentRelation');
    const udg = localStorage.getItem('userDependentGender');
    const udbd = localStorage.getItem('userDependentBirthdate');
    const uI = localStorage.getItem('userId');
    const dpan = localStorage.getItem('doctorPaymentAlternativeOnline');
    const dpaf = localStorage.getItem('doctorPaymentAlternativeOffline');

     console.log(udn);
     console.log(udi);
     console.log(udr);
     console.log(udg);
     console.log(udbd);

    this.setState({doctorId : dI});
    this.setState({userId: uI});
    this.setState({dependentInfo: {
        name : udn,
        id: udi,
        relation: udr,
        gender: udg,
        birthdate: udbd,
    }});

    this.setState({doctorPaymentAlternativeOnline : dpan});
    this.setState({doctorPaymentAlternativeOffline : dpaf});
    return;
}

fetchDoctorData = async() => { 
    console.log('in doctor fetcher'+ this.state.doctorId);
    let dbref = firebase.database().ref(`doctors/${this.state.doctorId}/`);
    await dbref.once("value").then((snap) => {
        let data = snap.val();
        // console.log(data["days"]);
        // let dArray = Array.from(data["days"]);
        this.setState({doctorData : data});
        this.setState({doctorName: data["name"]});
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
    this.setState({isLoading : false });
    // console.log(timeBegin.format('LT')+" "+timeEnd.format('LT'));
}

onCalendarChange = async(date) => {

    // console.log(moment(momentNow));
    // console.log(moment(momentToday));
    // console.log(momentNow == momentToday);
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
    this.setState({ isLoading : true });
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
        this.setState({ isLoading : false });
    });
}

handlePayButton = async() => {
    let dateSelect= null;
    if(this.state.appointmentMode == "online"){
        dateSelect = this.state.date;
    }
    else{
        dateSelect = new Date();
    }
    
    var options = {year: '2-digit', month: '2-digit', day: '2-digit' };

    let formatDate = dateSelect.toLocaleDateString("en-GB", options);
    let format2Date = formatDate.replace(/\//g,"");
    var updates = {};
    let docObject = {
        "id" : this.state.doctorId,
        "name" : this.state.doctorData.name
    };

    let patObject = {
        "id" : this.state.userId,
        "name" : this.state.dependentInfo.name,
        "dependentId" : this.state.dependentInfo.id,
        "relation" : this.state.dependentInfo.relation,
        "gender" : this.state.dependentInfo.gender,
        "birthdate" : this.state.dependentInfo.birthdate,
        "phone" : this.state.userId
    }
    // console.log(formatDate);
    updates[`patients/${this.state.userId}/doctorInfo/d${this.state.dependentInfo.id}/${this.state.doctorId}`] = docObject;
    updates[`doctors/${this.state.doctorId}/patientDetails/${this.state.userId}/d${this.state.dependentInfo.id}`] = patObject;
    await firebase.database().ref().update(updates);


    let consultancyFee = 0;
        // console.log(this.state.appointmentMode);
    if(this.state.appointmentMode=="online"){
        // console.log("it is online");
        if(this.state.appointmentType=="Follow up"){
            consultancyFee = parseInt(this.state.doctorData["consultancyFee"]["followup_online"]);
        }else{
            consultancyFee = parseInt(this.state.doctorData["consultancyFee"]["firstTime_online"]);
        }
    }else{
        if(this.state.appointmentType=="Follow up"){
            consultancyFee = parseInt(this.state.doctorData["consultancyFee"]["followup_offline"]);
        }else{
            consultancyFee = parseInt(this.state.doctorData["consultancyFee"]["firstTime_offline"]);
        }
    }

    this.setState({ consultancyFee });


    let dbref = firebase.database().ref(`doctors/${this.state.doctorId}/slotDetails/busySlots/`);
    var num = 0;
    dbref.once('value', async(snap) => {
        let data = snap.val();
        if(data){
            if(data[format2Date.toString()]){
                // console.log('busy slots exist');
                // console.log(Object.keys(data[format2Date.toString()]).length);
                num = Object.keys(data[format2Date.toString()]).length;
                return this.uploadBusySlots(num);
            }
            else{
                return this.uploadBusySlots(num);
            }
        }
        else{
            return this.uploadBusySlots(0);
        }
        
    });
}

uploadBusySlots = async(numb) => {
    // console.log("called with id: "+numb);
    let dateSelect= null;
    if(this.state.appointmentMode == "online"){
        dateSelect = this.state.date;
    }
    else{
        dateSelect = new Date();
    }

    let slotSelect = null;
    if(this.state.appointmentMode == "online"){
        slotSelect = this.state.slotClicked;
    }
    else{
        slotSelect = moment(new Date()).format('LT');
        console.log(slotSelect);
    }

    var options = {year: '2-digit', month: '2-digit', day: '2-digit' };

    let formatDate = dateSelect.toLocaleDateString("en-GB", options);
    let format2Date = formatDate.replace(/\//g,"");

    let dateNow = new Date();
    let formatNowDate = dateNow.toLocaleDateString("en-GB", options);
    let format2NowDate = formatNowDate.replace(/\//g,"");

    

    if(this.state.appointmentMode == "online"){
        var updates={};
        // console.log(numb);
        numb++;
        let uploadObject = {
            "id" : numb,
            "date" : formatDate.replace(/\//g,"."),
            "timeBegin" : this.state.slotClicked,
        };
        updates[`doctors/${this.state.doctorId}/slotDetails/busySlots/${format2Date}/${numb}`] = uploadObject;
        await firebase.database().ref().update(updates);
    }

    if(this.state.appointmentMode == 'online'){
        await this.createAppointmentAndPayOnline();
    }
    else if(this.state.appointmentMode == 'offline'){
        await this.createAppointmentAndPayOffline();
    }
    
}

createAppointmentAndPayOnline = async() => {

    console.log("fee is "+this.state.consultancyFee)
    if(this.state.doctorPaymentAlternativeOnline=="Before") {
        var options = {
            "key": "", // Enter the Key ID generated from the Dashboard
            "amount": this.state.consultancyFee*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": "INR",
            "name": "Mobilesutra Corp",
            "description": "Payment for Appointment",
            "image": "data:image/png;base64,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",
            // "order_id": `${this.state.paymentStr}`, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "handler": async(response) => {
                await this.handlePaymentSuccess(response.razorpay_payment_id);
                this.setState({ razorPayResp : response.razorpay_payment_id });
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#4be4ac"
            }
        };
    
        var rzp1 = new window.Razorpay(options);
    
        await rzp1.open();
    }
    
    else{
        this.handleContinueWithoutPayment();
    }

}

createAppointmentAndPayOffline = async() => {

    console.log("fee is "+this.state.consultancyFee)
    if(this.state.doctorPaymentAlternativeOffline=="Before") {
        var options = {
            "key": "rzp_test_sAgw6NczoaNFRz", // Enter the Key ID generated from the Dashboard
            "amount": this.state.consultancyFee*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": "INR",
            "name": this.state.doctorName,
            "description": "Payment for Appointment",
            "image": "data:image/png;base64,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",
            // "order_id": `${this.state.paymentStr}`, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "handler": async(response) => {
                await this.handlePaymentSuccess(response.razorpay_payment_id);
                this.setState({ razorPayResp : response.razorpay_payment_id });
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#4be4ac"
            }
        };
    
        var rzp1 = new window.Razorpay(options);
    
        await rzp1.open();
    }
    
    else{
        this.handleContinueWithoutPayment();
    }

}

handleContinueWithoutPayment = async() => {
            let dateSelect= null;
            if(this.state.appointmentMode == "online"){
                dateSelect = this.state.date;
            }
            else{
                dateSelect = new Date();
            }

            let slotSelect = null;
            if(this.state.appointmentMode == "online"){
                slotSelect = this.state.slotClicked;
            }
            else{
                slotSelect = moment(new Date()).format('LT');
                console.log(slotSelect);
            }

            var options = {year: '2-digit', month: '2-digit', day: '2-digit' };
            let formatDate = dateSelect.toLocaleDateString("en-GB", options);

            console.log(formatDate);
            let formatDate1 = formatDate.replace(/\//g,"");
            let formatDate2 = formatDate.replace(/\//g,".");

            let formatTime = slotSelect.replace(/\s/g, "");

            ///////////////////////////

            const dateNow = new Date();

            let formatNowDate = dateNow.toLocaleDateString("en-GB", options);
            let formatNowDate1 = formatNowDate.replace(/\//g,"");
            let formatNowDate2 = formatNowDate.replace(/\//g,".");

            let formatNowTime = dateNow.toLocaleTimeString('en-US');
            let momNowTime = moment(dateNow);
            let momNowTimeFormat = momNowTime.format('LT');
            let formatNowTime1 = momNowTimeFormat.replace(/\s/g ,"");
            let formatNowTime2 = momNowTimeFormat.replace(/\s/g ," ");
            console.log(formatNowDate2+" "+formatNowTime1);

            ///////////////////////////
            let keyString = "APPMT-"+this.state.userId+"-"+this.state.doctorId+"-"+formatDate1+"-"+formatTime+"-d"+this.state.dependentInfo.id;

            let diagnosisEmptyForm = {
                "additionalInfo" : "",
                "form" : [ null, {
                  "ans" : "",
                  "ques" : ""
                }, {
                  "ans" : "",
                  "ques" : ""
                }, {
                  "ans" : "",
                  "ques" : ""
                }, {
                  "ans" : "",
                  "ques" : ""
                } ]
              };

              console.log(this.state.userCommunicationMode);
              console.log(this.state.dependentInfo);

            let object = {};
            if(this.state.appointmentMode == "online"){
                object = {
                    "hasPaid" : false,
                    "paymentAlternative" : this.state.doctorPaymentAlternativeOnline,
                    "patientId" : this.state.userId,
                    "doctorId" : this.state.doctorId,
                    "id" : keyString,
                    "mode" : this.state.appointmentMode,
                    "visitType" : this.state.appointmentType,
                    "dependentInfo" : this.state.dependentInfo,
                    "dateBooked" : formatNowDate2,
                    "date" : formatDate2,
                    "timeBegin" : slotSelect,
                    "name" : this.state.dependentInfo.name,
                    "fee" : this.state.consultancyFee,
                    "isSeen" : false,
                    "diagnosisForm" : diagnosisEmptyForm,
                    "userCommunicationMode" : this.state.userCommunicationMode,
                    
                };
            }

            else{
                object = {
                    "hasPaid" : false,
                    "paymentAlternative" : this.state.doctorPaymentAlternativeOffline,
                    "patientId" : this.state.userId,
                    "doctorId" : this.state.doctorId,
                    "id" : keyString,
                    "mode" : this.state.appointmentMode,
                    "visitType" : this.state.appointmentType,
                    "dependentInfo" : this.state.dependentInfo,
                    "dateBooked" : formatNowDate2,
                    "date" : formatDate2,
                    "timeBegin" : slotSelect,
                    "name" : this.state.dependentInfo.name,
                    "fee" : this.state.consultancyFee,
                    "isSeen" : false,
                    "diagnosisForm" : diagnosisEmptyForm,
                    "userCommunicationMode" : this.state.userCommunicationMode,
                };
            }

            if(this.state.userCommunicationMode=="WhatsApp"){
                object["userWhatsapp"] = this.state.userWhatsapp;
            }
            

            var updates={};
            // console.log(object);

            // console.log(keyStr);
            updates[`appointments/${keyString}`] = object;
            await firebase.database().ref().update(updates);



            localStorage.setItem('dateSelected', dateSelect);
            localStorage.setItem('slotSelected', slotSelect);
            localStorage.setItem('appointmentMode', this.state.appointmentMode);
            localStorage.setItem('appointmentType', this.state.appointmentType); 
            localStorage.setItem('lastAppointment', JSON.stringify(this.state.lastAppointment));
            this.setState({ allowedToRedirect: true });
}

handlePaymentSuccess = async(rpPaymentId) => {

            let dateSelect= null;
            if(this.state.appointmentMode == "online"){
                dateSelect = this.state.date;
            }
            else{
                dateSelect = new Date();
            }

            let slotSelect = null;
            if(this.state.appointmentMode == "online"){
                slotSelect = this.state.slotClicked;
            }
            else{
                slotSelect = moment(new Date()).format('LT');
                console.log(slotSelect);
            }

            var options = {year: '2-digit', month: '2-digit', day: '2-digit' };
            let formatDate = dateSelect.toLocaleDateString("en-GB", options);

            console.log(formatDate);
            let formatDate1 = formatDate.replace(/\//g,"");
            let formatDate2 = formatDate.replace(/\//g,".");

            let formatTime = slotSelect.replace(/\s/g, "");

            ///////////////////////////

            const dateNow = new Date();

            let formatNowDate = dateNow.toLocaleDateString("en-GB", options);
            let formatNowDate1 = formatNowDate.replace(/\//g,"");
            let formatNowDate2 = formatNowDate.replace(/\//g,".");

            let formatNowTime = dateNow.toLocaleTimeString('en-US');
            let momNowTime = moment(dateNow);
            let momNowTimeFormat = momNowTime.format('LT');
            let formatNowTime1 = momNowTimeFormat.replace(/\s/g ,"");
            let formatNowTime2 = momNowTimeFormat.replace(/\s/g ," ");
            console.log(formatNowDate2+" "+formatNowTime1);

            ///////////////////////////
            let keyString = "APPMT-"+this.state.userId+"-"+this.state.doctorId+"-"+formatDate1+"-"+formatTime+"-d"+this.state.dependentInfo.id;
            
            let paymentStr = "PYMT-"+this.state.userId+"-"+this.state.doctorId+"-"+formatNowDate1+"-"+formatNowTime1;
            console.log(paymentStr);
            
            let diagnosisEmptyForm = {
                "additionalInfo" : "",
                "form" : [ null, {
                  "ans" : "",
                  "ques" : ""
                }, {
                  "ans" : "",
                  "ques" : ""
                }, {
                  "ans" : "",
                  "ques" : ""
                }, {
                  "ans" : "",
                  "ques" : ""
                } ]
              };

            let object = {};
            console.log(this.state.userCommunicationMode);
            console.log(this.state.dependentInfo);
            if(this.state.appointmentMode == "online"){
                object = {
                    "hasPaid" : true,
                    "patientId" : this.state.userId,
                    "doctorId" : this.state.doctorId,
                    "id" : keyString,
                    "mode" : this.state.appointmentMode,
                    "visitType" : this.state.appointmentType,
                    "dependentInfo" : this.state.dependentInfo,
                    "dateBooked" : formatNowDate2,
                    "date" : formatDate2,
                    "timeBegin" : slotSelect,
                    "name" : this.state.dependentInfo.name,
                    "fee" : this.state.consultancyFee,
                    "isSeen" : false,
                    "paymentId" : paymentStr,
                    "diagnosisForm" : diagnosisEmptyForm,
                    "userCommunicationMode" : this.state.userCommunicationMode,
                };
            }

            else{
                object = {
                    "hasPaid" : true,
                    "patientId" : this.state.userId,
                    "doctorId" : this.state.doctorId,
                    "id" : keyString,
                    "mode" : this.state.appointmentMode,
                    "visitType" : this.state.appointmentType,
                    "dependentInfo" : this.state.dependentInfo,
                    "dateBooked" : formatNowDate2,
                    "date" : formatDate2,
                    "timeBegin" : slotSelect,
                    "name" : this.state.dependentInfo.name,
                    "fee" : this.state.consultancyFee,
                    "isSeen" : false,
                    "paymentId" : paymentStr,
                    "diagnosisForm" : diagnosisEmptyForm,
                    "userCommunicationMode" : this.state.userCommunicationMode,
                    
                };
            }

            if(this.state.userCommunicationMode=="WhatsApp"){
                object["userWhatsapp"] = this.state.userWhatsapp;
            }

            let paymentObj = {
                "amount" : this.state.consultancyFee,
                "appointmentId" : keyString,
                "date" : formatNowDate2,
                "doctorId" : this.state.doctorId,
                "dependentInfo" : this.state.dependentInfo,
                "id" : paymentStr,
                "patientId" : this.state.userId,
                "time" : formatNowTime2,
                "paymentIdRP" : rpPaymentId,
                "type" : "Appointment Payment"
            }

            var updates={};
            // console.log(object);

            // console.log(keyStr);
            updates[`appointments/${keyString}`] = object;
            updates[`payments/${paymentStr}`] = paymentObj;
            await firebase.database().ref().update(updates);



            localStorage.setItem('dateSelected', dateSelect);
            localStorage.setItem('slotSelected', slotSelect);
            localStorage.setItem('appointmentMode', this.state.appointmentMode);
            localStorage.setItem('appointmentType', this.state.appointmentType); 
            localStorage.setItem('lastAppointment', JSON.stringify(this.state.lastAppointment));
            

            this.setState({ allowedToRedirect: true });
            
}

changeSlotSelect = (slot) => {
    // console.log(slot);
    var t = moment(slot, 'LT');
    this.setState({ slotClicked : t.format('LT')});
}


toggleAppointmentMode = (key) => (event) => {
    // console.log(this.state.userName);
    
    if(key == 'online'){
        this.handleOnlineClickScroll();
    }
    if(key == 'offline'){
        this.handleOfflineClickScroll();
    }
    this.setState({ appointmentMode: key});
}

changeAppointmentType = async(event) => {
    if(this.state.appointmentType=="First Time"){
        await this.checkFollowupAppointment();
    }
    else{
        this.setState({appointmentType: "First Time"});
    }
}

checkFollowupAppointment = async() => {

    let dateSelect = this.state.date;
    var options = {year: '2-digit', month: '2-digit', day: '2-digit' };

    let formatDate = dateSelect.toLocaleDateString("en-GB", options);
    let format2Date = formatDate.replace(/\//g,"");

    let dateNow = new Date();
    let formatNowDate = dateNow.toLocaleDateString("en-GB", options);
    let format2NowDate = formatNowDate.replace(/\//g,"");


    let momentDate = moment(dateSelect);
    let momentNow = moment(dateNow);
    // let momentTest = momentNow.subtract(2, 'days');
    // momentDate.subtract(7,'days');

    // console.log(momentDate.format("DD-MM-YYYY"));
    // console.log(momentNow.format("DD-MM-YYYY"));

    // console.log(momentDate > momentNow)

    let dbref2 = firebase.database().ref(`appointments`);
    await dbref2.orderByChild("patientId").equalTo(this.state.userId).once("value", async(snap) => {
        let data = snap.val();
        console.log(data);
        if(data){
            let appointmentsArray = [];
            snap.forEach((sn) => {
                let d = sn.val();
                console.log(d.doctorId+" "+this.state.handleDocId+" "+d.dependentInfo.id+" "+this.state.dependentInfo.id);
                
                if(d.doctorId == this.state.handleDocId && d.dependentInfo.id == this.state.dependentInfo.id){
                    // console.log(d);
                    appointmentsArray.push(d);
                }
            });
            console.log(appointmentsArray);
            if(appointmentsArray.length<1){
                if(this.state.appointmentMode == "online"){
                    document.getElementById('myCheckbox1').checked = false;
                }else{
                    document.getElementById('myCheckbox2').checked = false;
                }
                this.setState({appointmentType: 'First Time'});
                this.setState({notFollowup : true});
                this.setState({notFollowupModal : true});
                return;
            }
            appointmentsArray.sort((ele1, ele2) => {
                let date1 = moment(ele1.date, 'DD-MM-YY');
                let date2 = moment(ele2.date, 'DD-MM-YY');

                let time1 = moment(ele1.timeBegin, 'LT');
                let time2 = moment(ele2.timeBegin, 'LT');

                if(moment(date1).isSame(date2)){
                    console.log("having to sort times");
                    if(moment(time1).isAfter(time2)) return -1;
                    if(moment(time1).isBefore(time2)) return 1;
                }
                if(moment(date1).isAfter(date2)) return -1;
                if(moment(date1).isBefore(date2)) return 1;
                

            });
            console.log(appointmentsArray);

            this.setState({ lastAppointment : appointmentsArray[0]});

            let lastAppointmentDate = appointmentsArray[0].date
            let momentLAD = moment(lastAppointmentDate, 'DD-MM-YY');

            if(this.state.appointmentMode == "online"){
                let momentDateTemp = momentDate;
                momentDateTemp.subtract( parseInt(this.state.doctorFeeData["followup_online_period"]), 'days');
                console.log(momentDateTemp > momentLAD);
                console.log(momentDateTemp.format("DD-MM-YY"));
                console.log(momentLAD.format("DD-MM-YY"));  
                
                let momentDate2 = moment(dateSelect);

                console.log(momentDate2.format("DD-MM-YY"));
                if(momentDate2.isBefore(momentLAD) || momentDateTemp.isAfter(momentLAD)){
                    document.getElementById('myCheckbox1').checked = false;
                    this.setState({appointmentType: 'First Time'});
                    this.setState({notFollowup : true});
                    this.setState({notFollowupModal : true});
                }
                else{
                    this.setState({ notFollowup : false});
                    this.setState({ appointmentType: 'Follow up'});
                }
            }
            else{
                let momentNowTemp = momentNow;
                momentNowTemp.subtract( parseInt(this.state.doctorFeeData["followup_online_period"]), 'days');
                console.log(momentNowTemp.format("DD-MM-YY"));
                console.log(momentLAD.format("DD-MM-YY"));
                
                let momentNow2 = moment(dateNow);
                console.log(momentNow2.format("DD-MM-YY"));
                
                if(momentNow2.isBefore(momentLAD) || momentNowTemp.isAfter(momentLAD)){
                    document.getElementById('myCheckbox2').checked = false;
                    this.setState({appointmentType: 'First Time'});
                    this.setState({notFollowup : true});
                    this.setState({notFollowupModal : true});
                }
                else{
                    this.setState({ notFollowup : false});
                    this.setState({ appointmentType: 'Follow up'});
                }
            }
        }
        else{
            if(this.state.appointmentMode == "online"){
                document.getElementById('myCheckbox1').checked = false;
            }else{
                document.getElementById('myCheckbox2').checked = false;
            }
            
            this.setState({appointmentType: 'First Time'});
            this.setState({notFollowup : true});
            this.setState({notFollowupModal : true});
        }
    });
}

toggleGuideModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            guideModalOpen: !prevState.guideModalOpen,
        }
    });
}

toggleOfflineClick = () => {
    this.togglePayClick();
    this.setState(prevState=>{
        return{
            ...prevState,
            payOfflineClick: !prevState.payOfflineClick,
        }
    });
}

toggleOnlineClick = () => {
    this.togglePayClick();
    this.setState(prevState=>{
        return{
            ...prevState,
            payOnlineClick: !prevState.payOnlineClick,
        }
    });
}


toggleErrorModal = () => {
    this.togglePayClick();
    this.setState({ payOfflineClick : false});
    this.setState({ payOnlineClick : false});
}

toggleNotFollowupModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            notFollowupModal: !prevState.notFollowupModal,
        }
    });
}

togglePayClick = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            payClick: !prevState.payClick,
        }
    });
}

toggleDocSlotsModal = () => {
    this.setState(prevState=>{
        return{
            ...prevState,
            viewDocSlotsModal: !prevState.viewDocSlotsModal,
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


handleOnlineClickScroll = () => {
    
    if(this.calendarRef.current){
        this.calendarRef.current.scrollIntoView({ 
           behavior: "smooth", 
           block: "nearest"
        })
    }
}

handleOfflineClickScroll = () => {
    
    if(this.buttonsRef.current){
        this.buttonsRef.current.scrollIntoView({ 
           behavior: "smooth", 
           block: "nearest"
        });
    }
}

render() {
    return (
        
        <body className="body">
        <div className="wrapper">
            <div className="container-fluid">
              
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
                    <div className="col-md-6 col-sm-12 col-xs-12 consultancyMargins">
                        
                            <div className="pro-description cunsultancyMargins">
                                <div className={`row`} style={{borderBottom: '0.75px solid #d3d3d3', padding : '3rem 3rem 3rem 0rem', cursor: 'pointer'}} onClick={this.toggleAppointmentMode('online')}>
                                    <div style={{position: 'absolute', textAlign: 'center', width:"100%", alignSelf:'center'}} className={`${(this.state.appointmentMode=="offline") ? "showButton" : "hideButton"}`}> 
                                        <button style={{border: '1.5px solid black'}} className="std-button">
                                            CLICK TO SWITCH TO ONLINE CONSULTANCY
                                        </button>
                                    </div>
                                    <div className={`row ${(this.state.appointmentMode!="offline") ? "" : "blurEffectMode" }`}>
                                    <div className="col-md-3 c-imagebox">
                                        {/* <img src="./../Assets/Images/" /> */}
                                        <img
                                            src={require('../../Assets/Images/v-consultancy.svg')} 
                                        />
                                    </div>
                                    <div className="col-md-9">
                                        <p>
                                        <h4> Online Consultancy </h4>
                                            Using online consultancy, patient can talk with doctor using the video call.
                                            So patient can virtually consult with the doctor.
                                        </p>
                                        <hr/>
                                        <br/>
                                        {
                                        (this.state.doctorFeeData) ? (
                                            <div>
                                            <h5> Consultancy Fee (First Visit) : Rs. {this.state.doctorFeeData["firstTime_online"]}/- </h5>
                                            <h6> Consultancy Fee (Follow-up Visit) : Rs. {this.state.doctorFeeData["followup_online"]}/- </h6>
                                            </div>
                                        ) : (<div></div>)
                                        }
                                        <br/>
                                        <p>
                                            <b>Note:</b>{' '}
                                            For online consultancy you need to take doctor's appointment in available
                                            slots
                                        </p>
                                        
                                    </div>
                                    </div>
                                </div>
                                                
                                

                                <div className={`row`} style={{borderTop:'0.75px solid #d3d3d3', padding: '3rem 3rem 3rem 0rem', cursor: 'pointer'}} onClick={this.toggleAppointmentMode('offline')}>
                                    <div style={{position: 'absolute', textAlign: 'center', width:"100%", alignSelf:'center'}} className={`${(this.state.appointmentMode=="online") ? "showButton" : "hideButton"}`}> 
                                        <button style={{border: '1.5px solid black'}} className="std-button">
                                            CLICK TO SWITCH TO OFFLINE CONSULTANCY
                                        </button>
                                    </div>
                                    <div className={`row ${(this.state.appointmentMode!="online") ? "" : "blurEffectMode" }`}>
                                    <div className="col-md-3 c-imagebox">
                                        <img
                                            src={require('../../Assets/Images/o-consultancy.svg')} 
                                        />
                                    </div>
                                    <div className="col-md-9">
                                        <p>
                                        <h4>
                                            Offline Consultancy
                                        </h4>
                                            Using offline consultancy, patient can visit the doctor at his clinic, just how conventional consultations work.
                                            So patient can personally, and physically  consult with the doctor.
                                        </p>
                                        <hr/>
                                        <br/>
                                        {
                                        (this.state.doctorFeeData) ? (
                                            <div>
                                            <h5> Consultancy Fee (First Visit) : Rs. {this.state.doctorFeeData["firstTime_offline"]}/- </h5>
                                            <h6> Consultancy Fee (Follow-up Visit) : Rs. {this.state.doctorFeeData["followup_offline"]}/- </h6>
                                            </div>
                                        ) : (<div></div>)
                                        }
                                        <br/>
                                        <p>
                                            <b>Note:</b>{' '}
                                            For offline consultancy you need to take doctor's appointment in available
                                            slots
                                        </p>
                                        
                                    </div>
                                    </div>
                                   
                                </div>
                                
                                <hr/>
                            </div>
                        
                    </div>
                    {/* {console.log(this.state.appointmentMode)} */}
                    <div className={`col-md-6 col-sm-12 col-xs-12 calenderMargin ${(this.state.appointmentMode) ? "" : "blurEffectCalendar" }`}>
                        
            
                       <div style={{display: 'flex'}} ref={this.calendarRef}>
                       <div style={{position: 'absolute', textAlign: 'center', width:"100%", alignSelf:'center', cursor: 'not-allowed'}} className={`${(this.state.appointmentMode=="offline") ? "showButton" : "hideButton"}`}> 
                            <Button color="info" style={{border: '1.5px solid black', cursor: 'not-allowed'}}>
                                CALENDAR NOT REQUIRED FOR OFFLINE CONSULTANCY
                            </Button>
                        </div>
                        <div className={`${(this.state.appointmentMode == "offline") ? "blurEffectCalendar" : ""}`}>
                        <Calendar 
                            onChange={this.onCalendarChange}
                            value={this.state.date}
                        />
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
                        </div>
                        </div>
                        <div className="appointment-box">
                            <div className={`slot-prensentation ${(this.state.appointmentMode == "offline") ? "blurEffectCalendar" : ""}`}>
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
                        {/* {console.log("Appointment type is: "+this.state.appointmentType)} */}
                        <div>
                        {
                                    (this.state.appointmentMode == 'offline') ? (
                                    <div>
                                        <div className="chiller_cb pull-left" style={{marginLeft: 0, marginTop: "2vh"}}>
                                            <input id="myCheckbox2" type="checkbox" onChange={this.changeAppointmentType}/>
                                            <label for="myCheckbox2"> Tick if this is a follow-up appointment </label>
                                            <span>
                                                {/* ::before
                                                ::after */}
                                            </span>                                                
                                        </div>
                                        <div className="form-group">
                                            <button className="std-button" onClick={this.toggleOfflineClick}>
                                                Book Offline Appointment
                                            </button>
                                            
                                        </div>
                                    </div>) : (<div> </div>)
                        }

                        {
                                    (this.state.appointmentMode == 'online') ? (
                                        (this.state.dateSelected && this.state.slotClicked) ? (
                                            <div>
                                                <div className="chiller_cb pull-left" style={{marginLeft: 0, marginTop: "2vh"}}>
                                                    <input id="myCheckbox1" type="checkbox" onChange={this.changeAppointmentType}/>
                                                    <label for="myCheckbox1"> Tick if this is a follow-up appointment </label>
                                                    <span>
                                                        {/* ::before
                                                        ::after */}
                                                    </span>
                                                </div>
                                                <div className="form-group">
                                                    <button className="std-button" onClick={this.toggleOnlineClick}>
                                                        Book Online Slots
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <p>Select a valid date and slot from the interactive section above.</p>
                                            </div>
                                        )
                                    ) : (<div> </div>)
                        }

                       
                        </div>
                        
                        
                        </div>
                    </div>
                </div>

                <Modal isOpen={this.state.guideModalOpen} toggle={this.toggleGuideModal}>
                    <ModalHeader toggle={this.toggleGuideModal}>Note</ModalHeader>
                    <ModalBody>
                        In this page, you must select one of Online or Offline consultancy sections. To select, click on either, and proceed with booking your slot. Incase you want to change your preference later, you can click on your respective preference to switch to it.
                    </ModalBody>
                    <ModalFooter>
                    <Button color="primary" onClick={this.toggleGuideModal}>Okay</Button>
                    </ModalFooter>
                </Modal>


                <Modal isOpen={(this.state.payClick && !this.state.slotClicked) && !(this.state.payClick && this.state.payOfflineClick)} toggle={this.toggleErrorModal}>
                    <ModalHeader toggle={this.toggleErrorModal}>Error</ModalHeader>
                    <ModalBody>
                        You must select a valid slot before you proceed with payment.
                    </ModalBody>
                    <ModalFooter>
                    <Button color="primary" onClick={this.toggleErrorModal}>Okay</Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.notFollowupModal} toggle={this.toggleNotFollowupModal}>
                    <ModalHeader toggle={this.toggleNotFollowupModal}>Error</ModalHeader>
                    <ModalBody>
                        <p>Your appointment was not found to be a followup appointment, because of one of the following reasons:</p>
                        <p>1. You do not have any appointments in our records.</p>
                        <p>2. The request exceeded the maximum time limit for followups set by the doctor.</p>
                        <p>3. The  request was set for <b>BEFORE</b> an already existing appointment.</p>
                    </ModalBody>
                    <ModalFooter>
                    <Button color="primary" onClick={this.toggleNotFollowupModal}>Okay</Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.payOnlineClick && this.state.slotClicked} toggle={this.toggleOnlineClick}>
                    <ModalHeader toggle={this.toggleOnlineClick}>Online Consultancy Payment</ModalHeader>
                    <ModalBody>
                       
                            {
                                (this.state.doctorFeeData) ? (
                                    <div>
                                        <p>
                                            <b> Patient Name: </b> {this.state.dependentInfo.name}
                                        </p>
                                        <hr/>
                                        <p>
                                            <b> Appointment Mode: </b> Online
                                        </p>
                                        <hr/>
                                        <p>
                                            <b> Appointment Details: </b> {this.state.date.toString().slice(0,15)+" "+this.state.slotClicked}
                                        </p>
                                        <hr/>
                                        <p>
                                            <b> Appointment Fees: </b> {
                                                (this.state.appointmentType=="First Time") ? (<span> Rs. {this.state.doctorFeeData["firstTime_online"]} /-</span>) : (<span> Rs. {this.state.doctorFeeData["followup_online"]} /- (follow up)</span>)
                                            }
                                        </p>
                                    </div>
                                ) : (<div></div>)
                            }
                            
                        

                        <div style={{textAlign: 'center', marginTop:'2em'}}>
                            <button className="std-button primary" onClick={this.handlePayButton}>Continue</button>
                        </div>
                    </ModalBody>
                </Modal>

                <Modal isOpen={this.state.payOfflineClick} toggle={this.toggleOfflineClick}>
                <ModalHeader toggle={this.toggleOfflineClick}>Offline Consultancy Payment</ModalHeader>
                    <ModalBody>
                        
                            {
                                (this.state.doctorFeeData) ? (
                                    <div>
                                        <p>
                                            <b> Patient Name: </b> {this.state.dependentInfo.name}
                                        </p>
                                        <hr/>
                                        <p>
                                            <b> Appointment Mode: </b> Offline
                                        </p>
                                        <hr/>
                                        <p>
                                            <b> Appointment Details: </b> {(new Date()).toString().slice(0,15)+" "+moment(new Date()).format('LT')}
                                        </p>
                                        <hr/>
                                        <p>
                                            <b> Appointment Fees: </b> {
                                                (this.state.appointmentType=="First Time") ? (<span> Rs. {this.state.doctorFeeData["firstTime_offline"]} /-</span>) : (<span> Rs. {this.state.doctorFeeData["followup_offline"]} /- (follow up)</span>)
                                            }
                                        </p>
                                    </div>
                                ) : (<div></div>)
                            }
                            
                            
                        
                        <div style={{textAlign: 'center', marginTop:'2em'}}>
                            <button className="std-button primary" onClick={this.handlePayButton}>Continue</button>
                        </div>
                    </ModalBody>
                </Modal>

                <Modal isOpen={this.state.viewDocSlotsModal} toggle={this.toggleDocSlotsModal}>
                <ModalHeader toggle={this.toggleDocSlotsModal}>Doctor's operational timings</ModalHeader>
                    <ModalBody>
                        <div>
                            <p>
                                <b> The doctor operates on the following days: </b>
                            </p>
                            <hr/>

                            <p>
                                {
                                    (this.state.dObjArray) ? (
                                        this.state.dObjArray.map((obj, index) => {
                                            return(
                                                <div>
                                                    <span><b>{Object.keys(obj)[0]}:</b>&emsp;</span>
                                                        {
                                                            // console.log(obj[Object.keys(obj)[0]]),
                                                            (obj[Object.keys(obj)[0]]) ? (
                                                                // console.log("entered hotzone"),
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
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggleDocSlotsModal}>Okay</Button>
                    </ModalFooter>
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

                {
                    (this.state.allowedToRedirect) ? (
                        <Redirect push
                            to={{
                                pathname: `/${this.state.handleDocId}/ConsultancyForm`,
                            }} />
                    ) : (<div></div>)
                }
                <div ref={this.buttonsRef}>
                            
                </div>

            </div>
        </div>
        </body>
    );
}
}

export default Consultancy;