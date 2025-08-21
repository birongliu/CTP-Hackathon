import { useLocation } from "react-router-dom";
import SignInForm from "../components/SignInForm";
import SignUpForm from "../components/SignUpForm";

function SignPage() {
  const location = useLocation();
  const isSignIn = location.pathname === '/signin';

  return (
    <div>
      {isSignIn ? <SignInForm /> : <SignUpForm />}
    </div>
  );
}

export default SignPage