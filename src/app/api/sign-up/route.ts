import dbconnect from "@/lib/dbconnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbconnect();

    try {
        const {username,email,password} = await request.json();

        console.log(username,email,password);
        

        const existingVerifiedUserByUsername = await UserModel.findOne({
            username,
            isverified: true
        });

        console.log(existingVerifiedUserByUsername);
        

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
        console.log(existingUserByEmail);
        
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(verifyCode);
        

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
                const hashPassword = (await bcrypt.hash(password,10)).toString();
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

            const newUser = await new UserModel({
                username,
                email,
                password:(await hashPassword).toString(),
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isverified: false,
                isAcceptingMessage: true,
                messages: [],
            });
            
            console.log(newUser);
            
            await newUser.save();
        }

        // send verification email

        const emailResponse = await sendVerificationEmail(
            username,
            email,
            verifyCode
        );
            console.log(emailResponse.message);
            
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