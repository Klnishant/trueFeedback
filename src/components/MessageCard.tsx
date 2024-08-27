'use client'

import React from "react";
import axios, { AxiosError } from "axios";
import { apiResponse } from "@/types/apiResponse";
import { useRouter } from "next/navigation";
import { Message } from "@/model/User";
import { useToast } from "./ui/use-toast";
import { 
    Card,
    CardContent,
    CardHeader, 
    CardTitle
 } from "./ui/card";
import {
        AlertDialog,
        AlertDialogAction, 
        AlertDialogCancel, 
        AlertDialogContent, 
        AlertDialogDescription, 
        AlertDialogFooter, 
        AlertDialogHeader, 
        AlertDialogTitle, 
        AlertDialogTrigger
    } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import dayjs from "dayjs";

type MessageCardProps = {
    message: Message,
    onMessageDelete: (messageId: string)=> void,
};

function MessageCard({message,onMessageDelete}:MessageCardProps){
    const { toast } = useToast();

    const handleDeleteConfirm = async ()=>{
        try {
            const response = await axios.delete<apiResponse>(`/api/delete-message/${message._id}`);
            
            toast({
                title: response?.data.message,
            });

            const messageId: string = message._id as string;
            onMessageDelete(messageId);
        } catch (error) {
            const axiosError = error as AxiosError<apiResponse>;

            toast({
                title:'Error',
                description: axiosError.response?.data.message ??
                'Failed to delete message',
                variant:'destructive',
            });
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{message.content}</CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <X className="w-5 h-5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete
                                this message
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <div className="text-sm">
                    {dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
                </div>
            </CardHeader>
            <CardContent>
            </CardContent>
        </Card>

    );
}

export default MessageCard;