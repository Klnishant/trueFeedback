import UserModel from "@/model/User";
import dbconnect from "@/lib/dbconnect";
import { Message } from "@/model/User";

export async function POST(request: Request){
    await dbconnect();

    const { username,content } = await request.json();

    try {
        const user = await UserModel.findOne({username}).exec();

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: 'user not found',
                },
                {
                    status: 404,
                },
            );
        }

        if (!user.isAcceptingMessage) {
            return Response.json(
                {
                    success: false,
                    message: 'user not accepting messages',
                },
                {
                    status: 404,
                },
            );
        }

        const newMessage = {content, createdAt: new Date()};

        user.messages.push(newMessage as Message);
        user.save();

        return Response.json(
            {
                success: true,
                message: 'Message sent successfully',
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error("Error occured while sent new message",error);

        return Response.json(
            {
                success: false,
                message: 'Error occured while sent new message',
            },
            {
                status: 500,
            },
        );
    }
}