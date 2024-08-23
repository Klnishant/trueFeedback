import dbconnect from "@/lib/dbconnect";
import UserModel from "@/model/User";

export async function POST(requst: Request){
    await dbconnect();

    try {
        const { username,code } = await requst.json();
        const decodeusername = decodeURIComponent(username);

        const user = await UserModel.findOne({
            username:decodeusername,
        });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: 'user not find',
                },
                {
                    status:404,
                },
            );
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isverified = true;
            user.save();

            return Response.json(
                {
                    success: true,
                    message: 'verify code successfully',
                },
                {
                    status:200,
                },
            );
        }

        if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: 'verify code expires',
                },
                {
                    status:400,
                },
            );
        }
        else{
            return Response.json(
                {
                    success: false,
                    message: 'invalid verify code',
                },
                {
                    status:400,
                },
            );
        }
    } catch (error) {
        console.error('Error verify code',error);

        return Response.json(
            {
                success: false,
                message: 'error while verify code',
            },
            {
                status:500,
            },
        );
    }
}