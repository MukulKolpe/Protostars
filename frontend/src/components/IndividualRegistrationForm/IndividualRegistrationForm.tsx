import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleProvider } from "@particle-network/provider";
import { User } from "lucide-react";
import { ethers } from "ethers";
import { Toaster } from "react-hot-toast";
import SkillVerifyAbi from "../../utils/skillverify.json";
import Router from "next/router";
import TransactionStatus from "../RegistrationTransactionStatus/IndividualTransactionStatus";

interface FormData {
  email: string;
  linkedin: string;
  github: string;
}

interface TransactionState {
  isOpen: boolean;
  isLoading: boolean;
  txHash: string;
  error: Error | null;
}

export default function IndividualRegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    linkedin: "",
    github: "",
  });

  const [transactionState, setTransactionState] = useState<TransactionState>({
    isOpen: false,
    isLoading: false,
    txHash: "",
    error: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTransactionState({
      isOpen: true,
      isLoading: true,
      txHash: "",
      error: null,
    });

    try {
      if (window.ethereum._state.accounts.length !== 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_SKILLVERIFY_ADDRESS!,
          SkillVerifyAbi,
          signer
        );

        const accounts = await provider?.listAccounts();

        const tx = await contract.registerUser(
          accounts[0],
          formData.linkedin,
          formData.github,
          formData.email
        );

        setTransactionState((prev) => ({
          ...prev,
          isLoading: true,
          txHash: tx.hash,
        }));

        await tx.wait(1);

        setTransactionState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      } else {
        // @ts-ignore
        const particleProvider = new ParticleProvider(particle.auth);
        const accounts = await particleProvider.request({
          method: "eth_accounts",
        });
        const ethersProvider = new ethers.providers.Web3Provider(
          particleProvider,
          "any"
        );
        const signer = ethersProvider.getSigner();

        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_SKILLVERIFY_ADDRESS!,
          SkillVerifyAbi,
          signer
        );

        const tx = await contract.registerUser(
          accounts[0],
          formData.linkedin,
          formData.github,
          formData.email
        );

        setTransactionState((prev) => ({
          ...prev,
          isLoading: true,
          txHash: tx.hash,
        }));

        await tx.wait(1);

        setTransactionState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error: any) {
      console.error(error);
      setTransactionState((prev) => ({
        ...prev,
        isLoading: false,
        error,
      }));
    }
  };

  const handleClose = () => {
    setTransactionState({
      isOpen: false,
      isLoading: false,
      txHash: "",
      error: null,
    });
    if (transactionState.txHash) {
      Router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <Card className="w-full max-w-2xl bg-zinc-800/80 backdrop-blur-md border-zinc-700/50 shadow-xl text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/30 via-zinc-700/10 to-transparent pointer-events-none"></div>
        <CardHeader className="relative">
          <CardTitle className="text-3xl font-bold text-center text-white">
            Individual Registration
          </CardTitle>
          <CardDescription className="text-center text-zinc-300">
            Register as an individual on SkillSphere
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-lg">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                className="bg-black text-white border-zinc-600 placeholder-zinc-400 text-lg"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-white text-lg">
                LinkedIn Profile URL
              </Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                placeholder="https://www.linkedin.com/in/yourprofile"
                required
                className="bg-black text-white border-zinc-600 placeholder-zinc-400 text-lg"
                value={formData.linkedin}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github" className="text-white text-lg">
                GitHub Profile URL
              </Label>
              <Input
                id="github"
                name="github"
                type="url"
                placeholder="https://github.com/yourusername"
                required
                className="bg-black text-white border-zinc-600 placeholder-zinc-400 text-lg"
                value={formData.github}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-zinc-600 text-white transition-all duration-300 hover:border-[#7B3FE4] hover:text-[#7B3FE4] hover:scale-105"
                onClick={() => Router.push("/register")}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-zinc-700 text-white relative overflow-hidden transition-all duration-300 hover:bg-[#7B3FE4] hover:scale-105 hover:shadow-lg hover:shadow-[#7B3FE4]/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#7B3FE4]/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500"
              >
                Register as Individual
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <TransactionStatus
        isOpen={transactionState.isOpen}
        isLoading={transactionState.isLoading}
        txHash={transactionState.txHash}
        error={transactionState.error}
        onClose={handleClose}
        formData={formData}
      />
    </div>
  );
}
