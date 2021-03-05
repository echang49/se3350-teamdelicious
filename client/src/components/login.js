import "../styles/style.css";

function AddDescriptions() {
    function handleClick() {
      window.location.href = "/admin/matchTA";
    }
    //code if logged in, redirect to dashboard?
    return (
      <div className="center matchTA">
          <div className="box">
            <p className="title">Login Page</p>
            <label>Username</label>
            <input type="text" />
            <br />
            <label>Password</label>
            <input type="password" />
            <button onClick={() => handleClick()}>Login</button>
            <button onClick={() => handleClick()}>Register</button>
          </div>
      </div>
    );
  }
  
export default AddDescriptions;