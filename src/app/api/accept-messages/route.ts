import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbconnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request){

    await dbconnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: 'Not Authenticated',
            },
            {
                status: 401,
            },
        );
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessage: acceptMessages},
            {new: true},
        );

        if (!updateUser) {
            return Response.json(
                {
                    success: false,
                    message: 'unable to find user to update message acceptance',
                },
                {
                    status: 400,
                },
            );
        }

        return Response.json(
            {
                success: true,
                message: 'update message acceptance successfully',
            },
            {
                status:200,
            },
        );
    } catch (error) {
        console.error('Error updating message acceptance',error);

        return Response.json(
            {
                success: false,
                message: 'Error updating message aceptance',
            },
            {
                status: 500,
            },
        );
    }
}

export async function GET(request: Request){
    await dbconnect();

    const session = await getServerSession(authOptions);
    const user = session?.user

    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: 'Not Authenticated',
            },
            {
                status: 401,
            },
        );
    }

    try {
        const foundUser = await UserModel.findById(user?._id);

        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: 'User not found',
                },
                {
                    status: 400
                },
            );
        }

        return Response.json(
            {
                success: true,
                isAcceptingMessages: user.isAcceptingMessage,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error('Error reteriving message acceptance status',error);

        return Response.json(
            {
                success: false,
                message: 'Error reteriving message acceptance status',
            },
            {
                status: 500,
            },
        );
    }
}