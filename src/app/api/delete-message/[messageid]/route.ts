import { apiResponse } from "@/types/apiResponse";
import UserModel from "@/model/User";
import { Message } from "@/model/User";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import dbconnect from "@/lib/dbconnect";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function DELETE(
    request: Request,
    {params} : {params:{messageid: string}}
){
    const messageid = params.messageid;
    await dbconnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not Authenticated",
        },
        {
            status:401,
        },
    );
    }

    try {
        const updateResult = await UserModel.updateOne(
            {
                _id:user._id,
            },
            {
                $pull:{
                    messages: {
                        _id: messageid
                    },
                },
            },
        );

        if (updateResult.modifiedCount === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Message not found or already deleted",
                },
                {
                    status: 404,
                },
            );
        }

        return Response.json(
            {
                success: true,
                message: "Message deleted successfully",
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("Error deleting message",error);

        return Response.json(
            {
                success: false,
                message: "Error deleting message",
            },
            {
                status: 500,
            },
        );
    }
}