'use client'

import { apiResponse } from "@/types/apiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError} from "axios";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import * as z from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import { useToast } from "@/components/ui/use-toast";
import { Form,
     FormField,
     FormItem, 
     FormLabel, 
     FormControl, 
     FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function verifyAccount(){
    const router = useRouter();
    const params = useParams<{username: string}>();
    const {toast} = useToast();

    const form = useForm<z.infer <typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
    });

    const onSubmit = async (data: z.infer<typeof verifySchema>)=>{
        try {
            const response = await axios.post(`/api/verify-code`,{
                username: params.username,
                code: data.code,
            });

            toast({
                title:'success',
                description:response?.data.message,
            });

            router.replace('/sign-in')
        } catch (error) {
            const AxiosError = error as AxiosError<apiResponse>;

            toast({
                title:'verification failed',
                description: AxiosError.response?.data.message ??
                'An error occured please try again',
                variant: 'destructive',
            });
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Verify Your Account
                    </h1>
                    <p className="mb-4">
                        Enter The Verification Code Sent To Your Email
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                     <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input  {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">Verify</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}