require('dotenv').config()

///Both the front-end and the back-end must use a single network endpoint
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');
const { admin, firestore, auth } = require("./firebase")

const app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, '/client/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//ROUTES
function findColumn(json, name) {
    for (let i in json[0]) {
        if (json[0][i] === name) {
            return i;
        }
    }
    return undefined;
}

function distributeTAs(acceptedIndividuals, coursesJSON) {
    let applications = [];



    //Sorts all applications by status and qualificationFactor (status takes priority)
    applications = applications.sort((a, b) => {
        let n = a.status - b.status;
        if (n !== 0) {
            return n
        }
        return b.qualificationFactor - a.qualificationFactor
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

    console.log(applications);

    //adding TAs to courses based off of previous sort
    for (i = 0; i < applications.length; i++) {
        let requestedCourse = applications[i].course;

        let coursePosition;

        for (i = 0; i < courses.length; i++) {
            if (requestedCourse == courses[i].courseCode) {
                coursePosition = i;
                break;
            }
        }

        if ((courses[coursePosition].hoursToFill - applications[i].hours) >= 0) {
            confirmedTA = applications[i];
            courses[coursePosition].TAs.push(confirmedTA.email)
            applications = applications.filter(application => application.email != confirmedTA.email);
        }
    }
}

app.post('/api/admin/matchTA', (req, res) => {
    const { applicantJSON, coursesJSON } = req.body;

    // INPUT VALIDATION
    let acceptedIndividuals = [];
    let courseLocation = [findColumn(applicantJSON, 'Course Code'), findColumn(coursesJSON, 'Course Code')];
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
    //SCHEMA: [Course Code, Applicant Name, Applicant Email, PrioScore, ApplicantScore, ProfScore, ProfRankScore, Hours]
    for (let i in acceptedIndividuals) {
        userArray.push([acceptedIndividuals[i][0], acceptedIndividuals[i][1], acceptedIndividuals[i][2], undefined, undefined, undefined, undefined, acceptedIndividuals[i][4]]);
    }

    //CALCULATE SCORES
    //STD-13
    let applicantScoreMap = new Map();
    let emailLocation = findColumn(applicantJSON, 'applicant email');
    let courseRankLocation = findColumn(applicantJSON, 'Course Rank');
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

    // //STD-14
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
    console.log(userArray);






    //console.log(distributeTAs(acceptedIndividuals, coursesJSON));

    // //check STD-14
    // let updatedArray = [];
    // [course, name, email, status, ta hours, score, profScore]





    // //check STD-15
    // let firstPriority =[];
    // let secondPriority =[];
    // let thirdPriority = [];

    // for(let i of applicantJSON){
    //     if(i[priorityLocation]==1)
    //         firstPriority.push(i);
    //     else if (i[priorityLocation]==2)
    //         secondPriority.push(i);
    //     else
    //         thirdPriority.push(i);
    // }

    // let priorityLocation = findColumn(applicantJSON, 'Applicant status ( 1- Fundable, 2-NotFundable,3-External)');
    // for(let i of updatedArray) {
    //     if(i[priorityLocation] === 1) {
    //         continue;
    //     }
    //     else if(i[priorityLocation] === 2) {
    //         i[priorityLocation] = 0.67;
    //     }
    //     else {
    //         i[priorityLocation] = 0.33;
    //     }
    // }

    //RANKING ALGORITHM

    res.end();

    /*
        checking priorities
        priority 1) within term and fundable 
        check under application status column
        priority 2) passed term and officially fundable
        priority 3) anything else

        sort them into arrays based on priority?

        /*checking priorities for the professor
        Check under columns Q1,Q2,Q3
        using a counter? check the best applicants
    */
})

//function to 
app.post('/api/admin/addCourse', (req, res) => {

})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(5000);
console.log('App is listening on port 5000');







/*
[
  [
    'Course Code',
    'Course Name',
    'Lec hours',
    'Lab/Tutorial hours',
    'No. of Sections'
  ],
  [ 'SE123', 'Java Programming', 3, 2, 1 ],
  [ 'ECE456', 'Data Management', 3, 3, 1 ],
  [ 'ES678', 'Matlab', 3, null, 1 ]
]
*/