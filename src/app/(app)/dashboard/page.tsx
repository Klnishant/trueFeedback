'use client'

import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { apiResponse } from "@/types/apiResponse";
import { useToast } from "@/components/ui/use-toast";
import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { AcceptMessageSchema } from "@/schemas/acceptMessageShema";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { Message } from "@/model/User";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCcw } from "lucide-react";
import MessageCard from "@/components/MessageCard";

function UserDashboard(){
    const [messages,setMessage] = useState<Message[]>([]);
    const [isLoading,setIsLoading] = useState(false);
    const [isSwitchLoading,setIsSwitchLoading] = useState(false);

    const {toast} = useToast();

    const handleDeleteMessage = (messageId: string)=> {
        setMessage(messages.filter((message)=> message._id != messageId));
    }

    const {data: session} = useSession();
    const form = useForm({
        resolver: zodResolver(AcceptMessageSchema),
    });

    const {register,watch,setValue} = form;
    const acceptMessages = watch('acceptMessages');

    const fetchAcceptMessages = useCallback( async ()=>{
        setIsSwitchLoading(true);

        try {
            const response = await axios.get('/api/accept-messages');
            setValue('acceptMessages',response?.data.isAcceptingMessages);
        } catch (error) {
            const axiosError = error as AxiosError<apiResponse>;

            toast({
                title: 'Error',
                description: axiosError.response?.data.message ??
                'Faled to fetch message seting',
                variant: 'destructive',
            });
        } finally {
            setIsSwitchLoading(false);
        }
    },[setValue]);

    const fetchMessage = useCallback(
        async (refresh: boolean = false)=>{
            setIsLoading(true);
            setIsSwitchLoading(false);

            try {
                const response = await axios.get('/api/get-messages');
                setMessage(response?.data.messages || []);

                if (refresh) {
                    toast({
                        title: "Refreshed Messages",
                        description: "showing latest messages",
                    });
                }
            } catch (error) {
                const axiosError = error as AxiosError<apiResponse>;

                toast({
                    title: "Error",
                    description: axiosError.response?.data.message ??
                    'Failed to fetch messages',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
                setIsSwitchLoading(false);
            }
        },
        [setIsLoading,setMessage]
    );

    useEffect(()=>{
        if (!session || !session.user) {
            return;
        }

        fetchAcceptMessages();
        fetchMessage();
    },[session,fetchAcceptMessages,fetchMessage]);

    const handleSwitch = async ()=> {
        try {
            const response = await axios.post('/api/accept-messages',{
                acceptMessages: !acceptMessages
            });
            setValue('acceptMessages', !acceptMessages);
            toast({
                title: response?.data.message
            });
        } catch (error) {
            const axiosError = error as AxiosError<apiResponse>;

            toast({
                title: "Error",
                description: axiosError.response?.data.message ??
                "Failed to update message setting",
                variant: "destructive",
            });
        }
    }

    if (!session || !session.user) {
        return (
            <div></div>
        );
    }

    const {username} = session?.user as User;

    const baseurl = `${window.location.protocol}//${window.location.host}`;
    const profileurl = `${baseurl}/u/${username}`

    const copyToClipboard = ()=>{
        navigator.clipboard.writeText(profileurl);

        toast({
            title: "URL Copied",
            description: "profile URL has been copied to clipboard",
        });
    }

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">
                User Dashboard
            </h1>
            <div className="mb-4">
                <h2  className="text-lg font-semibold mb-2">
                    Copy Your Unique Link
                </h2>{' '}
                <div className="flex items-center">
                    <input
                     type="text"
                     value={profileurl}
                     disabled
                     className="input input-bordered w-full p-2 mr-2" 
                    />
                    <Button onClick={copyToClipboard}>
                        Copy
                    </Button>
                </div>
            </div>
            <div className="mb-4">
                <Switch
                 {...register('acceptMessages')}
                 checked={acceptMessages}
                 onCheckedChange={handleSwitch}
                 disabled={isSwitchLoading} 
                />
                <span>
                    Accept Messages: {acceptMessages ? 'On' : 'Off'}
                </span>
            </div>
            <Separator />
            <Button
             variant="outline"
             onClick={(e)=>{
                e.preventDefault();
                fetchMessage(true);
             }}
             className="mt-4"
            >
                {
                    isLoading ? (<Loader2 />) :
                    (<RefreshCcw />)
                }
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {
                    messages.length > 0 ? (
                        messages.map((message,index)=>(
                            <MessageCard
                                key={index}
                                message={message}
                                onMessageDelete={handleDeleteMessage}
                            />
                        ))
                    ) : (
                        <p className="flex justify-center items-center">
                            No Messages To Display
                        </p>
                    )
                }
            </div>
        </div>
    )
}

export default UserDashboard;