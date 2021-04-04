import { useState } from "react";
import axios from "axios";
import ProfNav from "./profNav";
import readXlsxFile from "read-excel-file";

function ProfInfo() {
  const [file, setFile] = useState();

  async function handleSubmit() {
    let xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    let xls = "application/vnd.ms-excel";
    let csv = ".csv";

    if (file === undefined) {
      alert("Please enter a file.");
      return;
    }

    if (file.type === xlsx || file.type === xls || file === csv) {
      let applicantJSON = await readXlsxFile(file);
      let data = {
        applicantJSON: applicantJSON
      };
      axios.post('/api/professor/sendRankings', data)
        .then((res) => {
          alert("Done");
        })
        .catch((err) => {
          alert("Failure. :(")
        });
    }

    else {
      alert("Files must either be csv, xls, or xlsx file format.");
    }
  }

  async function handleDownload() {
    axios.get('/api/professor/getInfo')
    .then((res) => {
      //console.log(res.data);
      //alert("DONE")
      //window.open('/api/professor/getInfo');
    })
  }

  //Rank TA front end for uploading rankings
  return (
    <div>
      <ProfNav />
      <div className="center matchTA">
        <div className="box">
          <p className="title"><strong>Upload Professor Rankings</strong></p>
          <label>File</label>
          <input onChange={(event) => setFile(event.target.files[0])} type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
          <button onClick={() => handleSubmit()}>Upload</button>
          <p className="title"><strong>Download Professor Rankings</strong></p>
          <button onClick={() => handleDownload()}>Download</button>
        </div>
      </div>
    </div>
  );
}

export default ProfInfo;