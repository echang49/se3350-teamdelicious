import "../styles/style.css";
import AdminNav from "./adminNav";
import { useState } from "react";
import readXlsxFile from "read-excel-file";
import axios from "axios";

function MatchingTA() {

    const [taList, setTAList] = useState(undefined);
    const [applicantList, setApplicantList] = useState(undefined);
    const [bool, setBool] = useState(true);
    const [data, setData] = useState([{}]);
    
    async function handleSubmit() {
        let xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        let xls = "application/vnd.ms-excel";
        let csv = ".csv";
        if(taList === undefined || applicantList === undefined) {
            alert("Please enter a file.");
            return;
        }
        if((taList.type === xlsx || taList.type === xls || taList === csv) && (applicantList.type === xlsx || applicantList.type === xls || applicantList === csv)) {
            let applicantJSON = await readXlsxFile(applicantList);
            let coursesJSON = await readXlsxFile(taList);
            let data = {
                applicantJSON: applicantJSON,
                coursesJSON: coursesJSON
            };
            axios.post('/api/admin/matchTA', data)
                .then((res) => {
                    let result = res.data;
                    console.log(result);
                    setBool(false);
                    setData(result);
                })
                .catch((err) => {
                    alert("Failure. :(")
                });
        }
        else {
            alert("Files must either be csv, xls, or xlsx file format.");
        }
    }

    function handleChange(number, file) {
        if(number === 1) {
            setTAList(file);
        }
        else {
            setApplicantList(file);
        }
    }

    return (
        <div>
            <AdminNav />
            {
                bool ? 
                    <div className="matchTA">
                        <div className="box">
                            <p className="title"><strong>Matching TA Page</strong></p>
                            <div className="upload">
                                <label htmlFor="courseList">Upload the Course List:</label>
                                <input onChange={(event) => handleChange(1, event.target.files[0])} id="courseList" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                            </div>
                            <div className="upload">
                                <label htmlFor="applicantList">Upload the Applicant List:</label>
                                <input onChange={(event) => handleChange(2, event.target.files[0])} id="applicantList" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                            </div>
                            <div>
                                <button onClick={() => handleSubmit()}>Submit</button> 
                            </div>
                        </div>
                    </div>
                :
                    <div className="center matchTA">
                        <div className="box">
                        <p className="title"><strong>Matching TA Results</strong></p>
                        {
                            data.map((item, index) => (
                                <div className="result">
                                    <p>Course Code: {item.courseCode}</p>
                                    <p>Hours To Fill: {item.hoursToFill}</p>
                                    <p>TA's: </p>
                                    {
                                        item.TAs.map((ta) => (
                                            <p className="pl-50">{ta}</p>
                                        ))
                                    }
                                </div>
                            ))
                        }
                        </div>
                    </div>
            }
        </div>
    );
  }
  
export default MatchingTA;