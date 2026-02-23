import { AuthPublicAPI } from "./auth";
import { redirectToSelfService } from "../util";

const keyUser = "authx.user";


function setSession(user: any) {
  localStorage.setItem(keyUser, JSON.stringify(user));
}

async function getSession() {
  let session: any = {};
  let user: any = {};
  try {
    session = await AuthPublicAPI.toSession();
    if (session?.status === 200) {
      const newUser = session?.data.identity;
      const username = newUser.traits.email.split("@")[0];
      user = {
        id: newUser.id,
        username: username,
        email: newUser.traits.email,
        password: "", // You may want to set a default password or leave it empty
        firstname: newUser.traits.name.first,
        lastname: newUser.traits.name.last,
      };
      setSession(user);
    }
  } catch (error) {
    console.log("Sessioin er", error);
  }
  return user;
  // const user:any = localStorage.getItem(keyUser);

  // return JSON.parse(user);
}

async function isAuth() {
  return !!(await getSession());
}

async function logout() {
  return new Promise<void>((resolve) => {
    // Using setTimeout to simulate network latency.
    setTimeout(async () => {
      try {
        const logoutflow = await AuthPublicAPI.createBrowserLogoutFlow();
        // Make a GET request to the logout URL
        const response = await fetch(logoutflow.data.logout_url, {
          method: "GET",
          credentials: "include", // Include credentials for session management
        });

        // Check if the logout request was successful
        if (response.status === 200) {
          localStorage.removeItem(keyUser);
        } else {
          // Handle logout error if needed
          console.error("Logout request failed");
        }
      } catch (error) {
        console.error("Error during logout:", error);
        redirectToSelfService("/self-service/login/browser");
        // Handle any errors during logout if needed
      }
      resolve();
    }, 1000);
  });
}


// The useAuth hook is a wrapper to this service, make sure exported functions are also reflected
// in the useAuth hook.
export { getSession, isAuth, logout };
