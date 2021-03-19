require('dotenv').config()

///Both the front-end and the back-end must use a single network endpoint
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const { admin, firestore, auth } = require("./firebase")
const multer = require('multer');
var upload = multer();
const fs = require('fs');

//const {Storage} = require ('@google-cloud/storage');
const { DownloaderHelper } = require('node-downloader-helper');
const fileUpload = require('express-fileupload');

const json2xls = require ('json2xls');
const { fstat } = require('fs');
let bucketName = 'gs://ta-course-matching-app.appspot.com';

const app = express();
const coursesRef = firestore.collection('courses')


app.use(cors());

app.use(express.static(path.join(__dirname, '/client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());

//ROUTES
function findColumn(json, name) {
    for (let i in json[0]) {
        if (json[0][i] === name) {
            return i;
        }
    }
    return undefined;
}

app.post('/api/admin/matchTA', (req, res) => {
    const { applicantJSON, coursesJSON } = req.body;

    //COLUMN LOCATIONS
    let courseLocation = [findColumn(applicantJSON, 'Course Code'), findColumn(coursesJSON, 'Course Code')];
    let emailLocation = findColumn(applicantJSON, 'applicant email');
    let courseRankLocation = findColumn(applicantJSON, 'Course Rank');
    let courseHoursLocation = findColumn(applicantJSON, '5or10 hrs');
    let prioritizationLocation = findColumn(applicantJSON, 'Applicant status ( 1- Fundable, 2-NotFundable,3-External)');
    let nameLocation = findColumn(applicantJSON, 'Applicant Name');

    // INPUT VALIDATION
    let acceptedIndividuals = [];
    if (courseLocation[0] === undefined || courseLocation[1] === undefined) {
        //excel file does not specify course codes and therefore we cannot process it
        return res.end();
    }
    for (let i of applicantJSON) {
        for (let j of coursesJSON) {
            if (j[courseLocation[1]] === i[courseLocation[0]]) {
                acceptedIndividuals.push(i);
                break;
            }
        }
    }
    //first row is headers
    acceptedIndividuals.shift();

    let userArray = [];
    //SCHEMA: [Course Code, Applicant Name, Applicant Email, prioritization, ApplicantScore, ProfScore, ProfRankScore, Hours, qualificationFactor]
    for (let i in acceptedIndividuals) {
        userArray.push([acceptedIndividuals[i][courseLocation[0]], acceptedIndividuals[i][nameLocation], acceptedIndividuals[i][emailLocation], acceptedIndividuals[i][prioritizationLocation], undefined, undefined, undefined, acceptedIndividuals[i][courseHoursLocation]]);
    }

    //CALCULATE SCORES
    //STD-13
    let applicantScoreMap = new Map();
    for(let i in acceptedIndividuals) {
        let mapResult = applicantScoreMap.get(acceptedIndividuals[i][emailLocation]);
        if(mapResult === undefined) {
            applicantScoreMap.set(acceptedIndividuals[i][emailLocation], 1);
        }
        else {
            applicantScoreMap.set(acceptedIndividuals[i][emailLocation], mapResult + 1);
        }
    }
    for(let i in acceptedIndividuals) {
        let ranking = acceptedIndividuals[i][courseRankLocation];
        let max = applicantScoreMap.get(acceptedIndividuals[i][emailLocation]);
        userArray[i][4] = Math.round(((max - (ranking - 1))/max) * 100) / 100;
    }

    //STD-14
    for(let i in acceptedIndividuals) {
        let questions = 0;
        let yesCount = 0;
        for(let j of acceptedIndividuals[i]) {
            if (typeof j == 'string') {
                if (j.includes('?')) {
                    questions++;
                } else if (j.includes('yes')) {
                    yesCount++;
                }
            }
        }
        userArray[i][5] = yesCount / questions;
    }

    //RANKING ALGORITHM
    for(let i of userArray) {
        //FORMULA: ApplicantScore*0.7 + ProfScore*0.3 + ProfRankScore*0;
        i[8] = i[4]*0.7 + i[5]*0.3 + 0;
    }

    //STD-15
    //Sorts all applications by status and qualificationFactor (status takes priority)
    userArray = userArray.sort((a, b) => {
        let n = a[3] - b[3];
        if (n !== 0) {
            return n;
        }
        return b[8] - a[8];
    })

    //Holds objects including courseCode, hours needed, and TAs array
    let courses = []
    //CREATING COURSES OBJECTS IN COURSES ARRAY
    for (i = 1; i < coursesJSON.length; i++) {
        let course = {
            courseCode: coursesJSON[i][0],
            hoursToFill: 20,
            TAs: []
        }
        courses.push(course);
    }

    // //adding TAs to courses based off of previous sort
    while(userArray.length > 0) {
        let requestedCourse = userArray[0][0];
        let coursePosition;

        for (i = 0; i < courses.length; i++) {
            if (requestedCourse == courses[i].courseCode) {
                coursePosition = i;
                break;
            }
        }

        if ((courses[coursePosition].hoursToFill - userArray[0][7]) >= 0) {
            confirmedTA = userArray[0];
            courses[coursePosition].TAs.push(confirmedTA[2])
            userArray = userArray.filter(user => user[2] !== confirmedTA[2]);
        }
    }

    res.send(courses);
})

app.post('/api/admin/createUser', (req, res) => {
    let { email, password } = req.body;
    admin.auth().createUser({
        email: email,
        emailVerified: false,
        password: password,
        disabled: false,
      })
      .then((userRecord) => {
        console.log('Successfully created new user:', userRecord.uid);
        return res.send("Account successfully created!");
      })
      .catch((error) => {
        console.log('Error creating new user:', error);
        return res.send("Server error encountered.");
      });
})

/*app.post('/api/admin/sendApplicants', upload.single('excel'), async (req,res)=>{
    let { file } = req.body;
    console.log(req.file);
    console.log(req.body);
    await storage.bucket(bucketName).upload(req.file);
    res.end();
})*/

app.post('/api/admin/sendApplicants', async (req,res)=>{
    const {applicantJSON} = req.body;
    console.log(applicantJSON);

    var xls = json2xls(applicantJSON);

    fs.writeFileSync('data.xlsx',xls,'binary');

    res.end();
})

//downloads the file containing all the information of the applicants
app.get('/api/professor/getInfo',(req, res) => {
    //const url = ".xlsx";
    //const fileName = path.basename(url); 
    //const fileStream = fs.createWriteStream(fileName);
    //res.pipe(fileStream);
    const downloader = new DownloaderHelper("./data.xlsx");
    downloader.on('end',()=> console.log("Download Completed"))
    downloader.start();
    
})


app.post('/api/admin/addCourse', (req, res) => {
    let {courseCode, professor}  = req.body;
    coursesRef.doc(courseCode).set(
        {courseCode: courseCode, professor: professor, description: "", questions:""},
        {merge: true})
    res.end();
})

app.post('/api/professor/addDescription', async (req,res) =>{
    let { professor, courseCode, description, questions } = req.body; //questions = []

    const courseRef = coursesRef.doc(courseCode);

    const doc = await courseRef.get();

    console.log(doc.data().professor);


    if(doc.data().professor == professor){
        if(courseRef != null){ 
            courseRef.set({questions: questions, description: description}, {merge:true})
        } else { 
            console.log("course does not exist");
        }
       
    } else {
        console.log("Professor does not exist");
    
    }
    res.end();
})

//get course data
app.get('/api/admin/getCourseData', async (req, res) => {

    let data = [];

    //get all docs in collection
    const snapshot = await coursesRef.get();
    if (snapshot.empty) {
        console.log('No matching documents.');
        res.end();
    }

    snapshot.forEach(doc => {
        data.push(doc.data()); //store data in array
    });

    res.send(data);
})

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(5000);