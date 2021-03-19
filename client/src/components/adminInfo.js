import { useState } from "react";
import axios from "axios";
import AdminNav from "./adminNav";

function AdminInfo() {
  const [ file, setFile ] = useState();

  async function handleSubmit() {
    const formData = new FormData();
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
    })
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