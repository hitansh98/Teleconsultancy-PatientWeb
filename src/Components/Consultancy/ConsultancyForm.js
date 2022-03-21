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
    NavbarText } from 'reactstrap';

import firebase from '../../Services/firebase';
import FileDropzone from '../../Assets/Dropzone/Dropzone';
import moment from "moment";
import Razorpay from 'razorpay';
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";

import { Spinner } from 'reactstrap';
import Loader from '../../Assets/Loader/Loader';
import Uploaded from '../../Assets/Loader/Uploaded';
import ImageGallery from 'react-image-gallery';

const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2
    }
  };

class ConsultancyForm extends Component{

    constructor(props){
        super(props);
        console.log(props.location.state);
        this.state = {
            isLoading : false,
            dataNotFilled : false,
            dataNotFilledModal : false,
            finalAnswersArray: [],
            urlValue : '',
            imagesArray : [],
            videosArray : [],
            diagnosisFormMedia: [],
            isUploading: false,
            hasUploaded: false,
            animationSeen: false,
            handleDocId : this.props.match.params.handle,
            imageGalleryModal : false,
            mediaItems : [],
            sessionExpired: false,
        };

        // console.log(this.state.appointmentType);
        // console.log(this.state.appointmentMode);
    }

    componentDidMount = async() => {
        
        this.setState({isLoading: true});
        await this.setValuesFromLocalStorage();
        this.fetchDoctorData(); 
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

    setValuesFromLocalStorage = () => {
        const dI = localStorage.getItem('doctorId');
        const udn = localStorage.getItem('userDependentName');
        const udi = localStorage.getItem('userDependentId');
        const udr = localStorage.getItem('userDependentRelation');
        const udg = localStorage.getItem('userDependentGender');
        const uI = localStorage.getItem('userId');
        const sS = localStorage.getItem('slotSelected');
        const dS = localStorage.getItem('dateSelected');
        const aM = localStorage.getItem('appointmentMode');
        const aT = localStorage.getItem('appointmentType');
        const lA1 = localStorage.getItem('lastAppointment');
        const dpan = localStorage.getItem('doctorPaymentAlternativeOnline');
        const dpaf = localStorage.getItem('doctorPaymentAlternativeOffline');
        console.log(lA1);
        let lA = "";
        if(lA1!="undefined"){
            lA = JSON.parse(lA1);
        }

        this.setState({doctorId : dI});
        this.setState({userId: uI});
        this.setState({ dependentInfo: {
            name : udn,
            id: udi,
            relation: udr,
            gender: udg,
        }});

        console.log(udn);
        console.log(udi);
        console.log(udr);



        this.setState({slotSelected : sS});
        this.setState({dateSelected : new Date(dS)});
        this.setState({appointmentMode : aM.substring(0,1).toUpperCase()+aM.substring(1)});
        this.setState({appointmentType : aT});
        this.setState({lastAppointment : lA });
        this.setState({doctorPaymentAlternativeOnline : dpan});
        this.setState({doctorPaymentAlternativeOffline : dpaf});

    }

    fetchDoctorData = async() => {
        let dbref = firebase.database().ref(`doctors/${this.state.doctorId}`);
        console.log(this.state.lastAppointment);
        // console.log(this.state.dateSelected.toLocaleDateString("en-GB"));

        

    

        dbref.once("value").then((snap) => {
            let data = snap.val();
            let quesArray = [];
            let typeArray = [];
            let ansArray = [];
            console.log(data);
            this.setState({doctorData : data});
            this.setState({doctorName: data["name"]});
            for(var i=0;i<Object.keys(data["diagnosisFormData"]).length;i++){
                let tempArray = [];
                quesArray.push(data["diagnosisFormData"][i+1]["ques"]);
                typeArray.push(data["diagnosisFormData"][i+1]["type"]);

                if(data["diagnosisFormData"][i+1]["type"]=="text"){
                    tempArray.push(0);
                }
                else{
                    for(var j=0;j<data["diagnosisFormData"][i+1]["options"].length-1;j++){
                        tempArray.push(data["diagnosisFormData"][i+1]["options"][j+1]);
                    }
                }
                
                ansArray.push(tempArray);
            }
            // console.log(quesArray);
            // console.log(ansArray);
            this.setState({ diagnosisFormMedia: data["diagnosisFormMedia"]});
            this.setState({ diagnosisFormQuestionData: quesArray});
            this.setState({ diagnosisFormTypeData: typeArray});
            this.setState({ diagnosisFormAnswerData : ansArray});

            if(this.state.appointmentType == "Follow up"){
                let previousFormData = [];
                let previousFormObj = [];
                console.log(typeof(this.state.lastAppointment));
                let previousAppointmentDate = this.state.lastAppointment["date"];
                let previousAppointmentTime = this.state.lastAppointment["timeBegin"];
                console.log(this.state.lastAppointment["diagnosisForm"]["form"]);
                if(this.state.lastAppointment["diagnosisForm"]["form"])
                {
                    previousFormObj = previousFormData.concat(this.state.lastAppointment["diagnosisForm"]["form"]);
                    previousFormData = this.state.lastAppointment["diagnosisForm"]["form"];
                    let previousAppointmentAddInfo = this.state.lastAppointment["diagnosisForm"]["additionalInfo"];
                    if(this.state.lastAppointment["media"]){
                        let previousAppointmentMediaObj = this.state.lastAppointment["media"]["images"];
                        let previousAppointmentMedia = [];
                        for(let i=0;i<Object.keys(previousAppointmentMediaObj).length;i++){
                            previousAppointmentMedia[i] = previousAppointmentMediaObj[i];
                        }
                        this.setState({previousAppointmentMedia});
                    }
                    previousFormData.shift();
                    this.setState({previousAppointmentAddInfo})
                    this.setState({previousFormData});
                    this.setState({previousFormObj});
                }
                this.setState({ previousAppointmentDate});
                this.setState({ previousAppointmentTime});
            }

            

            let dateSelect = this.state.dateSelected;
            console.log(dateSelect);
            var options = {year: '2-digit', month: '2-digit', day: '2-digit' };
            let formatDate = dateSelect.toLocaleDateString("en-GB", options);
            let formatDate1 = formatDate.replace(/\//g,"");
            let formatDate2 = formatDate.replace(/\//g,".");

            let formatTime = this.state.slotSelected.replace(/\s/g, "");

            ///////////////////////////

            const dateNow = new Date();

            let formatNowDate = dateNow.toLocaleDateString("en-GB", options);
            let formatNowDate1 = formatNowDate.replace(/\//g,"");
            let formatNowDate2 = formatNowDate.replace(/\//g,".");

            // let formatNowTime = dateNow.toLocaleTimeString('en-US');
            // let formatNowTime1 = formatNowTime.replace(/\s/g ,"");

            let formatNowTime = dateNow.toLocaleTimeString('en-US');
            let momNowTime = moment(dateNow);
            let momNowTimeFormat = momNowTime.format('LT');
            let formatNowTime1 = momNowTimeFormat.replace(/\s/g ,"");
            let formatNowTime2 = momNowTimeFormat.replace(/\s/g ,".");
            console.log(formatNowDate2+" "+formatNowTime1);
            
            let keyStr = "APPMT-"+this.state.userId+"-"+this.state.doctorId+"-"+formatDate1+"-"+formatTime+"-d"+this.state.dependentInfo.id;
            
            let paymentStr = "PYMT-"+this.state.userId+"-"+this.state.doctorId+"-"+formatNowDate1+"-"+formatNowTime1;

            console.log(paymentStr);

            this.setState({ paymentStr });
            this.setState({ keyString: keyStr });

        }).then(this.setState({isLoading: false}));
    }

    handleAnswerChange = (key) => (event) => {
        // console.log(this.state.userName);
        let ans = event.target.value;
        this.setState({ [key]: ans});
        console.log(key);
        console.log(ans);

        if(key.substring(0,4)=="Answ"){
            let str = `${key.substring(4)}${ans}`;
            let index = parseInt(`${key.substring(4)}`);
            let finalAnswersArray = this.state.finalAnswersArray;
            
            finalAnswersArray[index-1] = str;
            this.setState({ finalAnswersArray });
        }
        if(key.substring(0,4)=="Resp"){
            let str = `${key.substring(4)}${ans}`;
            let index = parseInt(`${key.substring(4)}`);
            let finalAnswersArray = this.state.finalAnswersArray;

            finalAnswersArray[index-1] = str;
            this.setState({ finalAnswersArray });
        }
    }

    handleFollowUpClick = async() => {
        if(!(this.state.additionalInfo)){
            //.log('entered');
            await this.setState({ dataNotFilled : true });
            await this.setState({ dataNotFilledModal : true });
        }
        else{
            await this.setState({ dataNotFilled : false });
        }
        if(!this.state.dataNotFilled){
            let updates = {};

            let dateSelect = this.state.dateSelected;
            var options = {year: '2-digit', month: '2-digit', day: '2-digit' };
            let formatDate = dateSelect.toLocaleDateString("en-GB", options);
            let formatDate1 = formatDate.replace(/\//g,"");
            let formatDate2 = formatDate.replace(/\//g,".");

            let formatTime = this.state.slotSelected.replace(/\s/g, "");

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

            ///////////////////////////

            console.log("entered follow up submit click");

            let keyStr = "APPMT-"+this.state.userId+"-"+this.state.doctorId+"-"+formatDate1+"-"+formatTime+"-d"+this.state.dependentInfo.id;
            
            console.log(this.state.previousFormObj);
            console.log(this.state.previousAppointmentMedia);
            console.log(moment(new Date()).format('DD.MM.YY h:m A'));
            let bigFormObj = {
                "form" : this.state.previousFormObj,
                "additionalInfo" : this.state.previousAppointmentAddInfo+"\n"+this.state.additionalInfo+" (as of "+moment(new Date()).format('DD.MM.YY hh:mm A')+")",
            };
            
            let mediaObj = {};
            if(this.state.previousAppointmentMedia){
                mediaObj = {
                    "images" : [...this.state.previousAppointmentMedia, this.state.imagesArray],
                    "video" : this.state.videosArray
                }
            }else{
                mediaObj = {
                    "images" : this.state.imagesArray,
                    "video" : this.state.videosArray
                }
            }

            updates[`appointments/${this.state.keyString}/diagnosisForm`] = bigFormObj;
            updates[`appointments/${this.state.keyString}/media`] = mediaObj;
            await firebase.database().ref().update(updates);

            console.log("even finished uploads");

            this.setState({hasUploaded: true});
        }
    }

    handleSubmitClick = async() => {

        let flag = true;
        for(let i=0;i<this.state.diagnosisFormQuestionData.length;i++){
            console.log(i+" "+this.state.finalAnswersArray[i]);
            if(this.state.finalAnswersArray[i] == undefined){
                this.state.finalAnswersArray[i] = false;
            }
            flag = flag && this.state.finalAnswersArray[i];
            console.log(flag);
        }
        if(!(flag && this.state.additionalInfo)){
            //.log('entered');
            await this.setState({ dataNotFilled : true });
            await this.setState({ dataNotFilledModal : true });
        }
        else{
            await this.setState({ dataNotFilled : false });
        }

        console.log(this.state.dataNotFilled);
        if(!this.state.dataNotFilled){

            console.log("must not enter before everything filled");
            let updates = {};
            let dateSelect = this.state.dateSelected;
            var options = {year: '2-digit', month: '2-digit', day: '2-digit' };
            let formatDate = dateSelect.toLocaleDateString("en-GB", options);
            let formatDate1 = formatDate.replace(/\//g,"");
            let formatDate2 = formatDate.replace(/\//g,".");

            let formatTime = this.state.slotSelected.replace(/\s/g, "");

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

            ///////////////////////////

            console.log("entered submit click");

            let keyStr = "APPMT-"+this.state.userId+"-"+this.state.doctorId+"-"+formatDate1+"-"+formatTime+"-d"+this.state.dependentInfo.id;
            
            let formObj = {};
            // console.log(this.state.diagnosisFormQuestionData);
            if(this.state.diagnosisFormQuestionData){
                for(var i=0;i<this.state.diagnosisFormQuestionData.length;i++){
                    let answer = [];
                    formObj[i+1] = {};
                    // console.log("entered");
                    for(var j=0;j<this.state.finalAnswersArray.length;j++){
                        // console.log(this.state.finalAnswersArray[j].substring(0,1)+" "+(i+1).toString());
                        console.log(this.state.finalAnswersArray);
                        if(this.state.finalAnswersArray[j].substring(0,1) == (i+1).toString()){
                            console.log(j+this.state.finalAnswersArray[j]);
                            answer.push(this.state.finalAnswersArray[j].substring(1));
                        }
                    }
                    formObj[i+1]["ques"] = this.state.diagnosisFormQuestionData[i];
                    formObj[i+1]["ans"] = answer[0];
                }
            }

            let bigFormObj = {
                "form" : formObj,
                "additionalInfo" : this.state.additionalInfo+" (as of "+moment(new Date()).format('DD.MM.YY hh:mm A')+")",
            };
            
            let mediaObj = {
                "images" : this.state.imagesArray,
                "video" : this.state.videosArray
            }

            updates[`appointments/${this.state.keyString}/diagnosisForm`] = bigFormObj;
            updates[`appointments/${this.state.keyString}/media`] = mediaObj;
            await firebase.database().ref().update(updates);

            console.log("even finished uploads");

            this.setState({hasUploaded: true});
        }
    }

    changeImageArray = () => {
        this.setState((prevState) => {
            const imagesArray = [...prevState.imagesArray, prevState.urlValue];
            const mediaItems = [...prevState.mediaItems, { "original" : prevState.urlValue, "thumbnail" : prevState.urlValue}]
            return{
                imagesArray,
                mediaItems
            };
        });
    }


    changeVideoArray = () => {
        this.setState((prevState) => {
            const videosArray = [...prevState.videosArray, prevState.urlValue];
            return{
                videosArray
            };
        });
    }

    changeUrlValue = (url) => {
        this.setState({ urlValue: url });
    }

    changeIsUploading = () => {
        this.setState(prevState=>{
            return{
                ...prevState,
                isUploading: !prevState.isUploading,
            }
        });
    }

    viewIsUploading = (num) => {
        console.log(this.state.isUploading+" "+num);
    }

    toggleHasUploaded = () => {
        this.setState(prevState=>{
            return{
                ...prevState,
                hasUploaded: !prevState.hasUploaded,
            }
        });
        this.setState({animationSeen: true});
    }

    handleCarouselClick = () => {
        console.log("carousel clicked");
        this.toggleImageGalleryModal();
    }

    toggleImageGalleryModal = () => {
        this.setState(prevState=>{
            return{
                ...prevState,
                imageGalleryModal: !prevState.imageGalleryModal,
            }
        });
    }
    
    toggleErrorModal = () => {
        this.setState(prevState=>{
            return{
                ...prevState,
                dataNotFilledModal: !prevState.dataNotFilledModal,
            }
        });
    }

    toggleMediaErrorModal = () => {
        this.setState(prevState=>{
            return{
                ...prevState,
                mediaNotUploaded: !prevState.mediaNotUploaded,
            }
        });
    }

    toggleOpenUploadingModal = () => {
        this.setState(prevState=>{
            return{
                ...prevState,
                openUploadingModal: !prevState.openUploadingModal,
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


    
    render(){
        return(
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

                    <div class="col-md-12 col-sm-12 col-xs-12 Consultancy-box">
                        
                        {
                            (this.state.appointmentType=="First Time") ? (
                                <h2>{this.state.appointmentMode} Consultancy</h2>
                            ) : (<h2>{this.state.appointmentType} {this.state.appointmentMode} Consultancy</h2>)
                        }


                        <div class="consultancy-section">
                            <div className="row">
                                <div class="col-md-6 col-sm-12 col-xs-12">
                                    <div class="question-box">
                                    {
                                        
                                        <div>
                                            {
                                                (this.state.dependentInfo) ? (
                                                        (this.state.appointmentType == "Follow up") ? (
                                                            <h4>Hello {this.state.dependentInfo.name+"! "}Your previous answers are</h4>
                                                        ) : (
                                                            <h4>Hello {this.state.dependentInfo.name+"! "}Answer the general questions</h4>
                                                        )
                                                ) : (
                                                    <div> </div>
                                                )
                                                
                                            }

                                            {
                                                (this.state.appointmentType == "Follow up") ? (
                                                    (this.state.diagnosisFormQuestionData) ? (
                                                        this.state.diagnosisFormQuestionData.map((obj, index) => {
        
                                                               return(
                                                                   <div class="question-set">
                                                                       <p>{obj}</p>
                                                                       {
                                                                           (this.state.previousFormData) ? (
                                                                            //    this.state.diagnosisFormAnswerData[index].map((ans, ind) => {
                                                                            //        return(
                                                                            //        <div class="chiller_cb">
                                                                            //            <input id={`myCheckbox${index}${ind}`} type="radio" name={`Resp${index+1}`} value={ans} onChange={this.handleAnswerChange(`Resp${index+1}`)}/>
                                                                            //            <label for={`myCheckbox${index}${ind}`}>{ans}</label>
                                                                            //            <span></span >
                                                                            //        </div>
                                                                            //        );
                                                                            //    })
                                                                            (this.state.previousFormData[index]) ? (
                                                                                <p style={{fontWeight: 'bold', fontSize: 18}}><span style={{fontWeight: 'bolder'}}>Ans:</span> {this.state.previousFormData[index]["ans"]}</p>
                                                                            ) : (<div></div>)
                                                                           
                                                                           ) : (<div style={{width: '100%', textAlign:'center', marginTop:'5vh'}}><Spinner style={{width:"2rem", height:"2rem"}} color="dark" /></div>)
                                                                       }
                                                                   </div>
                                                               )
                                                           })
                                                   ) : (<div style={{width: '100%', textAlign:'center', marginTop:'5vh'}}><Spinner style={{width:"2rem", height:"2rem"}} color="dark" /></div>)
                                                ) : (
                                                    (this.state.diagnosisFormQuestionData) ? (
                                                        this.state.diagnosisFormQuestionData.map((obj, index) => {
        
                                                               return(
                                                                   <div class="question-set">
                                                                       <p>{obj}{" "}<sup style={{color:'red'}}>(required)</sup></p>
                                                                       {
                                                                           (this.state.diagnosisFormTypeData) ? (
                                                                               (this.state.diagnosisFormTypeData[index] == "text") ? (
                                                                                    <div>
                                                                                        <textarea id={`myText${index}`} type="text" name={`Answ${index+1}`} placeholder="Enter your response" onChange={this.handleAnswerChange(`Answ${index+1}`)}></textarea>
                                                                                    </div>
                                                                               ) :(
                                                                                (this.state.diagnosisFormAnswerData) ? (
                                                                                    this.state.diagnosisFormAnswerData[index].map((ans, ind) => {
                                                                                        return(
                                                                                        <div class="chiller_cb">
                                                                                            <input id={`myCheckbox${index}${ind}`} type="radio" name={`Resp${index+1}`} value={ans} onChange={this.handleAnswerChange(`Resp${index+1}`)}/>
                                                                                            <label for={`myCheckbox${index}${ind}`}>{ans}</label>
                                                                                            <span></span>
                                                                                        </div>
                                                                                        );
                                                                                    })
                                                                                ) : (<div style={{width: '100%', textAlign:'center', marginTop:'5vh'}}><Spinner style={{width:"2rem", height:"2rem"}} color="dark" /></div>)
                                                                               )
                                                                            
                                                                           ) : (<div style={{width: '100%', textAlign:'center', marginTop:'5vh'}}><Spinner style={{width:"2rem", height:"2rem"}} color="dark" /></div>)
                                                                           
                                                                       }
                                                                   </div>
                                                               )
                                                           })
                                                   ) : (<div style={{width: '100%', textAlign:'center', marginTop:'5vh'}}><Spinner style={{width:"2rem", height:"2rem"}} color="dark" /></div>)
                                                )
                                                
                                            }
                                        </div>
                                    }
                                    

                                </div>

                                </div>
                                {
                                     (this.state.isLoading || !this.state.diagnosisFormQuestionData || this.state.isUploading) ? 
                                     (<Loader loading={this.state.isLoading || this.state.isUploading || !this.state.diagnosisFormQuestionData} />) 
                                     : (<div></div>)
                                }

                                <div class="col-md-6 col-sm-12 col-xs-12">
                                    <div class="offlin-collection">
                                        <h4>Upload photos/videos </h4><br/>
                                        <p>Upload some images of your infected eyes or take a video. Please see the demo video wich shows how to take pictures to send the doctor.</p>

                                        <div class="demo-videobox">
                                            <iframe width="100%" height="315" src={this.state.diagnosisFormMedia.videoUrl} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                        </div>
                                        
                                        
                                       
                                       

                                       {
                                           (this.state.appointmentType == 'Follow up') ? (
                                               <div onClick={this.handleCarouselClick}>
                                                    <Carousel responsive={responsive}>
                                                        {
                                                            (this.state.previousAppointmentMedia) ? (
                                                                this.state.previousAppointmentMedia.map((imgUrl)=> {
                                                                    return(
                                                                        <div>
                                                                            <img src={`${imgUrl}`}  width='125' height='100'/>
                                                                        </div>
                                                                    )
                                                                })
                                                            ) : (
                                                                <div></div>
                                                            )
                                                        }
                                                    </Carousel>
                                                </div>
                                           ) : (
                                                <div>
                                                    <Button color="success" onClick={this.toggleOpenUploadingModal}> Upload Photos</Button>
                                                    <br/><br/>
                                                    <Carousel responsive={responsive} onClick={this.handleCarouselClick}>
                                                    {
                                                        (this.state.imagesArray) ? (
                                                            this.state.imagesArray.map((imgUrl)=> {
                                                                return(
                                                                    <div>
                                                                        <img src={`${imgUrl}`} width='125' height='100'/>
                                                                    </div>
                                                                )
                                                            })
                                                        ) : (
                                                            <div></div>
                                                        )
                                                    }
                                                    </Carousel>
                                                </div>
                                           )
                                       }

                                        <br/>
                                        {
                                            (this.state.appointmentType == 'Follow up') ? (
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <div class="form-group">
                                                            <label>Additional Information <sup style={{color:'red'}}>(required)</sup></label>
                                                            <p style={{fontWeight: 'bold', fontSize: 18}}><span style={{fontWeight: 'bolder'}}>Ans:</span> {this.state.previousAppointmentAddInfo}</p>
                                                            <textarea placeholder="Enter some symptoms, notes about the ailment." onChange={this.handleAnswerChange('additionalInfo')}></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <div class="form-group">
                                                            <label>Additional Information <sup style={{color:'red'}}>(required)</sup></label>
                                                            <textarea placeholder="Enter some symptoms, notes about the ailment." onChange={this.handleAnswerChange('additionalInfo')}></textarea>
                                                        </div>
                                                    </div>
                                                </div>  
    
                                            )
                                        }
                                       
                                        {/* {console.log(this.state.urlValue)}
                                        {console.log(this.state.imagesArray)} */}

                                        <div style={{width: '100%', textAlign:'center', marginTop:'3vmin'}}>
                                            {
                                                (this.state.appointmentType == "Follow up") ? (
                                                    <button className="std-button primary" onClick={this.handleFollowUpClick}>
                                                    Submit
                                                </button>
                                                ) : (
                                                    <button className="std-button primary" onClick={this.handleSubmitClick}>
                                                    Submit
                                                </button>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    (this.state.hasUploaded) ? (<Uploaded toggleHasUploaded={this.toggleHasUploaded} loading={this.state.hasUploaded} />) : (<div> </div>)
                }
                
                <Modal isOpen={this.state.dataNotFilledModal} toggle={this.toggleErrorModal}>
                    <ModalHeader toggle={this.toggleErrorModal}>Error</ModalHeader>
                    <ModalBody>
                        Please fill out all required details in the form before submitting.
                    </ModalBody>
                    <ModalFooter>
                    <Button color="primary" onClick={this.toggleErrorModal}>Okay</Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.openUploadingModal}>
                    <ModalHeader toggle={this.toggleOpenUploadingModal}>Upload Media</ModalHeader>
                    <ModalBody>
                        <FileDropzone 
                            keyString={this.state.keyString} 
                            changeImageArray={this.changeImageArray} 
                            changeVideoArray={this.changeVideoArray} 
                            changeUrlValue={this.changeUrlValue} 
                            changeIsUploading={this.changeIsUploading} 
                            viewIsUploading={this.viewIsUploading}
                            toggleOpenUploadingModal={this.toggleOpenUploadingModal}
                        />
                    </ModalBody>
                </Modal>

                <Modal isOpen={this.state.mediaNotUploaded} toggle={this.toggleMediaErrorModal}>
                    <ModalHeader toggle={this.toggleMediaErrorModal}>Error</ModalHeader>
                    <ModalBody>
                        Please finish uploading your files to the server before submitting.
                    </ModalBody>
                    <ModalFooter>
                    <Button color="primary" onClick={this.toggleMediaErrorModal}>Okay</Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.imageGalleryModal} toggle={this.toggleImageGalleryModal}>
                    <div style={{width:'100%', height: '100%'}}>
                        <ImageGallery items={this.state.mediaItems} />
                    </div>
                </Modal>
                {
                    (this.state.animationSeen) ? (<Redirect push to={{
                        pathname : `/${this.state.handleDocId}/Thankyou`,
                    }} />) : (<div></div>)
                }
            </div>
        </div>
        </body>
    )
    }

}

export default ConsultancyForm;