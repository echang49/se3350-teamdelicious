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
app.use(bodyParser.urlencoded({extended: true}));

//ROUTES
function findColumn(json, name) {
    for(let i in json[0]) {
        if(json[0][i] === name) {
            return i;
        }
    }
    return undefined;
}

app.post('/api/admin/matchTA',(req,res)=> {
    const { applicantJSON, coursesJSON } = req.body;  

    //check STD-13
    let acceptedIndividuals = [];
    let courseLocation = [findColumn(applicantJSON, 'Course Code'), findColumn(coursesJSON, 'Course Code')];
    if(courseLocation[0] === undefined || courseLocation[1] === undefined) {
        //excel file does not specify course codes and therefore we cannot process it
        return res.end();
    }
    for(let i of applicantJSON) {
        for(let j of coursesJSON) {
            if(j[courseLocation[1]] === i[courseLocation[0]]) {
                acceptedIndividuals.push(i);
                break;
            }
        }
    }
    //first row is headers
    acceptedIndividuals.shift();
    console.log(acceptedIndividuals);
    
    //check STD-14
    

    //check STD-15
    let priorityLocation = [findColumn(applicantJSON, 'Applicant status ( 1- Fundable, 2-NotFundable,3-External)')];
    
    //check STD-16
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
app.post('/api/admin/addCourse', (req,res)=>{

})

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
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