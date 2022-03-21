import React, { useCallback } from 'react'
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'
import firebase from '../../Services/firebase';

function FileDropzone(props) {
    const getUploadParams = async ({ meta }) => {
        
        const url = 'https://httpbin.org/post'
        return { url }
    }

    const handleChangeStatus = ({ meta }, status) => {
        console.log(status, meta);
    }   

    const uploadingProcess = (allFiles) => {
        props.viewIsUploading(5);
        
        
        Promise.allSettled(allFiles.map((f, index) =>{

            var uploadTask = firebase.storage().ref().child(`/imagesTemp/${props.keyString}/${f.file.name}`).put(f.file,f.meta)
            .then(
                (snapshot) => {
                    console.log(index);
                    snapshot.ref.getDownloadURL().then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    props.changeUrlValue(downloadURL);
                    
                    props.viewIsUploading(2);

                    if(f.file.type.substring(0,5)=="image"){
                        // props.changeUrlValue();
                        return props.changeImageArray();
                    }
                    
                    if(f.file.type.substring(0,5)=="video"){
                        // props.changeUrlValue()
                        return props.changeVideoArray();
                    }
                    
                    });
                 
                }
            ).then(
                (snapshot) => {
                    console.log(allFiles.length);
                    console.log("entered here in then");
                    if(index == allFiles.length-1){
                        props.changeIsUploading();
                        props.toggleOpenUploadingModal();
                    }
                 }
            ) 
        })
        )
        
        
        return changeValues(allFiles);
    }

    const handleSubmit = async (files, allFiles) => {
        props.viewIsUploading(0);
        props.changeIsUploading();
        props.viewIsUploading(1);
        
        uploadingProcess(allFiles);
    }

    const changeValues = (allFiles) => {

        allFiles.forEach(f => f.remove())
        
        props.viewIsUploading(4);
    }

    return (
        <Dropzone
            getUploadParams={getUploadParams}
            onChangeStatus={handleChangeStatus}
            onSubmit={handleSubmit}
            accept="image/*,video/*"
            submitButtonContent={'Upload'}
            inputContent={(files, extra) => (extra.reject ? 'Image or video files only' : 'Upload images/videos by click or drop')}
            styles={{
                dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
                previewImage: {width: 150, height: 150, maxWidth:200, maxHeight:200},
            }}
        />
    )

}

export default FileDropzone;