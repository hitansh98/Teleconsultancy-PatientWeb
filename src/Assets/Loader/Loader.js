import React, { Component } from 'react';
import Lottie from 'react-lottie';



import loadinganimation from '../Lottie/loading-animation.gif';


import { Modal, Input, ModalBody, ModalHeader, ModalFooter, Button,Form, FormGroup, Label, FormText, Spinner } from 'reactstrap';


const Loader = props => {
  const {
    loading,
    ...attributes
  } = props;

  

  return (
    <Modal isOpen={props.loading}>
        <ModalBody>
            <div style={{textAlign:'center'}}>
                <img src={loadinganimation} height={200} width={200} />
                <p style={{fontWeight:'heavy', fontSize:20, fontFamily: 'Roboto'}}> Loading ... </p>
            </div>
                
            {/* <Spinner type="grow" color="primary" />
            <Spinner type="grow" color="secondary" />
            <Spinner type="grow" color="success" />
            <Spinner type="grow" color="danger" />
            <Spinner type="grow" color="warning" />
            <Spinner type="grow" color="info" /> */}
        </ModalBody>
    </Modal>
  )
}

export default Loader;