import { auth, rtDb } from "@/app/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { NextResponse } from "next/server";

export async function POST (request : Request) {
    try {
        const body = await request.json();
        const {username, email, password} = body;

        if (!username || !email || !password) {
            return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status : 400 });
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const newUser = {
            "_id" : user.uid,
            "username" : username,
            "email" : email,
            "affiliation" : "",
            "roles" : [],
            "created_at" : new Date().toISOString()
        };

        await set(ref(rtDb, `users/${user.uid}`), newUser);

        return NextResponse.json ({
            message : "Dăng kí thành công!",
            user : newUser
        }, { status : 201 });
    }
    catch (error : any) {
        let message = error.message;
        if (error.code === 'auth/email-already-in-use') message = "Email này đã được sử dụng";
        if (error.code === 'auth/weak-password') message = "Mật khẩu phải ít nhất 6 ký tự";

        return NextResponse.json({ error : message}, { status : 400 });
    }
}