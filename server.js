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

//function to 
app.post('/api/admin/addCourse', (req, res) => {

})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(5000);
console.log('App is listening on port 5000');







//console.log(distributeTAs(acceptedIndividuals, coursesJSON));

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