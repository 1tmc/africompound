// src/app/auth/sign-up/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ThemeToggle from '@/components/landingpage/ThemeToggle';
import { processOnboarding } from '../action';
import { Upload } from 'lucide-react';

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'host' | 'tenant'>('host');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [contractMode, setContractMode] = useState<'write' | 'upload'>('write');

  // Form Field State Tracking
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    companyTitle: '', 
    location: '',
    totalRooms: '10',
    contractText: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const totalSteps = role === 'host' ? 3 : 2; 
  const progressValue = (step / totalSteps) * 100;

  async function handleFinalSubmit() {
    setLoading(true);
    setMessage(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    data.append('role', role);
    data.append('contractMode', contractMode);

    const result = await processOnboarding(data);
    setLoading(false);

    if (result?.error) {
      setMessage({ 
        type: 'error', 
        text: typeof result.error === 'string' ? result.error : 'An error occurred during sign up.' 
      });
    } else if (result?.success) {
      setMessage({ 
        type: 'success', 
        text: typeof result.success === 'string' ? result.success : 'Account created successfully!' 
      });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16 bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Floating Theme Toggle */}
      <ThemeToggle />

      <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-8 shadow-xl transition-all max-h-[92vh] overflow-y-auto">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="relative h-12 w-12 mb-3 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Image src="/logo.png" alt="Africompound Logo" fill className="object-cover" priority />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            Africompound<span className="text-[#E03A1D]">.com</span>
          </h1>
        </div>

        {/* Header and Step Indicators */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Step {step} of {totalSteps}</span>
            <span className="text-[#E03A1D]">{Math.round(progressValue)}% Complete</span>
          </div>
          <Progress value={progressValue} className="h-1.5 bg-zinc-100 dark:bg-zinc-800 [&>div]:bg-[#E03A1D]" />
        </div>

        {message && (
          <div className={`mb-6 p-3.5 text-xs font-semibold rounded-xl border ${
            message.type === 'error' 
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
          }`}>
            {message.text}
          </div>
        )}

        {/* STEP 1: Core Profile Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Personal Information</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Let&apos;s get your profile set up on Africompound.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">First Name</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Kofi" className="rounded-xl border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Mensah" className="rounded-xl border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Account Role Type</Label>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setRole('host')}
                  className={`p-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    role === 'host' 
                      ? 'border-[#E03A1D] bg-[#E03A1D]/10 text-[#E03A1D]' 
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
                  }`}
                >
                  Property Owner
                </button>
                <button
                  type="button"
                  onClick={() => setRole('tenant')}
                  className={`p-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    role === 'tenant' 
                      ? 'border-[#E03A1D] bg-[#E03A1D]/10 text-[#E03A1D]' 
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
                  }`}
                >
                  Tenant / Resident
                </button>
              </div>
            </div>

            <Button 
              disabled={!formData.firstName || !formData.lastName} 
              onClick={() => setStep(2)} 
              className="w-full rounded-xl bg-[#E03A1D] text-white hover:bg-[#c22f15] font-bold text-xs py-3 shadow-md shadow-[#E03A1D]/20 transition-all mt-2"
            >
              Continue
            </Button>
          </div>
        )}

        {/* STEP 2: Credentials Security */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Security Credentials</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Choose your secure sign-in variables.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Email Address</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="name@domain.com" className="rounded-xl border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Password</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="rounded-xl border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="w-1/3 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold text-xs">
                Back
              </Button>
              {role === 'host' ? (
                <Button 
                  disabled={!formData.email || formData.password.length < 6} 
                  onClick={() => setStep(3)} 
                  className="w-2/3 rounded-xl bg-[#E03A1D] text-white hover:bg-[#c22f15] font-bold text-xs"
                >
                  Next: Compound Setup
                </Button>
              ) : (
                <Button 
                  disabled={!formData.email || formData.password.length < 6 || loading} 
                  onClick={handleFinalSubmit} 
                  className="w-2/3 rounded-xl bg-[#E03A1D] text-white hover:bg-[#c22f15] font-bold text-xs"
                >
                  {loading ? "Registering..." : "Submit Account"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Property Setup (Only for Owners) */}
        {step === 3 && role === 'host' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">First Compound Setup</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure your first property. You can modify these settings later.</p>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="companyTitle" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Compound Name</Label>
              <Input id="companyTitle" name="companyTitle" value={formData.companyTitle} onChange={handleInputChange} placeholder="Bismark House" className="rounded-xl border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950" />
              {formData.companyTitle && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  Workspace Link: {formData.companyTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.africompound.vercel.app
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">City / Location</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="Accra, Ghana" className="rounded-xl border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="totalRooms" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Available Rooms</Label>
                <Input id="totalRooms" name="totalRooms" type="number" min="1" value={formData.totalRooms} onChange={handleInputChange} placeholder="10" className="rounded-xl border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950" />
              </div>
            </div>

            {/* Optional Tenancy Agreement Section */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Tenancy Agreement <span className="text-[10px] font-normal text-zinc-400">(Optional)</span></span>
                <div className="flex rounded-lg bg-zinc-200/60 dark:bg-zinc-800 p-0.5">
                  <button type="button" onClick={() => setContractMode('write')} className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold transition-all ${contractMode === 'write' ? 'bg-[#E03A1D] text-white' : 'text-zinc-500'}`}>Write</button>
                  <button type="button" onClick={() => setContractMode('upload')} className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold transition-all ${contractMode === 'upload' ? 'bg-[#E03A1D] text-white' : 'text-zinc-500'}`}>Upload</button>
                </div>
              </div>

              {contractMode === 'write' ? (
                <textarea 
                  name="contractText" 
                  rows={3} 
                  value={formData.contractText} 
                  onChange={handleInputChange} 
                  placeholder="Type baseline rental rules or custom guidelines here..." 
                  className="w-full text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-2.5 outline-none focus:border-[#E03A1D] resize-none text-zinc-900 dark:text-zinc-100" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-4 text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                  <Upload className="h-4 w-4 text-[#E03A1D] mb-1" />
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Select PDF or Word Document template</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="w-1/3 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold text-xs">
                Back
              </Button>
              <Button 
                disabled={!formData.companyTitle || !formData.location || loading} 
                onClick={handleFinalSubmit} 
                className="w-2/3 rounded-xl bg-[#E03A1D] text-white hover:bg-[#c22f15] font-bold text-xs"
              >
                {loading ? "Launching Platform..." : "Launch Platform"}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs font-medium text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="text-[#E03A1D] font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </main>
  );
}