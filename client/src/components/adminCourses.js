import { useRef } from "react";
import axios from "axios";
import AdminNav from "./adminNav";

function AddCourses() {
  const courseRef = useRef();
  const emailRef = useRef();

  function handleSubmit(courseCode, professor) {
    //alert(course + email);
    axios.post('/api/admin/addCourse', {courseCode, professor})
    .then((res) => {
      alert("DONE")
    })
    .catch((err) => {
      alert(err);
    })
  }

  function handleSubmit2() {
    axios.get('/api/admin/getCourseData')
    .then((res) => {
      console.log(res.data);
      alert("DONE");
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////// 
      //DANIELLE PUT LOGIC HERE
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      var courseData = res.data; //array of JSON object
      
      var array = typeof courseData != 'object' ? JSON.parse(courseData) : courseData;
      var str = '';

      for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]){
          if (line != '') line += ","
          line += array[i][index];
        }

        str += line + '\r\n';

      };
      return str;
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
            <p className="title"><strong>Add Course</strong></p>
            <label>Course</label>
            <input type="text" ref={courseRef} />
            <br />
            <label>Professor Email</label>
            <input type="text" ref={emailRef} />
            <button onClick={() => handleSubmit(courseRef.current.value, emailRef.current.value)}>Create</button>
            <hr />
            <p className="title"><strong>Download Courses Spreadsheet</strong></p>
            <button onClick={() => handleSubmit2()}>Download</button>
          </div>
        </div>
    </div>
  );
}

export default AddCourses;