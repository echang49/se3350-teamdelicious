import { useState } from "react";
import axios from "axios";
import AdminNav from "./adminNav";
import readXlsxFile from "read-excel-file";

function AdminInfo() {
  const [file, setFile] = useState();

  async function handleSubmit() {
    const formData = new FormData();
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
      axios.post('/api/admin/sendApplicants', data)
        .then((res) => {
          let result = JSON.stringify(res.data);
          alert("working");
        })
        .catch((err) => {
          alert("Failure. :(")
        });
    }
    else {
      alert("Files must either be csv, xls, or xlsx file format.");
    }
    /*
    formData.append("excel", file);
    axios({
      method: "POST",
      url: "/api/admin/sendApplicants",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
      .then((res) => {
        //let result = JSON.stringify(res.data);
        alert("DONE")
      })
      .catch((err) => {
        alert(err);
      })*/
  }

  return (
    <div>
      <AdminNav />
      <div className="center matchTA">
        <div className="box">
          <p className="title"><strong>Upload Applicant Info</strong></p>
          <label>File</label>
          <input onChange={(event) => setFile(event.target.files[0])} type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
          <button onClick={() => handleSubmit()}>Upload</button>
        </div>
      </div>
    </div>
  );
}

export default AdminInfo;