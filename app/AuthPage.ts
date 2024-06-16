import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Locale from "./locales";
import { isNonEmptyString } from "./utils/calcu";
import { Path } from "./utils/constant";
import { useActivityStore } from "./utils/store";

export function AuthPage() {
  const navigate = useNavigate();
  const goHome = () => navigate(Path.Home);
  const [username, setUsername] = useState();
  const storeUsername = useActivityStore((state) => state.setUsername);

  function checkUsername() {
    if(!isNonEmptyString(username)) return false;
    storeUsername(username);
    goHome();
  }

    return (
        <div>
        please set an username 
            <input type="text"
            placeholder={Locale.Settings.Access.Google.ApiKey.Placeholder}
            value={username}
            onChange={(e) => {
                setUsername(e.currentTarget.value),
              );
            }}
          />
            <Button onClick={checkUsername}>{Locale.Auth.Later}</Button>
        </div>
    );
}