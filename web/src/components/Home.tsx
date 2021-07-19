import { useState } from "react";
import { Redirect } from "react-router-dom";

const Home = () => {
  const [nameInput, setNameInput] = useState<string>("");
  const [redirect, setRedirect] = useState<boolean>(false);

  if (redirect) return <Redirect to="/games" />;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (nameInput.trim().length) {
            localStorage.setItem("config", JSON.stringify({ name: nameInput }));
            setRedirect(true);
          }
        }}
      >
        <label>name</label>
        <input
          type="text"
          placeholder="name"
          defaultValue={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Home;
