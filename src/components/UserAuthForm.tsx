"use client";
import { useState } from "react";
import Link from "next/link";
import { FC } from "react";
import { Input } from "./ui/Input";
import { Icons } from "./Icons";
import { Button } from "./ui/Button";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import {
  credentialType,
  registerCredentialType,
} from "@/lib/validators/credentials";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FormSubmitHandler } from "@/types/events";
import { Eye, EyeOff } from "lucide-react";

interface UserAuthFormProps {
  signupPage?: boolean;
}
const UserAuthForm: FC<UserAuthFormProps> = ({ signupPage }) => {
  const { toast } = useToast();
  const [name, setName] = useState<{
    firstname: string;
    lastname: string;
  }>({
    firstname: "",
    lastname: "",
  });
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoadingEmail, setIsLoadingEmail] = useState<boolean>(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();

  const registerWithCredentials: FormSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoadingEmail(true);
    try {
      if (!email || !password || !name.firstname || !name.lastname) {
        return toast({
          title: "Invlid Input",
          description: "You haved not entered all fields",
          variant: "destructive",
        });
      }

      const payload: registerCredentialType = {
        email,
        password,
        firstname: name.firstname,
        lastname: name.lastname,
      };

      await axios.post("/api/auth/register", payload);

      setIsLoadingEmail(false);

      toast({
        title: "User Account Created Successfully",
        description: "Login to Access you account",
      });

      router.push("/sign-in");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 422) {
          return toast({
            title: "Error Signing Up",
            description: error.response?.data,
            variant: "destructive",
          });
        }
        if (error.response?.status === 400) {
          return toast({
            title: "Bad Request",
            description: error.response?.data,
            variant: "destructive",
          });
        }
      }

      return toast({
        title: "Error Signing Up",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const loginWithCredentials: FormSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoadingEmail(true);
    try {
      const payload: credentialType = { email, password };
      if (!email || !password) {
        return toast({
          title: "Invlid Input",
          description: "You haved not entered all fields",
          variant: "destructive",
        });
      }

      const res = await signIn(`credentials`, {
        ...payload,
        redirect: false,
      });

      if (res?.error) {
        return toast({
          title: "Error Signing Up",
          description: res?.error,
          variant: "destructive",
        });
      }

      router.refresh();
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 400 || error.response?.status === 401) {
          return toast({
            title: "Error Signing Up",
            description: error.response?.data,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Error Login in",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEmail(false);
    }
  };
  const loginWithGoogle = async () => {
    setIsLoadingGoogle(true);
    try {
      await signIn(`google`, {
        redirect: false,
      });
    } catch (error) {
      toast({
        title: "Error Login in",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleSetName = (name: string, value: string) => {
    setName((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <form
        onSubmit={!signupPage ? loginWithCredentials : registerWithCredentials}
        className="mt-6 flex flex-col space-y-3"
      >
        {signupPage ? (
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="w-full">
              <label className="block text-gray-700 text-sm pb-2">
                First Name
              </label>
              <Input
                value={name.firstname}
                name="firstname"
                onChange={(e) => handleSetName(e.target.name, e.target.value)}
                type="text"
                placeholder="First Name"
              />
            </div>
            <div className="w-full">
              <label className="block text-gray-700 text-sm pb-2">
                Last Name
              </label>
              <Input
                name="lastname"
                value={name.lastname}
                onChange={(e) => handleSetName(e.target.name, e.target.value)}
                type="text"
                placeholder="Last Name"
              />
            </div>
          </div>
        ) : null}
        <div
          className={`  ${
            signupPage
              ? "flex flex-col lg:flex-row  gap-4 items-center justify-between"
              : "space-y-3"
          }`}
        >
          <div className="w-full">
            <label className="block text-gray-700 text-sm pb-2">
              Email Address
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@email.com"
            />
          </div>

          <div className={`${!signupPage ? "" : "w-full"}`}>
            <label className="block text-gray-700 text-sm pb-2">Password</label>
            <div className="flex gap-1  border border-slate-200 rounded-lg">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className=" border-0"
              />
              <button
                type="button"
                className="bg-slate-100 p-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {!showPassword ? <Eye /> : <EyeOff />}
              </button>
            </div>
          </div>
        </div>

        <div className="text-right mt-2">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-gray-700 hover:text-zinc-700 focus:text-zinc-700 underline underline-offset-3"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          isLoading={isLoadingEmail}
          size="lg"
          className="w-full"
          type="submit"
        >
          {signupPage ? "Sign Up" : "Sign In"}
        </Button>
      </form>

      <hr className="my-6 border-gray-300 w-full" />

      {/*<Button
        size="lg"
        isLoading={isLoadingGoogle}
        onClick={loginWithGoogle}
        className="w-full"
      >
        {isLoadingGoogle ? null : <Icons.google className="h-4 w-4 mr-2" />}
        <span className="ml-4">Log in with Google</span>
      </Button>*/}
    </div>
  );
};

export default UserAuthForm;
