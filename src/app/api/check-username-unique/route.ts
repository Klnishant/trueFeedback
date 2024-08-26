import dbconnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const usernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET (request: Request){
    await dbconnect();

    try {
        const {searchParams} = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username')
        };

        const result = usernameQuerySchema.safeParse(queryParams);

        if (!result.success) {
            const usernameError = result.error.format().username?._errors || [];

            return Response.json(
                {
                    success: false,
                    message: 
                        usernameError?.length>0
                        ?usernameError.join(', ')
                        :'invalid query parameters',
                },
                {
                    status:400,
                },
            );
        }

        const {username} = result.data

        const existingVerifiedUser = await UserModel.findOne({
            username,
            isverified: true,
        });

        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: 'Username already taken'
                },
                {
                    status:400,
                },
            );
        }

        return Response.json(
            {
                success: true,
                message: 'username is unique',
            },
            {
                status:200,
            },
        );
    } catch (error) {
        console.error('Error checking username',error);

        return Response.json(
            {
                success: false,
                message: 'Error checking username',
            },
            {
                status: 500,
            },
        );
    }
}