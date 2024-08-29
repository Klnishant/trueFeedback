'use client'

import { apiResponse } from "@/types/apiResponse";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { messageSchema } from "@/schemas/messageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
//import { useCompletion } from 'ai/react'

export default function Reviewer(){
    const [message,setMessage] = useState('');
    const [isSending,setIsSending] = useState(false);

    const form = useForm<z.infer<typeof messageSchema>>(
        {
            resolver: zodResolver(messageSchema),
        },
    );

    const params = useParams<{username: string}>();
    const username = params.username;

    console.log(username);
    

    const { toast } = useToast();

    const handleSubmitMessage = async ( data : z.infer<typeof messageSchema>)=> {
        setIsSending(true);
        
        try {
            const response = await axios.post('/api/send-message',{
                username,
                content: data.content,
            });

            console.log(response);
            

            toast(
                {
                    title:response?.data.message,
                },
            );
            setMessage('');
        } catch (error) {
            const axiosError = error as AxiosError<apiResponse>;

            toast(
                {
                    title: "Error",
                    description: axiosError.response?.data.message ??
                    "error in sending message",
                    variant: "destructive"
                }
            );
        } finally {
            setIsSending(false);
        }
    }


    return (
        <div className="flex justify-center mx-auto my-8">
            <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
                <h1 className="text-4xl mb-6 font-bold text-center">
                    Public Profile Link
                </h1>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmitMessage)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem >
                                        <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                                        <FormControl>
                                            <Textarea  {...field} placeholder="Write your anonymous message here" className="resize-none"  />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-center">
                                <Button type="submit" className="px-4 py-2" disabled={ isSending}>Sent</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}