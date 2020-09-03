//import { google } from 'googleapis';
//import gapi from 'gapi-client'; 
const NodeGoogleDrive = require('node-google-drive-new');
const credentials = require('./proxy-google-drive.json');

console.log(credentials.client_email);

//const YOUR_ROOT_FOLDER = '1kHnuHHk6cp0M8DCNAeRX0B9zodkW1Mz5';
const YOUR_ROOT_FOLDER = '1D4gwvPNeCW3HFSPeoCTvknZO_4vhrgdc'; // id de mi carpeta de drive
const PATH_TO_CREDENTIALS = credential;

const googleDriveInstance = new NodeGoogleDrive({
  ROOT_FOLDER: YOUR_ROOT_FOLDER
});

//File -> arraybuffer 
// Let's wrap everything in an async function to use await sugar
async function UploadFileGDrive(file, name) {
  const creds_service_user = (PATH_TO_CREDENTIALS);

  let gdrive = await googleDriveInstance.useServiceAccountAuth(
    creds_service_user
  );

  let uploadResponse = await googleDriveInstance.create({
    source: file,
    parentFolder: YOUR_ROOT_FOLDER,
    name: name,
  }).catch(e => console.error(e));

  return uploadResponse
}

/* let reader = new FileReader()
reader.readAsArrayBuffer(userData.file)
reader.onload = (e) => {
  uploadFile(e.target.result, fileName)
    .then(() => {
      userData.file = fileName
      parseData(userData)
    }
    )
    .then(
      setLoad(false)
    )
} */

// Let's wrap everything in an async function to use await sugar
export default function uploadFile(file, name) {
  return UploadFileGDrive(file, name);
}