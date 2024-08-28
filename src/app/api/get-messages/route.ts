import dbconnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request){
    await dbconnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    console.log(user);
    

    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: 'un authorized user',
            },
            {
                status: 401,
            },
        );
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    console.log(userId);
    

    try {
        const foundUser = await UserModel.aggregate([
            {
                $match: {
                    _id:userId,
                },
            },
            {
                $unwind: {
                    path: "$messages",
                    preserveNullAndEmptyArrays: true
                  }
            },
            {
                $sort: {
                    'messages.createdAt': -1
                },
            },
            {
                $group: {
                    _id: '$_id',
                    messages: {
                        $push: '$messages'
                    },
                },
            },
        ]);
            console.log(foundUser);
            
        if (!foundUser || foundUser.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: 'User not found',
                },
                {
                    status: 404,
                },
            );
        }

        return Response.json(
            {
                success: true,
                messages: foundUser[0].messages,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("AN unexpected error occured while getting the messages",error);

        return Response.json(
            {
                success: false,
                message: 'AN unexpected error occured while getting the messages',
            },
            {
                status: 500,
            },
        );
    }
}