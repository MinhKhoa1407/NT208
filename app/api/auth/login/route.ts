import { auth, rtDb } from "@/app/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { NextResponse } from "next/server";

export async function POST (request : Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status : 400 });
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userRef = (ref(rtDb, `users/${user.uid}`));
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();

            return NextResponse.json({
                message : "Đăng nhập thành công!",
                user : userData
            }, { status : 200 });
        }
        else {
            return NextResponse.json({ error: "Thông tin người dùng không tồn tại trong Database" }, { status: 404 });
        }
    }
    catch (error : any) {
        let message = "Đăng nhập thất bại!";

        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = "Email hoặc mật khẩu không chính xác";
        }

        return NextResponse.json({ error: message }, { status: 401 });
    }
}