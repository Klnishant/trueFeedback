import dbconnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbconnect();

    try {
        const {username,email,password} = await request.json();

        const existingVerifiedUserByUsername = await UserModel.findOne({
            username,
            isverified: true
        });

        if (existingVerifiedUserByUsername) {
            return Response.json({
                success: false,
                message: "username already taken",
            },
        {
            status:400
        });
        }

        const existingUserByEmail = await UserModel.findOne({email});
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail?.isverified) {
                return Response.json({
                    success: false,
                    message: "email already taken",
                },
            {
                status:400
            });
            }
    
            else{
                const hashPassword = bcrypt.hash(password,10);
                existingUserByEmail.password = hashPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                existingUserByEmail?.save()
            }
        }

        else{
            const hashPassword = bcrypt.hash(password,10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password:hashPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isverified: false,
                isAcceptingMessage: true,
                messages: [],
            });
            
            await newUser.save();
        }

        // send verification email

        const emailResponse = await sendVerificationEmail(
            username,
            email,
            verifyCode
        );

        if(!emailResponse.success){
            return (Response.json({
                success: false,
                message:emailResponse.message
            },
        {
            status: 500
        }));

        }

         return (Response.json({
            success: true,
            message: "user registered successfully. please verify your account",
         },
        {
            status:201
        }));

    } catch (error) {
        console.error("error registering user",error);

        return (Response.json({
            success:false,
            message: 'error registering user'
        },
    {
        status:500
    }));
    }
}